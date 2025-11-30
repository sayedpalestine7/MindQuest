export default function ChatMessages({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(msg => (
        <div 
          key={msg.id}
          className={`flex ${msg.sender === "teacher" ? "justify-end" : "justify-start"}`}
        >
          <div 
            className={`p-3 rounded-lg max-w-xs 
              ${msg.sender === "teacher" ? "bg-primary text-white" : "bg-base-300"}`
            }
          >
            <p className="text-sm">{msg.content}</p>
            <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
