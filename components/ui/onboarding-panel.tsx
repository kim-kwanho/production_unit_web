"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OnboardingPanelProps {
  storageKey: string;
  title: string;
  subtitle?: string;
  steps: string[];
  details?: string[];
}

export default function OnboardingPanel({
  storageKey,
  title,
  subtitle,
  steps,
  details,
}: OnboardingPanelProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(storageKey) !== "1") {
      setVisible(true);
    }
  }, [storageKey]);

  const dismiss = () => {
    localStorage.setItem(storageKey, "1");
    setVisible(false);
  };

  const hasDetails = useMemo(() => Boolean(details && details.length > 0), [
    details,
  ]);

  if (!visible) return null;

  return (
    <Card className="border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
              {title}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs text-emerald-900/70 dark:text-emerald-200/80">
                {subtitle}
              </p>
            )}
          </div>
          <Button onClick={dismiss} variant="ghost" size="sm" className="h-8">
            닫기
          </Button>
        </div>

        <ol className="mt-3 list-inside list-decimal space-y-1 text-xs text-slate-800 dark:text-slate-100">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        {hasDetails && (
          <ul className="mt-3 space-y-1 text-xs text-slate-700 dark:text-slate-200">
            {details!.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/80" />
                <span className="min-w-0">{d}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

