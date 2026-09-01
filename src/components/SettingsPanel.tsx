import { useRef, useState } from "react";
import { AlertTriangle, Database, Download, FileJson, FileSpreadsheet, HardDrive, Info, Save, ShieldCheck, Trash2, Upload } from "lucide-react";
import type { AppSettings, FahrtenbuchBackup, Trip } from "../types";
import { calculateStats, createBackup, estimateBytes, formatCurrency, formatDateTime, parseBackup, tripsToCsv } from "../utils/trips";
import { Dialog } from "./Dialog";

type ImportResult = { imported: number; duplicates: number };
type SettingsPanelProps = {
  settings: AppSettings;
  trips: Trip[];
  onUpdateSettings: (settings: AppSettings) => void;
  onImportReplace: (backup: FahrtenbuchBackup) => Promise<ImportResult>;
  onImportMerge: (backup: FahrtenbuchBackup) => Promise<ImportResult>;
  onDeleteAll: () => Promise<void>;
  onToast: (message: string) => void;
};

function downloadFile(contents: string, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}

export function SettingsPanel({ settings, trips, onUpdateSettings, onImportReplace, onImportMerge, onDeleteAll, onToast }: SettingsPanelProps) {
  const [userName, setUserName] = useState(settings.userName);
  const [defaultPrice, setDefaultPrice] = useState(((settings.defaultPricePerLegCents ?? 0) / 100).toFixed(2).replace(".", ","));
  const [theme, setTheme] = useState(settings.theme);
  const [importBackup, setImportBackup] = useState<FahrtenbuchBackup>();
  const [importError, setImportError] = useState<string>();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const stats = calculateStats(trips);
  const lastChanged = trips.map((trip) => trip.updatedAt ?? trip.createdAt).sort().at(-1);
  const size = estimateBytes(trips, settings);

  function savePreferences(event: React.FormEvent) {
    event.preventDefault();
    const parsed = Number.parseFloat(defaultPrice.replace(",", "."));
    onUpdateSettings({ ...settings, userName: userName.trim() || "Max Mustermann", theme, defaultPricePerLegCents: Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : null });
    onToast("Einstellungen wurden lokal gespeichert.");
  }

  function exportBackup() {
    const now = new Date().toISOString();
    const nextSettings = { ...settings, lastBackupAt: now };
    downloadFile(JSON.stringify(createBackup(trips, nextSettings), null, 2), "application/json", `fahrtenbuch-backup-${now.slice(0, 10)}.json`);
    onUpdateSettings(nextSettings); onToast("Backup wurde erstellt.");
  }

  function exportCsv() {
    downloadFile(tripsToCsv(trips), "text/csv;charset=utf-8", `fahrtenbuch-fahrten-${new Date().toISOString().slice(0, 10)}.csv`);
    onToast("CSV-Datei wurde erstellt.");
  }

  async function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try { setImportError(undefined); setImportBackup(parseBackup(JSON.parse(await file.text()))); }
    catch (error) { setImportBackup(undefined); setImportError(error instanceof Error ? error.message : "Diese Datei ist kein gültiges Fahrtenbuch-Backup."); }
  }

  async function runImport(mode: "replace" | "merge") {
    if (!importBackup) return;
    const result = mode === "replace" ? await onImportReplace(importBackup) : await onImportMerge(importBackup);
    setImportBackup(undefined); onToast(`${result.imported} Fahrten importiert${result.duplicates ? `, ${result.duplicates} bereits vorhanden` : ""}.`);
  }

  return (
    <div className="settings-page">
      <div className="page-intro"><h1>Einstellungen</h1></div>
      <section className="settings-card">
        <div className="settings-heading"><span className="settings-icon tone-blue"><Save /></span><span><h2>Allgemeine Einstellungen</h2><p>Diese Einstellungen werden zusammen mit dem Backup gesichert.</p></span></div>
        <form className="settings-form" onSubmit={savePreferences}>
          <label className="field"><span>Nutzername</span><input value={userName} onChange={(event) => setUserName(event.target.value)} /></label>
          <label className="field"><span>Standardpreis pro Strecke</span><span className="money-input wide"><input value={defaultPrice} onChange={(event) => setDefaultPrice(event.target.value)} inputMode="decimal" /><b>€</b></span></label>
          <label className="field"><span>Darstellung</span><select value={theme} onChange={(event) => setTheme(event.target.value as AppSettings["theme"])}><option value="light">Hell</option><option value="dark">Dunkel</option><option value="system">Systemeinstellung</option></select></label>
          <button className="button primary"><Save />Einstellungen speichern</button>
        </form>
      </section>
      <section className="settings-card backup-card" id="daten-backup">
        <div className="settings-heading"><span className="settings-icon tone-blue"><Database /></span><span><h2>Daten &amp; Backup</h2><p>Sicherung, Wiederherstellung und Tabellenexport.</p></span></div>
        <div className="privacy-notice"><ShieldCheck /><p><strong>Deine Daten bleiben bei dir.</strong> Deine Fahrten und Einstellungen werden ausschließlich lokal in diesem Browser gespeichert. Sie werden nicht an GitHub oder andere Server übertragen. Erstelle regelmäßig eine Sicherung, damit deine Daten bei einem Browserwechsel oder beim Löschen der Websitedaten nicht verloren gehen.</p></div>
        <div className="storage-stats"><span><HardDrive /><small>Gespeicherte Fahrten</small><strong>{trips.length}</strong></span><span><Database /><small>Lokale Datengröße</small><strong>ca. {Math.max(1, Math.ceil(size / 1024))} KB</strong></span><span><Info /><small>Letzte Änderung</small><strong>{formatDateTime(lastChanged)}</strong></span><span><FileJson /><small>Letztes Backup</small><strong>{formatDateTime(settings.lastBackupAt)}</strong></span></div>
        <div className="backup-actions">
          <article><span className="action-icon tone-blue"><Download /></span><div><h3>JSON-Backup</h3><p>Alle Fahrten und Einstellungen sichern und später wiederherstellen.</p><button className="button primary" onClick={exportBackup}><Download />Backup herunterladen</button></div></article>
          <article><span className="action-icon tone-purple"><Upload /></span><div><h3>Backup importieren</h3><p>Die Datei wird ausschließlich lokal in deinem Browser gelesen.</p><input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={chooseFile} /><button className="button secondary" onClick={() => fileInput.current?.click()}><Upload />Backup auswählen</button>{importError && <p className="import-error"><AlertTriangle />{importError}</p>}</div></article>
          <article><span className="action-icon tone-green"><FileSpreadsheet /></span><div><h3>CSV-Export</h3><p>Für Excel, LibreOffice, Numbers und andere Tabellenprogramme.</p><button className="button secondary" onClick={exportCsv} disabled={!trips.length}><FileSpreadsheet />CSV exportieren</button></div></article>
        </div>
        <div className="danger-zone"><span><Trash2 /><span><strong>Alle lokalen Daten löschen</strong><small>Diese Aktion kann nur mit einem vorhandenen Backup rückgängig gemacht werden.</small></span></span><button className="button danger-outline" onClick={() => setDeleteDialog(true)}><Trash2 />Alle Daten löschen</button></div>
      </section>
      {importBackup && <Dialog title="Backup gefunden" onClose={() => setImportBackup(undefined)}><div className="import-summary"><span><strong>{importBackup.trips.length}</strong><small>Fahrten</small></span><span><strong>{calculateStats(importBackup.trips).drivers}</strong><small>Alleinfahrten</small></span><span><strong>{calculateStats(importBackup.trips).passengers}</strong><small>Beifahrer-Fahrten</small></span><span><strong>{formatCurrency(calculateStats(importBackup.trips).totalCostCents)}</strong><small>Mitfahrkosten</small></span></div><p>Exportiert am: <strong>{formatDateTime(importBackup.exportedAt)}</strong></p><div className="import-warning"><AlertTriangle />Beim Ersetzen werden deine aktuell gespeicherten Fahrten gelöscht.</div><div className="dialog-actions stacked-mobile"><button className="button danger-outline" onClick={() => runImport("replace")}>Bestehende Daten ersetzen</button><button className="button primary" onClick={() => runImport("merge")}>Mit bestehenden Daten zusammenführen</button></div></Dialog>}
      {deleteDialog && <Dialog title="Alle Daten löschen?" onClose={() => setDeleteDialog(false)} danger><p>Möchtest du wirklich alle lokal gespeicherten Fahrten und Einstellungen löschen? Diese Aktion kann nur über ein vorhandenes Backup rückgängig gemacht werden.</p><div className="dialog-actions"><button className="button secondary" onClick={() => setDeleteDialog(false)}>Abbrechen</button><button className="button danger" onClick={async () => { await onDeleteAll(); setDeleteDialog(false); onToast("Alle lokalen Daten wurden gelöscht."); }}>Endgültig löschen</button></div></Dialog>}
    </div>
  );
}

