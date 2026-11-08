import { useEffect, useState } from "react";
import type { SavedItem } from "@/shared/schemas";
import { savedItemRepository } from "@/storage/saved-items";

export type SavedItemsState = {
  items: SavedItem[];
  loading: boolean;
  error: string | null;
};

export function useSavedItems(): SavedItem[] {
  return useSavedItemsState().items;
}

export function useSavedItemsState(): SavedItemsState {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = savedItemRepository.observe().subscribe({
      next: (next) => {
        setItems(next);
        setLoading(false);
        setError(null);
      },
      error: (err) => {
        console.error(err);
        setLoading(false);
        setError("Não foi possível carregar a lista.");
      },
    });
    return () => subscription.unsubscribe();
  }, []);

  return { items, loading, error };
}
