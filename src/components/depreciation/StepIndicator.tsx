import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={cn(
              "relative",
              stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20 flex-1" : ""
            )}
          >
            {step.id < currentStep ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Check className="h-5 w-5 text-primary-foreground" />
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            ) : step.id === currentStep ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-border" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-border" />
                </div>
                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background">
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            )}
            <div className="mt-2">
              <p className="text-xs font-semibold">{step.name}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};
