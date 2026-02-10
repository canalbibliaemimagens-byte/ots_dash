"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Check, X, Eye, EyeOff } from "lucide-react";
import type { OtsConfig } from "@/types/database";

const SENSITIVE_KEYS = ["oracle_token", "client_secret", "access_token"];

export default function HubConfigPage() {
  const { data, loading, update } = useSupabaseQuery<OtsConfig>("ots_config", {
    orderBy: { column: "key", ascending: true },
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  function startEdit(row: OtsConfig) {
    setEditingId(row.id);
    setEditValue(row.value);
  }

  async function saveEdit(id: string) {
    await update(id, { value: editValue } as Partial<OtsConfig>);
    setEditingId(null);
  }

  function toggleReveal(key: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const isSensitive = (key: string) =>
    SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));

  if (loading) {
    return (
      <>
        <PageHeader title="Hub Config" description="ots_config — Key-value settings" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Hub Config" description="ots_config — Key-value settings" />

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px]">Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-sm text-hub">
                  {row.key}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {editingId === row.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(row.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-executor"
                        onClick={() => saveEdit(row.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>
                        {isSensitive(row.key) && !revealed.has(row.key)
                          ? "••••••••"
                          : row.value}
                      </span>
                      {isSensitive(row.key) && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => toggleReveal(row.key)}
                        >
                          {revealed.has(row.key) ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-foreground-dim">
                  {row.description || "—"}
                </TableCell>
                <TableCell>
                  {editingId !== row.id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => startEdit(row)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
