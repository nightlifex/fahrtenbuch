import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CarFront, Check, CircleHelp, Info, MapPin, Route, UsersRound } from "lucide-react";
import type { AppSettings, Trip, TripRole } from "../types";
import { calculateTotalCostCents, formatCurrency, legCount } from "../utils/trips";

type FormErrors = Partial<Record<"date" | "start" | "destination" | "directions" | "price", string>>;
type TripFormProps = {
  settings: AppSettings;
  editingTrip?: Trip;
  onSave: (trip: Trip) => Promise<void>;
  onCancelEdit: () => void;
  onSuccess: (message: string) => void;
};

const today = () => {
  const value = new Date();
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function TripForm({ settings, editingTrip, onSave, onCancelEdit, onSuccess }: TripFormProps) {
  const [date, setDate] = useState(today());
  const [role, setRole] = useState<TripRole>("passenger");
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [outbound, setOutbound] = useState(true);
  const [returnTrip, setReturnTrip] = useState(true);
  const [price, setPrice] = useState(((settings.defaultPricePerLegCents ?? 850) / 100).toFixed(2).replace(".", ","));
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editingTrip) return;
    setDate(editingTrip.date); setRole(editingTrip.role); setStart(editingTrip.startLocation); setDestination(editingTrip.destination);
    setOutbound(editingTrip.outbound); setReturnTrip(editingTrip.returnTrip); setPrice((editingTrip.pricePerLegCents / 100).toFixed(2).replace(".", ",")); setNote(editingTrip.note ?? "");
    document.getElementById("trip-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editingTrip]);

  const priceCents = useMemo(() => {
    const normalized = price.trim().replace(/\s/g, "").replace("€", "").replace(",", ".");
    const number = Number.parseFloat(normalized);
    return Number.isFinite(number) ? Math.round(number * 100) : 0;
  }, [price]);
  const legs = Number(outbound) + Number(returnTrip);
  const totalCost = calculateTotalCostCents(role, legs, priceCents);

  function resetForm() {
    setDate(today()); setRole("passenger"); setStart(""); setDestination(""); setOutbound(true); setReturnTrip(true);
    setPrice(((settings.defaultPricePerLegCents ?? 850) / 100).toFixed(2).replace(".", ",")); setNote(""); setErrors({});
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!date) nextErrors.date = "Bitte wähle ein Datum aus.";
    if (!start.trim()) nextErrors.start = "Bitte gib einen Startort ein.";
    if (!destination.trim()) nextErrors.destination = "Bitte gib einen Zielort ein.";
    if (!outbound && !returnTrip) nextErrors.directions = "Wähle mindestens eine Richtung aus.";
    if (role === "passenger" && priceCents <= 0) nextErrors.price = "Der Preis muss größer als 0 sein.";
    setErrors(nextErrors); setSubmitError(undefined);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    const now = new Date().toISOString();
    const trip: Trip = {
      id: editingTrip?.id ?? crypto.randomUUID(), date, role, startLocation: start.trim(), destination: destination.trim(),
      outbound, returnTrip, pricePerLegCents: role === "passenger" ? priceCents : 0,
      totalCostCents: totalCost, note: note.trim() || undefined, createdAt: editingTrip?.createdAt ?? now,
      updatedAt: editingTrip ? now : undefined,
    };
    try {
      await onSave(trip);
      onSuccess(editingTrip ? "Änderungen wurden gespeichert." : "Fahrt wurde lokal gespeichert.");
      resetForm();
      if (editingTrip) onCancelEdit();
    } catch { setSubmitError("Die Fahrt konnte nicht lokal gespeichert werden. Bitte versuche es erneut."); }
    finally { setSaving(false); }
  }

  function cancel() { resetForm(); onCancelEdit(); }

  return (
    <section className="trip-entry-card" id="trip-form">
      <form className="trip-form" onSubmit={submit} noValidate>
        <div className="section-heading"><span className="heading-icon"><CarFront /></span><span><h1>{editingTrip ? "Fahrt bearbeiten" : "Fahrt eintragen"}</h1><p>Erfasse deine Fahrt schnell und einfach.</p></span></div>
        <div className="form-grid top-fields">
          <label className="field"><span>Datum</span><span className="input-with-icon"><CalendarDays /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-invalid={Boolean(errors.date)} /></span>{errors.date && <small className="field-error">{errors.date}</small>}</label>
          <fieldset className="field role-field"><legend>Rolle <span title="Legt fest, ob Mitfahrkosten entstehen."><CircleHelp /></span></legend><div className="segmented">
            <button type="button" className={role === "driver" ? "selected driver" : ""} onClick={() => setRole("driver")} aria-pressed={role === "driver"}><CarFront />Allein gefahren</button>
            <button type="button" className={role === "passenger" ? "selected passenger" : ""} onClick={() => setRole("passenger")} aria-pressed={role === "passenger"}><UsersRound />Als Beifahrer</button>
          </div></fieldset>
        </div>
        <div className="form-grid">
          <label className="field"><span>Startort</span><span className="input-with-icon"><MapPin /><input value={start} onChange={(event) => setStart(event.target.value)} placeholder="z. B. Düsseldorf" aria-invalid={Boolean(errors.start)} /></span>{errors.start && <small className="field-error">{errors.start}</small>}</label>
          <label className="field"><span>Zielort</span><span className="input-with-icon"><MapPin /><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="z. B. Essen" aria-invalid={Boolean(errors.destination)} /></span>{errors.destination && <small className="field-error">{errors.destination}</small>}</label>
        </div>
        <fieldset className="direction-field"><legend>Strecke(n) <span title="Jede ausgewählte Richtung entspricht einer Strecke."><CircleHelp /></span></legend><div className="direction-options">
          <button type="button" className={outbound ? "selected" : ""} onClick={() => setOutbound((value) => !value)} aria-pressed={outbound}><span className="check-box">{outbound && <Check />}</span>Hinfahrt</button>
          <button type="button" className={returnTrip ? "selected" : ""} onClick={() => setReturnTrip((value) => !value)} aria-pressed={returnTrip}><span className="check-box">{returnTrip && <Check />}</span>Rückfahrt</button>
        </div><small>{outbound && returnTrip ? "Hin- und Rückfahrt = 2 Strecken" : "Eine Richtung = 1 Strecke"}</small>{errors.directions && <small className="field-error">{errors.directions}</small>}</fieldset>
        <label className="field note-field"><span>Notiz <em>(optional)</em></span><textarea value={note} onChange={(event) => setNote(event.target.value.slice(0, 250))} placeholder="z. B. Zweck der Fahrt, Treffpunkt, besondere Hinweise …" maxLength={250} /><small className="counter">{note.length} / 250</small></label>
        {submitError && <div className="global-error form-submit-error">{submitError}</div>}
        <div className="form-actions"><button type="button" className="button secondary" onClick={cancel}>{editingTrip ? "Bearbeitung abbrechen" : "Abbrechen"}</button><button className="button primary" disabled={saving}><Check />{saving ? "Wird gespeichert …" : editingTrip ? "Änderungen speichern" : "Fahrt speichern"}</button></div>
      </form>
      <aside className={`cost-panel ${role === "driver" ? "cost-panel-disabled" : ""}`} aria-live="polite">
        <div className="cost-panel-heading"><h2>Kosten <span>(Fahrgemeinschaft)</span></h2><span title="Mitfahrkosten werden nur für Beifahrer-Fahrten berechnet."><Info /></span></div>
        <div className="cost-banner">{role === "passenger" ? <><UsersRound /><span>Als Beifahrer beteiligst du dich an den Fahrtkosten. Jede Strecke kostet einen Betrag.</span></> : <><CarFront /><span>Bei einer Alleinfahrt entstehen keine Mitfahrkosten.</span></>}</div>
        <div className="route-illustration" aria-hidden="true"><span className="city city-one" /><span className="city city-two" /><span className="route-line" /><span className="route-start" /><span className="route-end"><MapPin /></span><span className="route-car"><CarFront /></span></div>
        <label className="cost-row"><span><strong>Preis pro Strecke</strong><small>z. B. anteilige Spritkosten</small></span><span className="money-input"><input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" disabled={role === "driver"} aria-invalid={Boolean(errors.price)} /><b>€</b></span></label>
        {errors.price && <small className="field-error cost-error">{errors.price}</small>}
        <div className="cost-row"><span><strong>Anzahl Strecken</strong><small>{legs === 2 ? "Hin- und Rückfahrt" : outbound ? "Hinfahrt" : returnTrip ? "Rückfahrt" : "Keine Richtung"}</small></span><output>{legs}</output></div>
        <div className="cost-total"><span><strong>Gesamtkosten</strong><small>{role === "passenger" ? `${legs} × ${formatCurrency(priceCents)}` : "Keine Mitfahrkosten"}</small></span><output>{formatCurrency(totalCost)}</output></div>
        <div className="cost-footnote"><Info />Die Kosten werden in deiner Übersicht und Statistik berücksichtigt.</div>
      </aside>
    </section>
  );
}
