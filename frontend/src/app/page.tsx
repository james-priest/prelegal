import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg ring-1 ring-stone-200">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Prelegal</p>
        <h1 className="mt-1 text-2xl font-semibold text-brand-navy">Sign in</h1>
        <p className="mt-2 mb-6 text-sm text-brand-gray">Draft common legal agreements in minutes.</p>
        <LoginForm />
      </div>
    </main>
  );
}
