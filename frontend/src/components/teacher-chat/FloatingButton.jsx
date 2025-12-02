export function FloatingButton({ totalUnread, onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white"
    >
      <span>💬</span>
      {totalUnread > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalUnread}
        </span>
      )}
    </button>
  )
}
