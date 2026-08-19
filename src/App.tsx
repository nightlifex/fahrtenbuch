import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, X } from "lucide-react";
import { Layout, type ViewId } from "./components/Layout";
import { Overview } from "./components/Overview";
import { CostsPage, PlaceholderPage, StatisticsPage, TripsPage } from "./components/SecondaryViews";
import { SettingsPanel } from "./components/SettingsPanel";
import { useFahrtenbuch } from "./hooks/useFahrtenbuch";

export function App() {
  const data = useFahrtenbuch();
  const [view, setView] = useState<ViewId>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string>();

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(undefined), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (data.loading) return <div className="loading-screen"><span className="brand-mark"><LoaderCircle className="spin" /></span><strong>Fahrtenbuch wird geladen …</strong><small>Deine lokalen Daten werden vorbereitet.</small></div>;

  let content: React.ReactNode;
  if (view === "overview") content = <Overview trips={data.trips} stats={data.stats} settings={data.settings} onSave={data.saveTrip} onDelete={data.deleteTrip} onLoadSamples={data.loadSamples} onToast={setToast} />;
  else if (view === "trips") content = <TripsPage trips={data.trips} settings={data.settings} onSave={data.saveTrip} onDelete={data.deleteTrip} onToast={setToast} />;
  else if (view === "statistics") content = <StatisticsPage stats={data.stats} />;
  else if (view === "costs") content = <CostsPage trips={data.trips} />;
  else if (view === "settings") content = <SettingsPanel settings={data.settings} trips={data.trips} onUpdateSettings={data.updateSettings} onImportReplace={data.importReplace} onImportMerge={data.importMerge} onDeleteAll={data.deleteAllData} onToast={setToast} />;
  else content = <PlaceholderPage type={view === "calendar" ? "calendar" : view === "routes" ? "routes" : "reports"} />;

  return (
    <Layout activeView={view} onNavigate={setView} userName={data.settings.userName} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}>
      {data.error && <div className="global-error">{data.error}</div>}
      {content}
      {toast && <div className="toast" role="status"><CheckCircle2 />{toast}<button onClick={() => setToast(undefined)} aria-label="Meldung schließen"><X /></button></div>}
    </Layout>
  );
}
