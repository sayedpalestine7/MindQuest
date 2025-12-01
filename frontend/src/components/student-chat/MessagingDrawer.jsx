
import ChatHeader from "./ChatHeader"
import TeacherSidebar from "./TeacherSidebar"
import ChatMessages from "./ChatMessages"
import MessageInput from "./MessageInput"

export function MessagingDrawer({
  teachers,
  selectedTeacher,
  onSelectTeacher,
  messages,
  messageInput,
  setMessageInput,
  onSend,
  searchQuery,
  setSearchQuery,
  filter,
  setFilter
}) {
  return (
    <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-base-100 z-40 border-l shadow-2xl flex flex-col">
      <ChatHeader teacher={selectedTeacher} />
      <div className="flex flex-1 min-h-0">
        <TeacherSidebar
          teachers={teachers}
          selectedTeacher={selectedTeacher}
          onSelectTeacher={onSelectTeacher}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filter={filter}
          setFilter={setFilter}
        />
        <div className="flex-1 flex flex-col">
          <ChatMessages messages={messages} />
          <MessageInput
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSend={onSend}
          />
        </div>
      </div>
    </div>
  )
}
