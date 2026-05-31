import type { UrgencyAssessment } from "@csac/shared";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UrgencyBadge } from "./UrgencyBadge";

export function UrgencyPanel({ urgency }: { urgency: UrgencyAssessment }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <span className="section-label">Why this urgency</span>
        <UrgencyBadge level={urgency.level} score={urgency.score} showScore />
      </CardHeader>
      <CardContent>
        {urgency.signals.length === 0 ? (
          <p className="text-sm text-muted">No active risk signals.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {urgency.signals.map((signal) => (
              <li key={signal.code} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-ink">
                  {signal.label}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-subtle transition-colors hover:text-muted"
                        aria-label={`About: ${signal.label}`}
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{signal.detail}</TooltipContent>
                  </Tooltip>
                </span>
                <span className="tnum text-2xs font-medium text-subtle">+{signal.weight}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
