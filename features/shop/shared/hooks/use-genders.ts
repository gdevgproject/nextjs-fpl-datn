"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface Gender {
  id: number;
  name: string;
}

async function fetchGenders(): Promise<Gender[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("genders")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export function useGenders(initialData?: Gender[]) {
  const { data, isLoading, error } = useQuery<Gender[]>({
    queryKey: ["genders"],
    queryFn: fetchGenders,
    staleTime: 1000 * 60 * 60,
    initialData,
  });
  return { genders: data || [], isLoading, error };
}
