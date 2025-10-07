export function RememberMe({ rememberMe, setRememberMe, isLoading }) {
  return (
    <div className="form-control">
      <label className="label cursor-pointer justify-start gap-3">
        <input
          type="checkbox"
          className="checkbox checkbox-primary"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={isLoading}
        />
        <span className="label-text">Remember me</span>
      </label>
    </div>
  )
}

export default RememberMe