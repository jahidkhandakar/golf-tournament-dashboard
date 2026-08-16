import { ArrowLeft, Home, RefreshCw, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 py-12">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white bg-white/90 p-8 text-center shadow-[0_24px_80px_-24px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <ShieldAlert className="h-10 w-10" strokeWidth={1.8} />
        </div>

        <p className="mt-7 text-sm font-bold uppercase tracking-[0.22em] text-primary">
          GolfImprove
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Something Went Wrong!
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">
          We couldn&apos;t open the page you requested. Please try again or use
          one of the helpful links below.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <button
            onClick={() => navigate("/")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <Home className="h-4 w-4" />
            Take Me Home
          </button>

            <button
              onClick={() => navigate(-1)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
            <ArrowLeft className="h-4 w-4" />
            Go Back
            </button>

        </div>

        <div className="mt-9 border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400">
            If the problem continues, please contact the GolfImprove support
            team.
          </p>
        </div>
      </div>
    </section>
  );
}
