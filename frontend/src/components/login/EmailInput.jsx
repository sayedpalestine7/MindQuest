function EmailInput({ email, setEmail, isLoading }) {
return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold">Email</span>
      </label>
      <input
        type="email"
        placeholder="you@example.com"
        className="input input-bordered w-full focus:input-primary"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />
    </div>
  )
}

export default EmailInput