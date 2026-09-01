import { BarChart3, CalendarDays, CarFront, Construction, FileBarChart, Route, UsersRound, WalletCards } from "lucide-react";
import { useState } from "react";
import type { AppSettings, Trip, TripStats } from "../types";
import { directionLabel, formatCurrency, formatDate } from "../utils/trips";
import { Dialog } from "./Dialog";
import { RecentTrips } from "./RecentTrips";
import { TripForm } from "./TripForm";

export function TripsPage({ trips, settings, onSave, onDelete, onToast }: { trips: Trip[]; settings: AppSettings; onSave: (trip: Trip) => Promise<void>; onDelete: (id: string) => Promise<void>; onToast: (message: string) => void }) {
  const [editing, setEditing] = useState<Trip>();
  const [deleting, setDeleting] = useState<Trip>();
  return <><div className="page-intro"><h1>Fahrten</h1></div>{editing && <TripForm settings={settings} editingTrip={editing} onSave={onSave} onCancelEdit={() => setEditing(undefined)} onSuccess={onToast} />}<RecentTrips trips={trips} onEdit={setEditing} onDelete={setDeleting} />{deleting && <Dialog title="Fahrt löschen?" danger onClose={() => setDeleting(undefined)}><p>Möchtest du die Fahrt von <strong>{deleting.startLocation}</strong> nach <strong>{deleting.destination}</strong> wirklich löschen?</p><div className="dialog-actions"><button className="button secondary" onClick={() => setDeleting(undefined)}>Abbrechen</button><button className="button danger" onClick={async () => { await onDelete(deleting.id); setDeleting(undefined); onToast("Fahrt wurde gelöscht."); }}>Fahrt löschen</button></div></Dialog>}</>;
}

export function StatisticsPage({ stats }: { stats: TripStats }) {
  return <><div className="page-intro"><h1>Statistiken</h1></div><section className="insights-grid"><article className="insight-card"><div className="settings-heading"><span className="settings-icon tone-blue"><BarChart3 /></span><span><h2>Rollenverteilung</h2><p>{stats.total} Fahrten insgesamt</p></span></div><div className="bar-list"><div><span><CarFront />Alleinfahrten <b>{stats.driverPercent} %</b></span><i><em style={{ width: `${stats.driverPercent}%` }} className="green" /></i></div><div><span><UsersRound />Beifahrer-Fahrten <b>{stats.passengerPercent} %</b></span><i><em style={{ width: `${stats.passengerPercent}%` }} className="purple" /></i></div></div></article><article className="insight-card cost-highlight"><span className="settings-icon tone-orange"><WalletCards /></span><small>Mitfahrkosten gesamt</small><strong>{formatCurrency(stats.totalCostCents)}</strong><p>Über alle gespeicherten Beifahrer-Fahrten</p></article></section></>;
}

export function CostsPage({ trips }: { trips: Trip[] }) {
  const passengerTrips = trips.filter((trip) => trip.role === "passenger");
  return <><div className="page-intro"><h1>Kosten</h1></div><section className="simple-list-card"><div className="card-heading"><h2><WalletCards />Mitfahrkosten</h2><strong>{formatCurrency(passengerTrips.reduce((sum, trip) => sum + trip.totalCostCents, 0))}</strong></div>{passengerTrips.length ? passengerTrips.map((trip) => <article className="cost-list-row" key={trip.id}><span className="cost-list-icon tone-purple"><UsersRound /></span><span><strong>{trip.startLocation} → {trip.destination}</strong><small>{formatDate(trip.date)} · {directionLabel(trip)}</small></span><b>{formatCurrency(trip.totalCostCents)}</b></article>) : <div className="empty-trips compact"><WalletCards /><h3>Noch keine Mitfahrkosten</h3><p>Beifahrer-Fahrten erscheinen automatisch in dieser Übersicht.</p></div>}</section></>;
}

export function PlaceholderPage({ type }: { type: "calendar" | "routes" | "reports" }) {
  const content = type === "calendar" ? { icon: CalendarDays, title: "Kalender", text: "Eine kalendarische Ansicht deiner Fahrten wird in einer kommenden Version ergänzt." } : type === "routes" ? { icon: Route, title: "Routen", text: "Häufige Strecken und Start-Ziel-Auswertungen werden hier künftig zusammengefasst." } : { icon: FileBarChart, title: "Berichte", text: "Ausführliche Monats- und Jahresberichte sind für eine kommende Version vorgesehen." };
  const Icon = content.icon;
  return <><div className="page-intro"><h1>{content.title}</h1></div><section className="placeholder-card"><span className="placeholder-icon tone-blue"><Icon /></span><Construction /><h2>{content.title} wird erweitert</h2><p>{content.text}</p><small>Deine bestehenden Fahrten bleiben davon unberührt und weiterhin vollständig lokal gespeichert.</small></section></>;
}

