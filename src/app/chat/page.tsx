import ChatBar from "@/components/chat-bar";

function ChatPage() {
  return (
    <main className="h-[calc(100vh-200px)] flex sm:items-center justify-center px-4 overflow-hidden">
      <div className="w-full fixed sm:static bottom-4 left-0 px-4 sm:px-0">
        <ChatBar
          titleShown={true}
          modelsReadOnly={false}
          selectedModel={"gpt-4o-mini"}
        />
      </div>
    </main>
  );
}

export default ChatPage;
