"use client";

import { useState } from "react";
import { ArrowUpDown, Pencil, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ColumnDef } from "@/lib/constants";

interface DataTableProps<T> {
  columns: ColumnDef[];
  data: T[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  idField?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  onAdd,
  onEdit,
  onDelete,
  idField = "id",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const visibleColumns = columns.filter((c) => !c.hideInTable);

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp =
      typeof aVal === "number" && typeof bVal === "number"
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
    return sortAsc ? cmp : -cmp;
  });

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onAdd && (
        <div className="flex justify-end">
          <Button onClick={onAdd} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {visibleColumns.map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className="h-3 w-3 text-foreground-dim" />
                  </span>
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="w-[80px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (onEdit || onDelete ? 1 : 0)}
                  className="text-center text-foreground-dim py-8"
                >
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row) => (
                <TableRow key={String(row[idField])}>
                  {visibleColumns.map((col) => (
                    <TableCell key={col.key} className="font-mono text-sm whitespace-nowrap">
                      <CellValue value={row[col.key]} type={col.type} />
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <div className="flex gap-1">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onEdit(row)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => onDelete(row)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CellValue({ value, type }: { value: unknown; type: string }) {
  if (value == null) return <span className="text-foreground-dim">—</span>;

  if (type === "boolean") {
    return (
      <Badge variant={value ? "default" : "secondary"}>
        {value ? "Yes" : "No"}
      </Badge>
    );
  }

  if (type === "array" && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((v, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {String(v)}
          </Badge>
        ))}
      </div>
    );
  }

  if (type === "password") {
    return <span className="text-foreground-dim">••••••</span>;
  }

  return <>{String(value)}</>;
}
