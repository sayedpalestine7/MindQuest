
import { X } from "lucide-react"
export default function TeacherDialog({ teacher, onClose, onAction }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
          <X className="hover:scale-110 hover:text-red-500 hover:bg-gray-100 rounded p-1 transition-all duration-200 cursor-pointer" />
        </button>

        <h2 className="text-xl font-bold mb-2">{teacher.name}</h2>
        <p className="text-gray-600 mb-4">{teacher.email}</p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Specialization</p>
            <p>{teacher.specialization}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Experience</p>
            <p>{teacher.experience} years</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-2">Bio</p>
        <p className="mb-4">{teacher.bio}</p>

        <h3 className="font-medium mb-2">
          Certificates ({teacher.certificates.length})
        </h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {teacher.certificates.map((cert, i) => (
            <div key={i} className="border rounded overflow-hidden">
              <img src={cert.url} alt={cert.name} className="h-40 w-full object-cover" />
              <div className="p-2">
                <p className="font-medium">{cert.name}</p>
                <p className="text-sm text-gray-500">{cert.type}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onAction("approve")}
            className="flex-1 bg-green-600 text-white rounded py-2 hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => onAction("reject")}
            className="flex-1 bg-red-600 text-white rounded py-2 hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}
