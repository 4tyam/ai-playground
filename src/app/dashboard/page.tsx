import ChatInterface from "@/components/chat-interface";

function DashboardPage() {
  return (
    <main className="h-[calc(100vh-200px)] flex sm:items-center justify-center px-4 overflow-hidden">
      <div className="w-full fixed sm:static bottom-4 left-0 px-4 sm:px-0">
        <ChatInterface titleShown={true} modelsShown={true} />
      </div>
    </main>
  );
}

export default DashboardPage;
