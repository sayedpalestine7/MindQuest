// /src/components/UI.jsx
import React from "react"

/**
 * Shared UI primitives implemented with Tailwind.
 * These replace ShadeCN components (Button, Input, Textarea, Select, Card).
 *
 * API is intentionally simple and close to the original ShadeCN usage:
 *  - <Button variant="outline" size="sm" className="...">...</Button>
 *  - <Input value={...} onChange={...} className="..." />
 *  - <Textarea value={...} onChange={...} rows={4} className="..." />
 *  - <Select value={...} onChange={...}><option value="...">...</option></Select>
 *  - <Card className="...">...</Card>
 *
 * These components forward most props to underlying HTML elements.
 */

/* ===== Button ===== */
export function Button({
  children,
  className = "",
  variant = "default", // default | outline | ghost
  size = "base", // sm | base | lg
  type = "button",
  asChild = false, // if you want to render a child element (like label) as the clickable root
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variants = {
    default:
      "px-4 py-2 bg-blue-500 shadow-sm focus:ring-teal-500",
    outline:
      "px-3 py-1.5 border-2 bg-transparent text-foreground hover:bg-opacity-5",
    ghost: "px-2 py-1 bg-transparent hover:bg-gray-100",
    paragraphBtn: "px-2 py-1 bg-white hover:bg-blue-100 hover:border-blue-500",
    imageBtn: "px-2 py-1 bg-white hover:bg-purple-100 hover:border-purple-500",
    youtubeBtn: "px-2 py-1 bg-white hover:bg-red-100 hover:border-red-500",
    codeBtn: "px-2 py-1 bg-white hover:bg-green-100 hover:border-green-500",
    tableBtn: "px-2 py-1 bg-white hover:bg-teal-100 hover:border-teal-500",
    questionBtn: "px-2 py-1 bg-white hover:bg-orange-100 hover:border-orange-500",
    gameBtn: "px-2 py-1 bg-white hover:bg-purple-100 hover:border-purple-500",
    animationBtn: "px-2 py-1 bg-white hover:bg-blue-100 hover:border-blue-500",
  }
  const sizes = {
    sm: "text-sm h-8",
    base: "text-base h-10",
    lg: "text-lg h-12",
  }
  const cls = [base, variants[variant] || variants.default, sizes[size] || sizes.base, className]
    .filter(Boolean)
    .join(" ")

  if (asChild && React.isValidElement(children)) {
    // clone child and inject props
    return React.cloneElement(children, { className: `${cls} ${children.props.className || ""}`, ...props })
  }

  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  )
}

/* ===== Input ===== */
export const Input = React.forwardRef(({ className = "", ...props }, ref) => {
  const base = "w-full px-3 py-2 rounded-md border-2 focus:ring-2 focus:outline-none"
  return <input ref={ref} className={`${base} ${className}`} {...props} />
})
Input.displayName = "Input"

/* ===== Textarea ===== */
export const Textarea = React.forwardRef(({ className = "", rows = 4, ...props }, ref) => {
  const base = "w-full px-3 py-2 rounded-md border-2 focus:ring-2 focus:outline-none user-select-text"
  return <textarea ref={ref} rows={rows} className={`${base} ${className}`} {...props} />
})
Textarea.displayName = "Textarea"

/* ===== Select (simple native) =====
   Usage:
     <Select value={val} onChange={e => setVal(e.target.value)} className="...">
       <option value="a">A</option>
     </Select>
*/
export const Select = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const base =
    "w-full px-3 py-2 rounded-md border-2 bg-white focus:ring-2 focus:outline-none appearance-none"
  return (
    <div className={`relative ${className}`}>
      <select ref={ref} className={`${base} pr-8`} {...props}>
        {children}
      </select>
      {/* caret icon */}
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
})
Select.displayName = "Select"

/* ===== Card ===== */
export function Card({ children, className = "", ...props }) {
  const base = "rounded-xl bg-white p-4 shadow-lg"
  return (
    <div className={`${base} ${className}`} {...props}>
      {children}
    </div>
  )
}

/* ===== Simple IconButton (for tiny icon-only buttons) ===== */
export function IconButton({ children, className = "", ...props }) {
  const base = "inline-flex items-center justify-center rounded p-1.5 focus:outline-none"
  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  )
}
