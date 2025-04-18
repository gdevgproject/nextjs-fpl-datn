"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface Category {
  id: number;
  name: string;
  slug: string;
}

async function fetchCategories(): Promise<Category[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export function useCategories(initialData?: Category[]) {
  const { data, isLoading, error } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
    initialData,
  });
  return { categories: data || [], isLoading, error };
}
