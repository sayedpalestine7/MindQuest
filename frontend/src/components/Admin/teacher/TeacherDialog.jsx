import { X } from "lucide-react"

export default function TeacherDialog({ teacher, onClose, onAction }) {
  const profileImage =
    teacher.certificates && teacher.certificates.length > 0
      ? (typeof teacher.certificates[0] === "string"
          ? teacher.certificates[0]
          : teacher.certificates[0].url)
      : "/default-avatar.png"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg p-6 max-w-3xl w-full relative">
        <button className="absolute top-2 right-2 text-white" onClick={onClose}>
          <X className="hover:scale-110 hover:text-red-500 hover:bg-gray-100 rounded p-1 transition-all duration-200 cursor-pointer" />
        </button>

        <div className="flex flex-row items-center mb-4 gap-4">
          <img
            src={profileImage}
            alt={teacher.name}
            className="w-24 h-24 rounded-full object-cover border border-gray-600 mb-3"
          />
          <div>
            <h2 className="text-xl font-bold mb-2">{teacher.name}</h2>
            <p className="text-white mb-4">{teacher.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-white">Specialization</p>
            <p>{teacher.specialization}</p>
          </div>
          <div>
            <p className="text-sm text-white mb-2">Institution / University</p>
            <p className="mb-4">{teacher.institution}</p>
          </div>
        </div>

        <h3 className="font-medium mb-2">
          Certificates ({teacher.certificates.length})
        </h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {teacher.certificates.map((cert, i) => (
            <div key={i} className="border rounded overflow-hidden">
              <img
                src={typeof cert === "string" ? cert : cert.url}
                alt={`Certificate ${i + 1}`}
                className="h-40 w-full object-cover"
              />
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
