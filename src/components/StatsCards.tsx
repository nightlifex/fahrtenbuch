import { CarFront, UsersRound, WalletCards } from "lucide-react";
import type { TripStats } from "../types";
import { formatCurrency } from "../utils/trips";

export function StatsCards({ stats }: { stats: TripStats }) {
  const cards = [
    { label: "Fahrten gesamt", value: String(stats.total), detail: "Alle Zeit", icon: CarFront, tone: "blue" },
    { label: "Alleinfahrten", value: String(stats.drivers), detail: `${stats.driverPercent} %`, icon: CarFront, tone: "green" },
    { label: "Beifahrer-Fahrten", value: String(stats.passengers), detail: `${stats.passengerPercent} %`, icon: UsersRound, tone: "purple" },
    { label: "Mitfahrkosten gesamt", value: formatCurrency(stats.totalCostCents), detail: "Alle Zeit", icon: WalletCards, tone: "orange" },
  ];
  return (
    <section className="stats-grid" aria-label="Statistikübersicht">
      {cards.map(({ label, value, detail, icon: Icon, tone }) => (
        <article className="stat-card" key={label}>
          <span className={`stat-icon tone-${tone}`}><Icon /></span>
          <span className="stat-copy"><small>{label}</small><strong>{value}</strong><em>{detail}</em></span>
        </article>
      ))}
    </section>
  );
}
