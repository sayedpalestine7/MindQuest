import { GraduationCap, BookOpen, CheckCircle, XCircle, AlignEndHorizontal } from 'lucide-react'
export function FilterBar({ userTypeFilter, setUserTypeFilter, statusFilter, setStatusFilter }) {
  const btn = "px-3 py-1 border rounded text-sm"
  const active = "bg-blue-500 text-white"

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      <div>
        <span className="font-semibold text-gray-200 mr-2">User Type:</span>
        <button onClick={() => setUserTypeFilter("all")} className={`${btn} ${userTypeFilter === "all" ? active : ""}`}
          style={{ color: userTypeFilter === "all" ? 'white' : 'gray', marginRight: '3px' }}>
          <span className='flex justify-center items-center'>
            <AlignEndHorizontal className="h-2.5 w-3" />All
          </span>
        </button>
        <button onClick={() => setUserTypeFilter("teacher")} className={`${btn} ${userTypeFilter === "teacher" ? active : ""}`}
          style={{ color: userTypeFilter === "teacher" ? 'white' : 'gray', marginRight: '3px' }}>
          <span className='flex justify-center items-center'>
            <GraduationCap className="h-2.5 w-3" />Teacher
          </span>
        </button>
        <button onClick={() => setUserTypeFilter("student")} className={`${btn} ${userTypeFilter === "student" ? active : ""}`}
          style={{ color: userTypeFilter === "student" ? 'white' : 'gray' }}>
          <span className='flex justify-center items-center'>
            <BookOpen className="h-2.5 w-3" />Student
          </span>
        </button>
      </div>

      <div>
        <span className="font-semibold text-gray-200 mr-2">Status:</span>
        <button onClick={() => setStatusFilter("all")} className={`${btn} ${statusFilter === "all" ? active : ""}`}
          style={{ color: statusFilter === "all" ? 'white' : 'gray', marginRight: '3px' }}>
          <span className='flex justify-center items-center'>
            <AlignEndHorizontal className="h-2.5 w-3" />All
          </span>
        </button>
        <button onClick={() => setStatusFilter("active")} className={`${btn} ${statusFilter === "active" ? active : ""}`}
          style={{ color: statusFilter === "active" ? 'white' : 'gray', marginRight: '3px' }}>
          <span className='flex justify-center items-center'>
            <CheckCircle className="h-2.5 w-3" />Active
          </span>
        </button>
        <button onClick={() => setStatusFilter("pending")} className={`${btn} ${statusFilter === "pending" ? active : ""}`}
          style={{ color: statusFilter === "pending" ? 'white' : 'gray', marginRight: '3px' }}>
          <span className='flex justify-center items-center'>
            <AlignEndHorizontal className="h-2.5 w-3" />Pending
          </span>
        </button>
        <button onClick={() => setStatusFilter("rejected")} className={`${btn} ${statusFilter === "rejected" ? active : ""}`}
          style={{ color: statusFilter === "rejected" ? 'white' : 'gray', marginRight: '3px' }}>
          <span className='flex justify-center items-center'>
            <XCircle className="h-2.5 w-3" />Rejected
          </span>
        </button>
        <button onClick={() => setStatusFilter("banned")} className={`${btn} ${statusFilter === "banned" ? active : ""}`}
          style={{ color: statusFilter === "banned" ? 'white' : 'gray' }}>
          <span className='flex justify-center items-center'>
            <XCircle className="h-2.5 w-3" />Banned
          </span>
        </button>
      </div>
    </div>
  )
}
