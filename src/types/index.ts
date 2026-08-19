export type TripRole = "driver" | "passenger";

export type Trip = {
  id: string;
  date: string;
  role: TripRole;
  startLocation: string;
  destination: string;
  outbound: boolean;
  returnTrip: boolean;
  pricePerLegCents: number;
  totalCostCents: number;
  note?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ThemePreference = "light" | "dark" | "system";

export type AppSettings = {
  currency: "EUR";
  defaultPricePerLegCents: number | null;
  theme: ThemePreference;
  userName: string;
  lastBackupAt?: string;
};

export type FahrtenbuchBackup = {
  version: 1;
  exportedAt: string;
  settings: AppSettings;
  trips: Trip[];
};

export type TripStats = {
  total: number;
  drivers: number;
  passengers: number;
  driverPercent: number;
  passengerPercent: number;
  totalCostCents: number;
};
