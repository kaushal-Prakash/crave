import os
import shutil
import warnings
import logging

# Suppress the noisy AFC (Automatic Function Calling) warning from google-genai
# The warning is emitted via logger.warning() in google_genai.models
warnings.filterwarnings("ignore", message=".*AFC.*")
logging.getLogger("google_genai.models").setLevel(logging.ERROR)

from dotenv import load_dotenv
load_dotenv()

from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from db import load_recipes

# Initialize global variables for our vector DB and chains
vector_store = None
rag_chain = None

def init_chatbot(force_rebuild: bool = False):
    global vector_store, rag_chain
    print("Initializing Crave AI Assistant (RAG Chatbot)...")
    
    # 1. Load data
    recipes = load_recipes()
    documents = []
    
    for r in recipes:
        # Create a document for each recipe
        # 'features' contains title, description, and comments
        content = f"Title: {r['title']}\nDescription: {r['description']}\nFeatures: {r.get('features', '')}"
        
        doc = Document(
            page_content=content,
            metadata={
                "id": r["id"],
                "title": r["title"]
            }
        )
        documents.append(doc)
        
    print(f"Loaded {len(documents)} recipes for Chatbot.")

    # 2. Setup Embeddings and Vector Store
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2")
    
    # Use a local directory to persist Chroma database
    persist_directory = os.path.join(os.path.dirname(__file__), "chroma_db")
    
    # Delete existing DB when force rebuilding (e.g. on /reload)
    if force_rebuild and os.path.exists(persist_directory):
        shutil.rmtree(persist_directory)
        print("Cleared old ChromaDB for rebuild.")
    
    if not os.path.exists(persist_directory):
        vector_store = Chroma.from_documents(
            documents=documents, 
            embedding=embeddings, 
            persist_directory=persist_directory
        )
    else:
        vector_store = Chroma(
            persist_directory=persist_directory,
            embedding_function=embeddings
        )

    # 3. Setup LLM and Chain
    llm = ChatGoogleGenerativeAI(model="gemini-3.6-flash")
    
    system_prompt = (
        "You are 'Crave AI Assistant', a friendly and helpful culinary assistant. "
        "Use the following retrieved context to recommend recipes, suggest dishes, "
        "and help users figure out what to cook based on their ingredients. "
        "If you don't know the answer, just say that you don't know. "
        "Always recommend recipes from the provided context when applicable. "
        "Keep your answers concise and conversational.\n\n"
        "Context: {context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ])
    
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)
        
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})
    
    rag_chain = (
        RunnablePassthrough.assign(context=(lambda x: format_docs(retriever.invoke(x["input"]))))
        | prompt
        | llm
        | StrOutputParser()
    )
    
    print("Crave AI Assistant initialized successfully.")

def get_chat_response(query: str, chat_history: list = None):
    if rag_chain is None:
        init_chatbot()
        
    if chat_history is None:
        chat_history = []
        
    formatted_history = []
    for msg in chat_history:
        if msg.get("role") == "user":
            formatted_history.append(HumanMessage(content=msg.get("content")))
        elif msg.get("role") == "ai":
            formatted_history.append(AIMessage(content=msg.get("content")))

    response = rag_chain.invoke({
        "input": query,
        "chat_history": formatted_history
    })
    
    return response
