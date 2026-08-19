import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppSettings, FahrtenbuchBackup, Trip } from "../types";
import { clearTrips, getAllTrips, mergeTrips, putTrip, removeTrip, replaceAllTrips } from "../storage/tripDatabase";
import { clearSettings, loadSettings, saveSettings } from "../storage/settingsStorage";
import { calculateStats, sortTrips } from "../utils/trips";

const SAMPLE_TRIPS: Trip[] = [
  { id: "sample-koeln-bonn", date: "2026-03-12", role: "driver", startLocation: "Köln", destination: "Bonn", outbound: true, returnTrip: false, pricePerLegCents: 0, totalCostCents: 0, note: "Kundentermin", createdAt: "2026-03-12T08:00:00.000Z" },
  { id: "sample-bonn-koeln", date: "2026-03-14", role: "passenger", startLocation: "Bonn", destination: "Köln", outbound: true, returnTrip: true, pricePerLegCents: 850, totalCostCents: 1700, note: "Fahrt zur Messe", createdAt: "2026-03-14T08:00:00.000Z" },
  { id: "sample-duesseldorf-essen", date: "2026-03-18", role: "passenger", startLocation: "Düsseldorf", destination: "Essen", outbound: true, returnTrip: false, pricePerLegCents: 600, totalCostCents: 600, note: "Team-Meeting", createdAt: "2026-03-18T08:00:00.000Z" },
];

export function useFahrtenbuch() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    getAllTrips().then((stored) => setTrips(sortTrips(stored))).catch(() => setError("Die lokalen Daten konnten nicht geladen werden.")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const dark = settings.theme === "dark" || (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [settings.theme]);

  const saveTrip = useCallback(async (trip: Trip) => {
    await putTrip(trip);
    setTrips((current) => sortTrips([...current.filter((item) => item.id !== trip.id), trip]));
  }, []);

  const deleteTrip = useCallback(async (id: string) => {
    await removeTrip(id);
    setTrips((current) => current.filter((trip) => trip.id !== id));
  }, []);

  const updateSettings = useCallback((next: AppSettings) => {
    saveSettings(next);
    setSettings(next);
  }, []);

  const importReplace = useCallback(async (backup: FahrtenbuchBackup) => {
    await replaceAllTrips(backup.trips);
    saveSettings(backup.settings);
    setTrips(sortTrips(backup.trips));
    setSettings(backup.settings);
    return { imported: backup.trips.length, duplicates: 0 };
  }, []);

  const importMerge = useCallback(async (backup: FahrtenbuchBackup) => {
    const result = await mergeTrips(trips, backup.trips);
    const mergedSettings = { ...settings, defaultPricePerLegCents: backup.settings.defaultPricePerLegCents };
    saveSettings(mergedSettings);
    setTrips(sortTrips(result.merged));
    setSettings(mergedSettings);
    return { imported: result.imported, duplicates: result.duplicates };
  }, [settings, trips]);

  const deleteAllData = useCallback(async () => {
    await clearTrips();
    const defaults = clearSettings();
    setTrips([]);
    setSettings(defaults);
  }, []);

  const loadSamples = useCallback(async () => {
    await replaceAllTrips(SAMPLE_TRIPS);
    setTrips(sortTrips(SAMPLE_TRIPS));
  }, []);

  return {
    trips,
    settings,
    stats: useMemo(() => calculateStats(trips), [trips]),
    loading,
    error,
    saveTrip,
    deleteTrip,
    updateSettings,
    importReplace,
    importMerge,
    deleteAllData,
    loadSamples,
  };
}
