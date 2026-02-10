"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UseSupabaseQueryOptions {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filter?: { column: string; value: unknown };
}

export function useSupabaseQuery<T extends { id: string | number }>(
  table: string,
  options?: UseSupabaseQueryOptions
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from(table).select(options?.select || "*");

      if (options?.filter) {
        query = query.eq(options.filter.column, options.filter.value);
      }
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      const { data: result, error: err } = await query;
      if (err) throw err;
      setData((result as unknown as T[]) || []);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      toast.error(`Failed to load ${table}`, { description: err.message });
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const insert = useCallback(
    async (record: Partial<T>) => {
      try {
        const { error: err } = await supabase.from(table).insert(record);
        if (err) throw err;
        toast.success("Record created");
        await fetch();
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        toast.error("Failed to create", { description: err.message });
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, fetch]
  );

  const update = useCallback(
    async (id: string | number, changes: Partial<T>) => {
      try {
        const { error: err } = await supabase
          .from(table)
          .update(changes)
          .eq("id", id);
        if (err) throw err;
        toast.success("Record updated");
        await fetch();
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        toast.error("Failed to update", { description: err.message });
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, fetch]
  );

  const remove = useCallback(
    async (id: string | number) => {
      try {
        const { error: err } = await supabase
          .from(table)
          .delete()
          .eq("id", id);
        if (err) throw err;
        toast.success("Record deleted");
        await fetch();
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        toast.error("Failed to delete", { description: err.message });
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, fetch]
  );

  return { data, loading, error, refetch: fetch, insert, update, remove };
}
