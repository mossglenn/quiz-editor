export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-muted-foreground">
          Sign in to your Quiz Editor account.
        </p>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Authentication will be implemented with Supabase Auth.
      </p>
    </div>
  );
}
