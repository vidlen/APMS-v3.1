import { useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import AppShell from "@/components/app-shell/app-shell";
import Overview from "./pages/Overview";
import PavementMap from "./pages/PavementMap";
import Sections from "./pages/Sections";
import RiskAnalysis from "./pages/RiskAnalysis";
import Admin from "./pages/Admin";
import { Toaster } from "@/components/ui/sonner";

const MIN_SPLASH_MS = 2000;

// One-time branded splash gate for the whole app (UGM / InJourney / CGK
// identity), independent of any single page's data fetch — each route now
// loads its own data, so this no longer belongs to the map page like it
// used to. Only ever shown once per app mount (i.e. once per session),
// not replayed on route changes.
function useBooted() {
  const [booted, setBooted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);
  return booted;
}

export default function App() {
  const booted = useBooted();

  if (!booted) {
    return (
      <div className="w-full h-screen h-dvh bg-background flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-7">
            <div className="flex items-center gap-8">
              <img
                src="/branding/ugm-logo.png"
                alt="Universitas Gadjah Mada"
                className="h-28 w-28 object-contain"
              />
              <img
                src="/branding/injourney-logo.webp"
                alt="InJourney Airports"
                className="h-28 w-28 object-contain"
              />
            </div>
            <img
              src="/branding/soekarno-hatta-wordmark.png"
              alt="Soekarno-Hatta International Airport, by InJourney Airports"
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Overview />} />
          <Route path="/map" element={<PavementMap />} />
          <Route path="/sections" element={<Sections />} />
          <Route path="/risk" element={<RiskAnalysis />} />
        </Route>
        {/* Admin keeps its own full-screen chrome (not nested in AppShell)
            until it's redesigned to fit the shell in a later pass. */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Toaster />
    </>
  );
}
