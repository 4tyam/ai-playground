import ChatBar from "@/components/chat-bar";
// import { ModelInfoDialog } from "@/components/model-info-dialog";

function ChatPage() {
  return (
    <main className="h-[calc(100vh-200px)] flex flex-col sm:items-center justify-center px-4 overflow-hidden">
      <div className="w-full fixed sm:static bottom-4 left-0 px-4 sm:px-0">
        <ChatBar titleShown={true} modelsReadOnly={false} />
        {/* <div className="sm:hidden mt-2 flex justify-center">
          <ModelInfoDialog />
        </div> */}
      </div>
      <div className="hidden sm:flex fixed sm:bottom-4 sm:left-[250px] w-[calc(100%-250px)] justify-center">
        {/* <div className="text-center sm:mb-2">
          <ModelInfoDialog />
        </div> */}
      </div>
    </main>
  );
}

export default ChatPage;
