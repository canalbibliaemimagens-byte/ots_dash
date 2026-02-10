"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/config/data-table";
import { DeleteDialog } from "@/components/config/delete-dialog";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PreditorConfig, TradingModel } from "@/types/database";
import type { ColumnDef } from "@/lib/constants";

const COLUMNS: ColumnDef[] = [
  { key: "instance_id", label: "Instance ID", type: "text", required: true },
  { key: "model_name", label: "Model", type: "text" },
  { key: "min_bars", label: "Min Bars", type: "number", defaultValue: 350 },
  { key: "warmup_bars", label: "Warmup Bars", type: "number", defaultValue: 1000 },
  { key: "enabled", label: "Enabled", type: "boolean", defaultValue: true },
];

export default function PreditorsPage() {
  const { data: rawData, loading, insert, update, remove } = useSupabaseQuery<PreditorConfig>(
    "preditor_config",
    { select: "*, trading_models(id, name, symbol, timeframe)" }
  );
  const { data: models } = useSupabaseQuery<TradingModel>("trading_models", {
    orderBy: { column: "name", ascending: true },
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<PreditorConfig | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<PreditorConfig | null>(null);

  // Flatten model name for table display
  const data = rawData.map((row) => ({
    ...row,
    model_name: row.trading_models
      ? `${(row.trading_models as TradingModel).name} (${(row.trading_models as TradingModel).symbol} ${(row.trading_models as TradingModel).timeframe})`
      : "—",
  }));

  const handleAdd = useCallback(() => {
    setEditRecord(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((record: Record<string, unknown>) => {
    setEditRecord(record as unknown as PreditorConfig);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((record: Record<string, unknown>) => {
    setDeleteRecord(record as unknown as PreditorConfig);
  }, []);

  return (
    <>
      <PageHeader
        title="Preditors"
        description="preditor_config — Preditor instances linked to models"
      />
      <DataTable
        columns={COLUMNS}
        data={data as unknown as Record<string, unknown>[]}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PreditorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editRecord}
        models={models}
        onSubmit={async (values) => {
          if (editRecord) {
            await update(editRecord.id, values as Partial<PreditorConfig>);
          } else {
            await insert(values as Partial<PreditorConfig>);
          }
        }}
      />

      <DeleteDialog
        open={!!deleteRecord}
        onOpenChange={(open) => !open && setDeleteRecord(null)}
        onConfirm={async () => {
          if (deleteRecord) await remove(deleteRecord.id);
          setDeleteRecord(null);
        }}
        label={deleteRecord?.instance_id}
      />
    </>
  );
}

function PreditorForm({
  open,
  onOpenChange,
  initialValues,
  models,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: PreditorConfig | null;
  models: TradingModel[];
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}) {
  const [instanceId, setInstanceId] = useState(initialValues?.instance_id || "");
  const [modelId, setModelId] = useState(initialValues?.model_id || "");
  const [minBars, setMinBars] = useState(initialValues?.min_bars ?? 350);
  const [warmupBars, setWarmupBars] = useState(initialValues?.warmup_bars ?? 1000);
  const [enabled, setEnabled] = useState(initialValues?.enabled ?? true);
  const [saving, setSaving] = useState(false);

  // Reset form when opening
  const handleOpenChange = (val: boolean) => {
    if (val && initialValues) {
      setInstanceId(initialValues.instance_id);
      setModelId(initialValues.model_id || "");
      setMinBars(initialValues.min_bars);
      setWarmupBars(initialValues.warmup_bars);
      setEnabled(initialValues.enabled);
    } else if (val) {
      setInstanceId("");
      setModelId("");
      setMinBars(350);
      setWarmupBars(1000);
      setEnabled(true);
    }
    onOpenChange(val);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        instance_id: instanceId,
        model_id: modelId || null,
        min_bars: minBars,
        warmup_bars: warmupBars,
        enabled,
      });
      onOpenChange(false);
    } catch {
      // handled by caller
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle>
            {initialValues ? "Edit Preditor" : "New Preditor"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Instance ID</Label>
            <Input
              value={instanceId}
              onChange={(e) => setInstanceId(e.target.value)}
              placeholder="preditor-EURUSD-M15"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={modelId} onValueChange={setModelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.symbol} {m.timeframe})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Bars</Label>
              <Input
                type="number"
                value={minBars}
                onChange={(e) => setMinBars(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Warmup Bars</Label>
              <Input
                type="number"
                value={warmupBars}
                onChange={(e) => setWarmupBars(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Enabled</Label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : initialValues ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
