import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-6 bg-zinc-950 text-white">
      <h1 className="text-3xl font-bold tracking-tight">Football Logic HUB</h1>
      <p className="text-zinc-400">Welcome, Agent {user.email}</p>

      <div className="flex flex-col gap-4 w-full max-w-sm px-8">
        <Link href="/analysis" className="w-full">
          <Button className="w-full bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            [MODULE 01] VIDEO DECRYPTION
          </Button>
        </Link>

        <Link href="/command" className="w-full">
          <Button className="w-full bg-[#0a0a0a] text-[#00ff41] border border-[#00ff41] hover:bg-[#00ff41] hover:text-black font-mono shadow-[0_0_10px_rgba(0,255,65,0.2)]">
            [MODULE 02] TACTICAL COMMAND
          </Button>
        </Link>

        <form action={async () => {
          'use server'
          const supabase = await createClient()
          await supabase.auth.signOut()
          redirect('/login')
        }} className="w-full mt-8">
          <Button type="submit" className="w-full bg-transparent hover:bg-zinc-900 border-none text-zinc-500 hover:text-white transition-colors">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
