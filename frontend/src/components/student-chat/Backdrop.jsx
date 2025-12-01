export function Backdrop({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm"
    />
  )
}
