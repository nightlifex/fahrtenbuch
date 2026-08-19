import { describe, expect, it } from "vitest";
import type { AppSettings, Trip } from "../src/types";
import { calculateStats, calculateTotalCostCents, createBackup, parseBackup } from "../src/utils/trips";

const settings: AppSettings = { currency: "EUR", defaultPricePerLegCents: 850, theme: "light", userName: "Testnutzer" };
const passengerTrip: Trip = { id: "trip-1", date: "2026-08-19", role: "passenger", startLocation: "A", destination: "B", outbound: true, returnTrip: true, pricePerLegCents: 850, totalCostCents: 1700, createdAt: "2026-08-19T12:00:00.000Z" };
const driverTrip: Trip = { ...passengerTrip, id: "trip-2", role: "driver", returnTrip: false, pricePerLegCents: 0, totalCostCents: 0 };

describe("Kostenberechnung", () => {
  it("berechnet eine und zwei Strecken centgenau", () => {
    expect(calculateTotalCostCents("passenger", 1, 850)).toBe(850);
    expect(calculateTotalCostCents("passenger", 2, 850)).toBe(1700);
  });
  it("setzt Alleinfahrten immer auf null", () => expect(calculateTotalCostCents("driver", 2, 850)).toBe(0));
});

describe("Statistik und Backup", () => {
  it("zählt Rollen und Kosten korrekt", () => expect(calculateStats([passengerTrip, driverTrip])).toMatchObject({ total: 2, drivers: 1, passengers: 1, totalCostCents: 1700 }));
  it("erstellt und validiert ein Backup der Version 1", () => {
    const backup = createBackup([passengerTrip], settings);
    expect(backup.version).toBe(1);
    expect(parseBackup(backup).trips).toHaveLength(1);
  });
  it("weist ungültige Importdaten ab", () => expect(() => parseBackup({ version: 1, trips: "ungültig" })).toThrow());
});
