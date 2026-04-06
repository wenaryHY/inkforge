import { useCallback, useState } from 'react';
import { listMediaCategories, createMediaCategory, updateMediaCategory, deleteMediaCategory } from '../lib/api';
import type { MediaCategory, CreateMediaCategoryRequest, UpdateMediaCategoryRequest } from '../types';

export function useMediaCategories() {
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMediaCategories();
      setCategories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载分类失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateMediaCategoryRequest) => {
    try {
      const newCategory = await createMediaCategory(data);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      const message = err instanceof Error ? err.message : '创建分类失败';
      setError(message);
      throw err;
    }
  }, []);

  const update = useCallback(async (id: string, data: UpdateMediaCategoryRequest) => {
    try {
      const updated = await updateMediaCategory(id, data);
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新分类失败';
      setError(message);
      throw err;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteMediaCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除分类失败';
      setError(message);
      throw err;
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetch,
    create,
    update,
    remove,
  };
}
