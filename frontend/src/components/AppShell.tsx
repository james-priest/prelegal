"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import Wordmark from "@/components/Wordmark";
import { fetchCurrentUser, signOut, type User } from "@/lib/auth";

interface AppShellProps {
  children: ReactNode;
  /** Fill exactly the window, so the page's own panels scroll instead of the page. */
  fullHeight?: boolean;
}

/** Signed-in layout: top bar with navigation and account. Sends signed-out visitors to sign in. */
export default function AppShell({ children, fullHeight = false }: AppShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => router.replace("/"));
  }, [router]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className={`flex flex-col ${fullHeight ? "h-screen print:h-auto" : "min-h-screen"}`}>
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 print:hidden">
        <nav className="flex items-center gap-6">
          <Link href="/documents/" className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
            <Wordmark />
          </Link>
          <Link href="/documents/" className="rounded text-sm font-medium text-slate-600 hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
            Documents
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/draft/"
            className="rounded-md bg-brand-purple px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-purple/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
          >
            New document
          </Link>
          {user && <span className="hidden text-sm text-slate-500 md:block">{user.email}</span>}
          <button type="button" onClick={handleSignOut} className="rounded text-sm font-medium text-slate-600 hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
            Sign out
          </button>
        </div>
      </header>
      {user ? children : <p role="status" className="p-8 text-sm text-slate-600">Loading…</p>}
    </div>
  );
}
