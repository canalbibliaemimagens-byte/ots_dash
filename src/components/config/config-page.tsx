"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "./data-table";
import { RecordForm } from "./record-form";
import { DeleteDialog } from "./delete-dialog";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import type { ColumnDef } from "@/lib/constants";

interface ConfigPageProps {
  title: string;
  description: string;
  table: string;
  columns: ColumnDef[];
  labelField?: string;
  select?: string;
}

export function ConfigPage({
  title,
  description,
  table,
  columns,
  labelField,
  select,
}: ConfigPageProps) {
  const { data, loading, insert, update, remove } = useSupabaseQuery<Record<string, unknown> & { id: string }>(
    table,
    select ? { select } : undefined
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Record<string, unknown> | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<Record<string, unknown> | null>(null);

  const handleAdd = useCallback(() => {
    setEditRecord(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((record: Record<string, unknown>) => {
    setEditRecord(record);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((record: Record<string, unknown>) => {
    setDeleteRecord(record);
  }, []);

  async function handleFormSubmit(values: Record<string, unknown>) {
    if (editRecord) {
      const { id: _, created_at: _c, updated_at: _u, ...changes } = values;
      await update(editRecord.id as string, changes);
    } else {
      const { id: _, created_at: _c, updated_at: _u, ...record } = values;
      await insert(record);
    }
  }

  async function handleDeleteConfirm() {
    if (deleteRecord) {
      await remove(deleteRecord.id as string);
      setDeleteRecord(null);
    }
  }

  return (
    <>
      <PageHeader title={title} description={description} />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <RecordForm
        open={formOpen}
        onOpenChange={setFormOpen}
        columns={columns}
        initialValues={editRecord || undefined}
        onSubmit={handleFormSubmit}
        mode={editRecord ? "edit" : "create"}
        title={editRecord ? `Edit ${title.replace(/s$/, "")}` : `New ${title.replace(/s$/, "")}`}
      />

      <DeleteDialog
        open={!!deleteRecord}
        onOpenChange={(open) => !open && setDeleteRecord(null)}
        onConfirm={handleDeleteConfirm}
        label={deleteRecord?.[labelField || "id"] as string}
      />
    </>
  );
}
