import { Brain, ChevronRight } from "lucide-react";
import { Link } from "react-router";

export default function Header() {
  // get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user")); // make sure you store user object after login

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/student" className="flex items-center gap-3 hover:opacity-80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">MindQuest</h1>
            <p className="text-sm text-gray-500">Browse Courses</p>
          </div>
        </Link>

        {user && (
          <Link
            to={`/student/${user._id}`} // use the actual user ID
            className="flex items-center text-gray-700 border px-3 py-1 rounded-md hover:bg-gray-100"
          >
            <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
            Back to Profile
          </Link>
        )}
      </div>
    </header>
  );
}
