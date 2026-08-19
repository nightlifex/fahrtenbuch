import type { AppSettings } from "../types";

const SETTINGS_KEY = "fahrtenbuch:settings:v1";

export const DEFAULT_SETTINGS: AppSettings = {
  currency: "EUR",
  defaultPricePerLegCents: 850,
  theme: "light",
  userName: "Max Mustermann",
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const value = JSON.parse(raw) as Partial<AppSettings>;
    return {
      currency: "EUR",
      defaultPricePerLegCents: typeof value.defaultPricePerLegCents === "number" ? Math.max(0, Math.round(value.defaultPricePerLegCents)) : DEFAULT_SETTINGS.defaultPricePerLegCents,
      theme: value.theme === "dark" || value.theme === "system" ? value.theme : "light",
      userName: typeof value.userName === "string" && value.userName.trim() ? value.userName : DEFAULT_SETTINGS.userName,
      lastBackupAt: typeof value.lastBackupAt === "string" ? value.lastBackupAt : undefined,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function clearSettings(): AppSettings {
  localStorage.removeItem(SETTINGS_KEY);
  return DEFAULT_SETTINGS;
}
