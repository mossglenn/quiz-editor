export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground">
          Get started with Quiz Editor for free.
        </p>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Authentication will be implemented with Supabase Auth.
      </p>
    </div>
  );
}
