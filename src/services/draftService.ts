import type { FormValues } from '../types/form';

const DRAFT_KEY = 'adEditDraft';

export function saveDraftToLocalStorage(values: FormValues, id: string) {
  const draft = { id, values, savedAt: new Date().toISOString() };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraftFromLocalStorage(id: string): FormValues | null {
  const stored = localStorage.getItem(DRAFT_KEY);
  if (!stored) return null;
  try {
    const draft = JSON.parse(stored);
    return draft.id === id ? draft.values : null;
  } catch {
    return null;
  }
}

export function clearDraftFromLocalStorage() {
  localStorage.removeItem(DRAFT_KEY);
}