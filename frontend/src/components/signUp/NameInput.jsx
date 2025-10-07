export function NameInput({ name, setName, isLoading }) {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold">Full Name</span>
      </label>
      <input
        type="text"
        placeholder="Your full name"
        className="input input-bordered w-full focus:input-primary"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isLoading}
      />
    </div>
  )
}
export default NameInput