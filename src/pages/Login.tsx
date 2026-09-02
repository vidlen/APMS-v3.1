import { Navigate, Link } from "react-router";
import { Plane, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import ThemeToggle from "@/components/theme/theme-toggle";
import AdminLoginForm from "@/components/auth/admin-login-form";

export default function Login() {
  const { isAdmin, authReady } = useAuth();
  if (authReady && isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="relative w-full h-screen h-dvh bg-background overflow-y-auto grid md:grid-cols-2">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* System identity — subtle runway-grid motif in CSS, not a stock photo */}
      <div className="relative hidden md:flex flex-col justify-between bg-card border-r border-border overflow-hidden px-10 py-10">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, hsl(var(--foreground)) 0 1px, transparent 1px 64px), repeating-linear-gradient(0deg, hsl(var(--foreground)) 0 1px, transparent 1px 64px)",
          }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-2 bg-foreground/10"
        />

        <Link
          to="/map"
          className="relative flex items-center gap-2 w-fit p-2 -m-2 rounded-md text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowLeft size={15} />
          Back to map
        </Link>

        <div className="relative space-y-4">
          <div className="w-11 h-11 rounded-md bg-primary flex items-center justify-center">
            <Plane size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-condensed text-2xl font-semibold tracking-[.02em] uppercase text-foreground">
              Airport Pavement
              <br />
              Management System
            </h1>
            <p className="text-muted-foreground text-sm mt-2">Soekarno–Hatta International · WIII / CGK</p>
          </div>
        </div>

        <p className="relative text-[11px] text-muted-foreground/70">
          Admin access is required to edit survey data, import GeoJSON, and manage repair records.
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col items-center justify-center px-6 py-16 gap-8">
        <div className="flex md:hidden items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Plane size={17} className="text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <p className="font-condensed text-sm font-semibold uppercase tracking-[.05em] text-foreground">APMS</p>
            <p className="text-muted-foreground text-[11px]">WIII / CGK</p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-1.5">
          <h2 className="font-condensed text-xl font-semibold text-foreground">Admin sign in</h2>
          <p className="text-muted-foreground text-sm">Enter your credentials to manage pavement survey data.</p>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}
