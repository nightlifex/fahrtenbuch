import type { AppSettings, FahrtenbuchBackup, Trip, TripStats } from "../types";

export const BACKUP_VERSION = 1 as const;

export function legCount(trip: Pick<Trip, "outbound" | "returnTrip">): number {
  return Number(trip.outbound) + Number(trip.returnTrip);
}

export function calculateTotalCostCents(role: Trip["role"], legs: number, pricePerLegCents: number): number {
  if (role === "driver") return 0;
  return Math.max(0, Math.round(pricePerLegCents)) * Math.max(0, legs);
}

export function calculateStats(trips: Trip[]): TripStats {
  const drivers = trips.filter((trip) => trip.role === "driver").length;
  const passengers = trips.length - drivers;
  return {
    total: trips.length,
    drivers,
    passengers,
    driverPercent: trips.length ? Math.round((drivers / trips.length) * 100) : 0,
    passengerPercent: trips.length ? Math.round((passengers / trips.length) * 100) : 0,
    totalCostCents: trips.reduce((sum, trip) => sum + (trip.role === "passenger" ? trip.totalCostCents : 0), 0),
  };
}

export const currencyFormatter = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export function formatCurrency(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}.${month}.${year}` : date;
}

export function formatDateTime(value?: string): string {
  if (!value) return "Nicht bekannt";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function directionLabel(trip: Pick<Trip, "outbound" | "returnTrip">): string {
  if (trip.outbound && trip.returnTrip) return "Hin- und Rückfahrt";
  return trip.outbound ? "Hinfahrt" : "Rückfahrt";
}

export function sortTrips(trips: Trip[]): Trip[] {
  return [...trips].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export function createBackup(trips: Trip[], settings: AppSettings): FahrtenbuchBackup {
  return { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), settings, trips };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTrip(value: unknown): value is Trip {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && typeof value.date === "string" &&
    (value.role === "driver" || value.role === "passenger") &&
    typeof value.startLocation === "string" && typeof value.destination === "string" &&
    typeof value.outbound === "boolean" && typeof value.returnTrip === "boolean" &&
    Number.isInteger(value.pricePerLegCents) && (value.pricePerLegCents as number) >= 0 &&
    Number.isInteger(value.totalCostCents) && (value.totalCostCents as number) >= 0 &&
    typeof value.createdAt === "string" &&
    (value.note === undefined || typeof value.note === "string") &&
    (value.updatedAt === undefined || typeof value.updatedAt === "string") &&
    (value.outbound || value.returnTrip);
}

function isSettings(value: unknown): value is AppSettings {
  if (!isRecord(value)) return false;
  return value.currency === "EUR" &&
    (value.defaultPricePerLegCents === null || (Number.isInteger(value.defaultPricePerLegCents) && (value.defaultPricePerLegCents as number) >= 0)) &&
    (value.theme === "light" || value.theme === "dark" || value.theme === "system") &&
    typeof value.userName === "string" &&
    (value.lastBackupAt === undefined || typeof value.lastBackupAt === "string");
}

export function parseBackup(value: unknown): FahrtenbuchBackup {
  if (!isRecord(value)) throw new Error("Diese Datei ist kein gültiges Fahrtenbuch-Backup.");
  if (value.version !== BACKUP_VERSION) throw new Error("Dieses Backup verwendet eine nicht unterstützte Version.");
  if (typeof value.exportedAt !== "string" || !isSettings(value.settings) || !Array.isArray(value.trips) || !value.trips.every(isTrip)) {
    throw new Error("Diese Datei ist kein gültiges Fahrtenbuch-Backup.");
  }
  return value as FahrtenbuchBackup;
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function tripsToCsv(trips: Trip[]): string {
  const header = ["Datum", "Rolle", "Start", "Ziel", "Hinfahrt", "Rückfahrt", "Preis pro Strecke", "Gesamtkosten", "Notiz"];
  const rows = sortTrips(trips).map((trip) => [
    formatDate(trip.date), trip.role === "driver" ? "Allein gefahren" : "Beifahrer", trip.startLocation,
    trip.destination, trip.outbound ? "Ja" : "Nein", trip.returnTrip ? "Ja" : "Nein",
    (trip.pricePerLegCents / 100).toFixed(2).replace(".", ","), (trip.totalCostCents / 100).toFixed(2).replace(".", ","), trip.note ?? "",
  ].map(csvCell).join(";"));
  return `\uFEFF${header.map(csvCell).join(";")}\r\n${rows.join("\r\n")}`;
}

export function estimateBytes(trips: Trip[], settings: AppSettings): number {
  return new Blob([JSON.stringify({ trips, settings })]).size;
}
