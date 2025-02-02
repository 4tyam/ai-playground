import { redirect } from "next/navigation";
import { auth, signIn } from "./auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    return redirect("/chat");
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <button type="submit">Signin with GitHub</button>
      </form>

      {session && <div>{session.user?.name}</div>}
    </div>
  );
}
