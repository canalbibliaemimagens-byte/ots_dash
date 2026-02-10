"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrayInput } from "./array-input";
import type { ColumnDef } from "@/lib/constants";

interface RecordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: ColumnDef[];
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  title?: string;
  mode?: "create" | "edit";
}

export function RecordForm({
  open,
  onOpenChange,
  columns,
  initialValues,
  onSubmit,
  title,
  mode = "create",
}: RecordFormProps) {
  const formColumns = columns.filter((c) => !c.hideInForm);
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    if (initialValues) return { ...initialValues };
    const defaults: Record<string, unknown> = {};
    for (const col of formColumns) {
      if (col.defaultValue !== undefined) {
        defaults[col.key] = col.defaultValue;
      }
    }
    return defaults;
  });
  const [saving, setSaving] = useState(false);

  function setValue(key: string, val: unknown) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
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
          <DialogTitle>
            {title || (mode === "create" ? "Create Record" : "Edit Record")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formColumns.map((col) => (
            <FormField
              key={col.key}
              column={col}
              value={values[col.key]}
              onChange={(v) => setValue(col.key, v)}
            />
          ))}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  column,
  value,
  onChange,
}: {
  column: ColumnDef;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const { key, label, type, required, options } = column;

  if (type === "boolean") {
    return (
      <div className="flex items-center justify-between">
        <Label htmlFor={key}>{label}</Label>
        <Switch
          id={key}
          checked={!!value}
          onCheckedChange={onChange}
        />
      </div>
    );
  }

  if (type === "select" && options) {
    return (
      <div className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        <Select
          value={String(value || "")}
          onValueChange={onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (type === "array") {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <ArrayInput
          value={Array.isArray(value) ? value as string[] : []}
          onChange={onChange}
        />
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        <Textarea
          id={key}
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      </div>
    );
  }

  if (type === "readonly") {
    return (
      <div className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        <Input id={key} value={String(value || "")} disabled />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type === "password" ? "password" : type === "number" ? "number" : type === "time" ? "time" : "text"}
        value={value == null ? "" : String(value)}
        onChange={(e) => {
          const v = type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value;
          onChange(v);
        }}
        required={required}
        step={type === "number" ? "any" : undefined}
      />
    </div>
  );
}
