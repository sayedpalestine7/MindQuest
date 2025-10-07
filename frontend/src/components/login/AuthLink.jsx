
import {Link} from "react-router"

export function AuthLink({ 
  question, 
  linkText, 
  href,
  className = "" 
}) {
  return (
    <div className={`text-center ${className}`}>
      <span className="text-base-content/70">
        {question}{" "}
      </span>
      <Link 
        to={href} 
        className="link link-primary font-semibold hover:link-secondary transition-colors"
      >
        {linkText}
      </Link>
    </div>
  )
}
export default AuthLink