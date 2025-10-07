import { Loader2 } from "lucide-react"

export function SubmitButton({ isLoading, children = "Sign in" }) {
  return (
    <button
      type="submit"
      className="btn btn-primary w-full"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Signing in...
        </>
      ) : (
        children
      )}
    </button>
  )
}
export default SubmitButton