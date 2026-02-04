export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Question Banks</h2>
        <p className="text-muted-foreground">
          Project: {projectId}
        </p>
      </div>
      <p className="text-muted-foreground">
        No question banks yet. Create one to start adding questions.
      </p>
    </div>
  );
}
