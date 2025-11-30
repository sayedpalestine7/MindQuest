export default function MessageInput({ messageInput, setMessageInput, onSend }) {
  return (
    <div className="p-4 border-t bg-base-200 flex gap-2">
      <input
        type="text"
        placeholder="Type a message..."
        className="input input-bordered w-full"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />

      <button 
        className="btn btn-primary"
        onClick={onSend}
        disabled={!messageInput.trim()}
      >
        Send
      </button>
    </div>
  )
}
