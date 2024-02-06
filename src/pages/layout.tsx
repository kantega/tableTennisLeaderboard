import { ModeToggle } from "@/components/theme-toggle";
import Head from "next/head";
import NavigationBar from "./NavigationBar";
import { Toaster } from "@/components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>TT Kantega Leaderboard</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-background pt-24">
        <Toaster />
        <div className=" fixed right-4 top-4">
          <ModeToggle />
        </div>
        {children}
        <NavigationBar />
      </main>
    </>
  );
}