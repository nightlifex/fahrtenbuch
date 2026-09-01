import { CarFront, CheckCircle2, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Trip } from "../types";
import { directionLabel, formatCurrency, formatDate, legCount } from "../utils/trips";

type RecentTripsProps = {
  trips: Trip[];
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  onLoadSamples?: () => void;
};

export function RecentTrips({ trips, onEdit, onDelete, onLoadSamples }: RecentTripsProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? trips : trips.slice(0, 10);
  return (
    <section className="recent-trips-card">
      <div className="card-heading"><h2>Letzte Einträge</h2><span>{trips.length} {trips.length === 1 ? "Fahrt" : "Fahrten"}</span></div>
      {trips.length === 0 ? (
        <div className="empty-trips"><span><CarFront /></span><h3>Noch keine Fahrt gespeichert</h3><p>Trage deine erste Fahrt ein oder starte mit vollständig fiktiven Beispieldaten.</p>{onLoadSamples && <button className="button secondary" onClick={onLoadSamples}>Beispieldaten laden</button>}</div>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Datum</th><th>Rolle</th><th>Strecke</th><th>Strecke(n)</th><th>Kosten</th><th>Notiz</th><th>Aktionen</th></tr></thead>
              <tbody>{visible.map((trip) => (
                <tr key={trip.id}>
                  <td><span className="date-cell">{formatDate(trip.date)}</span></td>
                  <td><span className={`role-badge ${trip.role}`} >{trip.role === "driver" ? "Allein gefahren" : "Als Beifahrer"}</span></td>
                  <td><strong className="route-cell">{trip.startLocation}<span>→</span>{trip.destination}</strong></td>
                  <td>{directionLabel(trip)}</td>
                  <td>{trip.role === "driver" ? <span>–</span> : <span className="cost-cell">{legCount(trip) > 1 && `${legCount(trip)} × ${formatCurrency(trip.pricePerLegCents)} = `}<strong>{formatCurrency(trip.totalCostCents)}</strong></span>}</td>
                  <td className="note-cell">{trip.note || "–"}</td>
                  <td><span className="row-actions"><button className="icon-button" onClick={() => onEdit(trip)} aria-label={`Fahrt ${formatDate(trip.date)} bearbeiten`} title="Bearbeiten"><Pencil /></button><button className="icon-button danger-icon" onClick={() => onDelete(trip)} aria-label={`Fahrt ${formatDate(trip.date)} löschen`} title="Löschen"><Trash2 /></button></span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {trips.length > 10 && <button className="show-all" onClick={() => setShowAll((value) => !value)}>{showAll ? "Nur letzte 10 anzeigen" : "Alle Fahrten anzeigen"}<ChevronDown className={showAll ? "rotated" : ""} /></button>}
          {trips.length <= 10 && <div className="table-status"><CheckCircle2 />Alle Fahrten werden angezeigt</div>}
        </>
      )}
    </section>
  );
}

