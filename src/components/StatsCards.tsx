import type { TripStats } from "../types";
import { formatCurrency } from "../utils/trips";

export function StatsCards({ stats }: { stats: TripStats }) {
  const cards = [
    { label: "Fahrten gesamt", value: String(stats.total), detail: "Gesamt" },
    { label: "Alleinfahrten", value: String(stats.drivers), detail: `${stats.driverPercent} %` },
    { label: "Beifahrer-Fahrten", value: String(stats.passengers), detail: `${stats.passengerPercent} %` },
    { label: "Mitfahrkosten", value: formatCurrency(stats.totalCostCents), detail: "Gesamt" },
  ];
  return (
    <section className="stats-grid" aria-label="Statistikübersicht">
      {cards.map(({ label, value, detail }) => (
        <article className="stat-card" key={label}>
          <span className="stat-copy"><small>{label}</small><strong>{value}</strong><em>{detail}</em></span>
        </article>
      ))}
    </section>
  );
}

