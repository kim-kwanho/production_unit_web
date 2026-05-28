"use client";

import { useState } from "react";
import DashboardView from "@/components/dashboard/DashboardView";
import OopLabView from "@/components/oop/OopLabView";

export default function StudioPage() {
  const [highlightUnitId, setHighlightUnitId] = useState<string | null>(null);

  return (
    <div className="flex h-full min-h-0 flex-col p-3 lg:p-4">
      {/* Studio-specific: keep UI minimal; no extra onboarding text */}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white/40 shadow-sm dark:border-slate-800 dark:bg-slate-900/30">
          <div className="h-full min-h-0 overflow-hidden">
            <OopLabView compact onConcreteSelect={setHighlightUnitId} />
          </div>
        </section>

        <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white/40 shadow-sm dark:border-slate-800 dark:bg-slate-900/30">
          <div className="h-full min-h-0 overflow-hidden">
            <DashboardView
              compact
              showOnboarding={false}
              highlightUnitId={highlightUnitId}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

