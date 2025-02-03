import ChatBar from "@/components/chat-bar";
import ChatSidebar from "@/components/chat-sidebar";

const ChatIdPage = () => {
  return (
    <main className="h-[calc(100vh-80px)] -m-4 relative">
      <div className="absolute inset-0 overflow-y-auto px-4 pb-[140px]">
        {/* Chat messages will go here */}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-background">
        <div className="w-full max-w-3xl mx-auto px-4">
          <ChatBar titleShown={false} modelsReadOnly={true} />
        </div>
      </div>
    </main>
  );
};

export default ChatIdPage;
