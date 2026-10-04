import AuthForm from "@/components/AuthForm";
import AuthLayout from "@/components/AuthLayout";

export default function SignInPage() {
  return (
    <AuthLayout>
      <AuthForm mode="signin" />
    </AuthLayout>
  );
}
