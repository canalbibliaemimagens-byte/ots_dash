import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function CommandsPage() {
  return (
    <>
      <PageHeader
        title="Admin Commands"
        description="Send commands to connected instances — Phase 2"
      />
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-foreground-dim animate-pulse" />
            <span className="font-mono text-foreground-dim">
              Command panel coming in Phase 2
            </span>
          </div>
          <p className="text-sm text-foreground-dim">
            Send reload_config, pause, resume, close_all and other admin commands to Hub instances.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
