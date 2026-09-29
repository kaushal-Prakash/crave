import pytest
from unittest.mock import patch, MagicMock

# We need to mock environment variables if they are used on import
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ["GOOGLE_API_KEY"] = "fake-key"

import chatbot

@pytest.fixture
def mock_rag_chain():
    with patch("chatbot.rag_chain") as mock_chain:
        yield mock_chain

@pytest.fixture
def mock_init_chatbot():
    with patch("chatbot.init_chatbot") as mock_init:
        # Prevent init_chatbot from running
        mock_init.return_value = None
        yield mock_init

def test_get_chat_response_calls_init_if_chain_is_none(mock_init_chatbot, mock_rag_chain):
    """White-box testing: ensures init_chatbot is called when rag_chain is None"""
    chatbot.rag_chain = None
    
    # We must mock invoke since it will be called on rag_chain, which is None. 
    # But wait, if rag_chain is None, get_chat_response calls init_chatbot, 
    # which is supposed to populate rag_chain. 
    # Let's mock it so that it populates rag_chain.
    def side_effect():
        chatbot.rag_chain = MagicMock()
        chatbot.rag_chain.invoke.return_value = "Mocked Response"
        
    mock_init_chatbot.side_effect = side_effect
    
    response = chatbot.get_chat_response("Hello")
    mock_init_chatbot.assert_called_once()
    assert response == "Mocked Response"

@patch("chatbot.rag_chain")
def test_get_chat_response_with_history(mock_chain):
    """White-box testing: ensures history is formatted properly for LangChain"""
    chatbot.rag_chain = mock_chain
    mock_chain.invoke.return_value = "I am a helpful bot!"
    
    history = [
        {"role": "user", "content": "What is pizza?"},
        {"role": "ai", "content": "A dish."}
    ]
    
    response = chatbot.get_chat_response("And burger?", history)
    
    # Verify invoke was called
    mock_chain.invoke.assert_called_once()
    args = mock_chain.invoke.call_args[0][0]
    
    assert args["input"] == "And burger?"
    # It should have mapped 'user' and 'ai' to HumanMessage and AIMessage (we can just check the length)
    assert len(args["chat_history"]) == 2
    assert response == "I am a helpful bot!"
