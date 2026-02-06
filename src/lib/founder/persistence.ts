import type { FounderProfile } from "./types";

const STORAGE_KEY = "vc-os-founder-profile";

export function saveFounderProfile(profile: FounderProfile): void {
  if (typeof window === "undefined") return;
  const data = { ...profile, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadFounderProfile(): FounderProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FounderProfile;
  } catch {
    return null;
  }
}

export function clearFounderProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
