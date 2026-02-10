"use client";

import { useState, useCallback, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/config/data-table";
import { DeleteDialog } from "@/components/config/delete-dialog";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FolderSearch, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { TradingModel } from "@/types/database";
import { TRADING_MODELS_COLUMNS } from "@/lib/constants";

interface BucketFile {
  name: string;       // display name (e.g., "EURUSD_M15/EURUSD_M15.zip")
  path: string;       // full storage path for download
  size: number;
}

interface ZipMetadata {
  format_version?: string;
  symbol?: { name: string; timeframe: string };
  training_config?: Record<string, unknown>;
  hmm_config?: Record<string, unknown>;
  rl_config?: Record<string, unknown>;
}

export default function ModelsPage() {
  const { data, loading, insert, update, remove } =
    useSupabaseQuery<TradingModel>("trading_models");
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<TradingModel | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<TradingModel | null>(null);

  const handleAdd = useCallback(() => {
    setEditRecord(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((record: Record<string, unknown>) => {
    setEditRecord(record as unknown as TradingModel);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((record: Record<string, unknown>) => {
    setDeleteRecord(record as unknown as TradingModel);
  }, []);

  return (
    <>
      <PageHeader
        title="Trading Models"
        description="trading_models — ML models for prediction"
      />
      <DataTable
        columns={TRADING_MODELS_COLUMNS}
        data={data as unknown as Record<string, unknown>[]}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ModelForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editRecord}
        onSubmit={async (values) => {
          if (editRecord) {
            const { id: _, created_at: _c, updated_at: _u, ...changes } = values;
            await update(editRecord.id, changes as Partial<TradingModel>);
          } else {
            const { id: _, created_at: _c, updated_at: _u, ...record } = values;
            await insert(record as Partial<TradingModel>);
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
        label={deleteRecord?.name}
      />
    </>
  );
}

function ModelForm({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: TradingModel | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}) {
  const isEdit = !!initialValues;

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [timeframe, setTimeframe] = useState("M15");
  const [version, setVersion] = useState("1.0");
  const [formatVersion, setFormatVersion] = useState("2.0");
  const [storageBucket, setStorageBucket] = useState("oracle_models");
  const [storagePath, setStoragePath] = useState("");
  const [modelPath, setModelPath] = useState("");
  const [minBars, setMinBars] = useState(350);
  const [warmupBars, setWarmupBars] = useState(1000);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [sharpeRatio, setSharpeRatio] = useState<number | null>(null);
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [bucketFiles, setBucketFiles] = useState<BucketFile[]>([]);
  const [loadingBucket, setLoadingBucket] = useState(false);
  const [scanningMeta, setScanningMeta] = useState(false);
  const [metaWarning, setMetaWarning] = useState("");

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setName(initialValues.name);
        setSymbol(initialValues.symbol);
        setTimeframe(initialValues.timeframe);
        setVersion(initialValues.version || "1.0");
        setFormatVersion(initialValues.format_version || "2.0");
        setStorageBucket(initialValues.storage_bucket || "oracle_models");
        setStoragePath(initialValues.storage_path || "");
        setModelPath(initialValues.model_path || "");
        setMinBars(initialValues.min_bars);
        setWarmupBars(initialValues.warmup_bars);
        setAccuracy(initialValues.accuracy);
        setSharpeRatio(initialValues.sharpe_ratio);
        setActive(initialValues.active);
        setDescription(initialValues.description || "");
      } else {
        setName("");
        setSymbol("");
        setTimeframe("M15");
        setVersion("1.0");
        setFormatVersion("2.0");
        setStorageBucket("oracle_models");
        setStoragePath("");
        setModelPath("");
        setMinBars(350);
        setWarmupBars(1000);
        setAccuracy(null);
        setSharpeRatio(null);
        setActive(true);
        setDescription("");
      }
      setMetaWarning("");
    }
  }, [open, initialValues]);

  async function loadBucketFiles() {
    setLoadingBucket(true);
    try {
      const supabase = createClient();

      // 1) List root items (files + folders)
      const { data: rootItems, error } = await supabase.storage
        .from(storageBucket)
        .list("", { limit: 200, sortBy: { column: "name", order: "asc" } });

      if (error) throw error;

      const discovered: BucketFile[] = [];

      // 2) Separate root ZIPs and folders

      // 2) Separate root ZIPs and folders
      const folders: string[] = [];
      for (const item of rootItems || []) {
        if (item.name.endsWith(".zip")) {
          // Root-level ZIP file
          discovered.push({
            name: item.name,
            path: item.name,
            size: item.metadata?.size || 0,
          });
        } else {
          // Folder (or file without extension). Treat as folder candidate to scan.
          folders.push(item.name);
        }
      }

      // 3) For each folder, list contents and find ZIPs
      //    Pattern: FOLDER/FOLDER.zip (from download_model.py)
      const folderResults = await Promise.allSettled(
        folders.map(async (folder) => {
          const { data: contents, error: fErr } = await supabase.storage
            .from(storageBucket)
            .list(folder, { limit: 50, sortBy: { column: "name", order: "asc" } });

          if (fErr || !contents) return [];

          return contents
            .filter((f) => f.name.endsWith(".zip"))
            .map((f) => ({
              name: `${folder}/${f.name}`,
              path: `${folder}/${f.name}`,
              size: f.metadata?.size || 0,
            }));
        })
      );



      for (const result of folderResults) {
        if (result.status === "fulfilled") {
          discovered.push(...result.value);
        }
      }

      // Sort by name
      discovered.sort((a, b) => a.name.localeCompare(b.name));
      setBucketFiles(discovered);

      if (discovered.length === 0) {
        toast.info("No ZIP files found in bucket", {
          description: `Bucket: ${storageBucket}`,
        });
      } else {
        toast.success(`Found ${discovered.length} model(s)`, {
          description: `${folders.length} folder(s) scanned`,
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error("Failed to list bucket", { description: msg });
      setBucketFiles([]);
    } finally {
      setLoadingBucket(false);
    }
  }

  async function scanMetadata() {
    if (!storagePath) {
      toast.error("Select a file first");
      return;
    }

    setScanningMeta(true);
    setMetaWarning("");

    try {
      const supabase = createClient();
      const { data: blob, error } = await supabase.storage
        .from(storageBucket)
        .download(storagePath);

      if (error) throw error;
      if (!blob) throw new Error("Empty download response");

      const buffer = await blob.arrayBuffer();
      const raw = readZipComment(new Uint8Array(buffer));

      if (!raw) {
        setMetaWarning(
          "No metadata in ZIP comment. This model is likely v1.x (pre-metadata). Fill fields manually."
        );
        autoFillFromFilename();
        return;
      }

      let meta: ZipMetadata;
      try {
        meta = JSON.parse(raw);
      } catch {
        setMetaWarning(
          "ZIP comment exists but is not valid JSON. Fill fields manually."
        );
        autoFillFromFilename();
        return;
      }

      if (meta.format_version) setFormatVersion(meta.format_version);
      if (meta.symbol?.name) {
        setSymbol(meta.symbol.name);
        if (meta.symbol.timeframe) setTimeframe(meta.symbol.timeframe);
        if (!name) setName(`${meta.symbol.name}_${meta.symbol.timeframe || timeframe}`);
      }

      const tc = meta.training_config || {};
      if (typeof tc === "object") {
        if ("accuracy" in tc && tc.accuracy != null) setAccuracy(Number(tc.accuracy));
        if ("sharpe_ratio" in tc && tc.sharpe_ratio != null) setSharpeRatio(Number(tc.sharpe_ratio));
        if ("min_bars" in tc && tc.min_bars != null) setMinBars(Number(tc.min_bars));
        if ("warmup_bars" in tc && tc.warmup_bars != null) setWarmupBars(Number(tc.warmup_bars));
      }

      const parts: string[] = [];
      if (meta.hmm_config && typeof meta.hmm_config === "object" && "n_states" in meta.hmm_config) {
        parts.push(`HMM states: ${meta.hmm_config.n_states}`);
      }
      if (meta.rl_config && typeof meta.rl_config === "object" && "algorithm" in meta.rl_config) {
        parts.push(`RL: ${meta.rl_config.algorithm}`);
      }
      if (parts.length) setDescription(parts.join(" | "));

      toast.success("Metadata loaded", {
        description: `v${meta.format_version || "?"} — ${meta.symbol?.name || "?"} ${meta.symbol?.timeframe || "?"}`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setMetaWarning(`Failed to read: ${msg}`);
      autoFillFromFilename();
    } finally {
      setScanningMeta(false);
    }
  }

  function autoFillFromFilename() {
    const parsed = parseFilename(storagePath);
    if (parsed) {
      setSymbol(parsed.symbol);
      setTimeframe(parsed.timeframe);
      if (!name) setName(`${parsed.symbol}_${parsed.timeframe}`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        name,
        symbol,
        timeframe,
        version,
        storage_bucket: storageBucket,
        storage_path: storagePath,
        min_bars: minBars,
        warmup_bars: warmupBars,
        accuracy,
        sharpe_ratio: sharpeRatio,
        active,
        description: description || null,
      });
      onOpenChange(false);
    } catch {
      // toast handled by caller
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Model" : "New Model"}</DialogTitle>
          <DialogDescription className="sr-only">
            Form to create or edit a trading model configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bucket browser */}
          <div className="space-y-2">
            <Label>Storage Bucket</Label>
            <div className="flex gap-2">
              <Input
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="oracle_models"
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={loadBucketFiles}
                disabled={loadingBucket}
              >
                {loadingBucket ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FolderSearch className="h-4 w-4" />
                )}
                <span className="ml-1.5">Browse</span>
              </Button>
            </div>
          </div>

          {/* File selector from bucket */}
          {bucketFiles.length > 0 ? (
            <div className="space-y-2">
              <Label>Select Model ZIP ({bucketFiles.length} found)</Label>
              <Select
                value={storagePath}
                onValueChange={(val) => {
                  setStoragePath(val);
                  setMetaWarning("");
                  if (!name) {
                    const parsed = parseFilename(val);
                    if (parsed) setName(`${parsed.symbol}_${parsed.timeframe}`);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a ZIP file" />
                </SelectTrigger>
                <SelectContent>
                  {bucketFiles.map((f) => (
                    <SelectItem key={f.path} value={f.path}>
                      <span className="font-mono text-sm">{f.name}</span>
                      {f.size > 0 && (
                        <span className="text-xs text-foreground-dim ml-2">
                          ({formatBytes(f.size)})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Storage Path</Label>
              <Input
                value={storagePath}
                onChange={(e) => setStoragePath(e.target.value)}
                placeholder="EURUSD_M15/EURUSD_M15.zip"
                required
              />
            </div>
          )}

          {/* Scan metadata */}
          {storagePath && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={scanMetadata}
                disabled={scanningMeta}
              >
                {scanningMeta && (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                )}
                Scan Metadata
              </Button>
              <span className="text-xs text-foreground-dim">
                Read zip.comment to auto-fill fields
              </span>
            </div>
          )}

          {metaWarning && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{metaWarning}</p>
            </div>
          )}

          {/* Core fields */}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="EURUSD_M15_v1.0"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Symbol</Label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="EURUSD"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["M1", "M5", "M15", "M30", "H1", "H4", "D1"].map((tf) => (
                    <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Version</Label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>
                Format Version
                <Badge
                  variant={parseFloat(formatVersion) >= 2.0 ? "default" : "secondary"}
                  className="ml-2 text-xs"
                >
                  {parseFloat(formatVersion) >= 2.0 ? "supported" : "legacy"}
                </Badge>
              </Label>
              <Input value={formatVersion} onChange={(e) => setFormatVersion(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Model Path (local filesystem, optional)</Label>
            <Input
              value={modelPath}
              onChange={(e) => setModelPath(e.target.value)}
              placeholder="Defaults to storage_path if empty"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Bars</Label>
              <Input type="number" value={minBars} onChange={(e) => setMinBars(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Warmup Bars</Label>
              <Input type="number" value={warmupBars} onChange={(e) => setWarmupBars(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Accuracy %</Label>
              <Input
                type="number"
                step="0.01"
                value={accuracy ?? ""}
                onChange={(e) => setAccuracy(e.target.value === "" ? null : Number(e.target.value))}
                placeholder="68.50"
              />
            </div>
            <div className="space-y-2">
              <Label>Sharpe Ratio</Label>
              <Input
                type="number"
                step="0.01"
                value={sharpeRatio ?? ""}
                onChange={(e) => setSharpeRatio(e.target.value === "" ? null : Number(e.target.value))}
                placeholder="1.50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Auto-filled from metadata or manual notes"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── ZIP Comment Reader ─────────────────────────────────────────
// Reads the End-of-Central-Directory comment from a ZIP file.
// EOCD signature: PK\x05\x06 (0x50, 0x4b, 0x05, 0x06)
// The comment is stored at the end of the ZIP file after the EOCD record.
// Comment length is a uint16 at offset +20 from the signature.
function readZipComment(data: Uint8Array): string | null {
  const sig = [0x50, 0x4b, 0x05, 0x06];
  const searchStart = Math.max(0, data.length - 65557); // max comment = 65535

  for (let i = data.length - 22; i >= searchStart; i--) {
    if (
      data[i] === sig[0] &&
      data[i + 1] === sig[1] &&
      data[i + 2] === sig[2] &&
      data[i + 3] === sig[3]
    ) {
      const commentLen = data[i + 20] | (data[i + 21] << 8);
      if (commentLen === 0) return null;
      const commentBytes = data.slice(i + 22, i + 22 + commentLen);
      return new TextDecoder("utf-8").decode(commentBytes);
    }
  }
  return null;
}

// Parse SYMBOL_TIMEFRAME from filename (e.g., EURUSD_M15.zip)
function parseFilename(path: string): { symbol: string; timeframe: string } | null {
  const basename = path.split("/").pop()?.replace(".zip", "") || "";
  const match = basename.match(/^([A-Z]+)_(M\d+|H\d+|D\d+)$/i);
  if (match) return { symbol: match[1].toUpperCase(), timeframe: match[2].toUpperCase() };
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
