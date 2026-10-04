"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

const inputClass =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";

/** Placeholder sign-in: no authentication yet, it just enters the app. */
export default function LoginForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/draft/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-stone-800">Email</span>
        <input type="email" name="email" autoComplete="email" required className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-stone-800">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-md bg-brand-purple px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
      >
        Sign in
      </button>
    </form>
  );
}
