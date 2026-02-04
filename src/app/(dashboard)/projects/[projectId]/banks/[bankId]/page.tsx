export default async function BankEditorPage({
  params,
}: {
  params: Promise<{ projectId: string; bankId: string }>;
}) {
  const { projectId, bankId } = await params;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Bank Editor</h2>
        <p className="text-muted-foreground">
          Project: {projectId} / Bank: {bankId}
        </p>
      </div>
      <p className="text-muted-foreground">
        Question editor will go here.
      </p>
    </div>
  );
}
