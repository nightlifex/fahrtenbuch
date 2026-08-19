import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { AppSettings, Trip, TripStats } from "../types";
import { Dialog } from "./Dialog";
import { RecentTrips } from "./RecentTrips";
import { StatsCards } from "./StatsCards";
import { TripForm } from "./TripForm";

type OverviewProps = {
  trips: Trip[];
  stats: TripStats;
  settings: AppSettings;
  onSave: (trip: Trip) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onLoadSamples: () => Promise<void>;
  onToast: (message: string) => void;
};

export function Overview({ trips, stats, settings, onSave, onDelete, onLoadSamples, onToast }: OverviewProps) {
  const [editingTrip, setEditingTrip] = useState<Trip>();
  const [deleteTarget, setDeleteTarget] = useState<Trip>();
  async function confirmDelete() {
    if (!deleteTarget) return;
    await onDelete(deleteTarget.id); setDeleteTarget(undefined); onToast("Fahrt wurde gelöscht.");
  }
  return (
    <>
      <div className="page-intro"><span><p>Dein persönliches Fahrtenbuch</p><h1>Übersicht</h1></span><span className="local-pill"><ShieldCheck />Daten bleiben lokal</span></div>
      <StatsCards stats={stats} />
      <TripForm settings={settings} editingTrip={editingTrip} onSave={onSave} onCancelEdit={() => setEditingTrip(undefined)} onSuccess={onToast} />
      <RecentTrips trips={trips} onEdit={setEditingTrip} onDelete={setDeleteTarget} onLoadSamples={async () => { await onLoadSamples(); onToast("Fiktive Beispieldaten wurden geladen."); }} />
      {deleteTarget && <Dialog title="Fahrt löschen?" onClose={() => setDeleteTarget(undefined)} danger><p>Möchtest du die Fahrt von <strong>{deleteTarget.startLocation}</strong> nach <strong>{deleteTarget.destination}</strong> wirklich löschen?</p><div className="dialog-actions"><button className="button secondary" onClick={() => setDeleteTarget(undefined)}>Abbrechen</button><button className="button danger" onClick={confirmDelete}>Fahrt löschen</button></div></Dialog>}
    </>
  );
}
