"use client"
import { socket } from "@/lib/socket"
import { useEffect, useState } from "react"

type Message = { msg: string }

export default function Chat() {
  const [msg, setMsg] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    socket.on("receive_message", (data: Message) => {
      setMessages(prev => [...prev, data])
    })
    return () => { socket.off("receive_message") }
  }, [])

  const sendMessage = () => {
    console.log("sending msg:", msg)
    socket.emit("send_message", { msg })
    setMsg("")
  }

  return (
    <>  
        <div className="mt-44"></div>
      <input value={msg} onChange={e=>setMsg(e.target.value)} />
      <button onClick={sendMessage}>Send</button>

      {messages.map((m,i)=><p key={i}>{m.msg}</p>)}
    </>
  )
}
