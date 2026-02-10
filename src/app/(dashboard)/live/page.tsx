import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function LivePage() {
  return (
    <>
      <PageHeader
        title="Live Monitoring"
        description="Real-time system monitoring via WebSocket — Phase 2"
      />
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-foreground-dim animate-pulse" />
            <span className="font-mono text-foreground-dim">
              WebSocket integration coming in Phase 2
            </span>
          </div>
          <p className="text-sm text-foreground-dim">
            This page will show real-time signals, orders, account state, and position tracking.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
