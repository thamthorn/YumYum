import { cn } from "@/lib/utils";

export interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStepId: string;
  className?: string;
}

export function ProgressIndicator({
  steps,
  currentStepId,
  className,
}: ProgressIndicatorProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStepId;
          const isPast = step.completed || index < currentIndex;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              {/* Step Circle */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    isPast && "border-primary bg-primary text-white",
                    isActive &&
                      "border-primary bg-white text-primary ring-4 ring-primary/20",
                    !isPast &&
                      !isActive &&
                      "border-gray-300 bg-white text-gray-400"
                  )}
                >
                  {isPast ? (
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                        />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={cn(
                    "absolute top-12 whitespace-nowrap text-sm font-medium",
                    isActive ? "text-primary" : "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 px-2">
                  <div
                    className={cn(
                      "h-0.5 transition-all",
                      isPast ? "bg-primary" : "bg-gray-300"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  className?: string;
}

export function WizardProgress({
  currentStep,
  totalSteps,
  stepLabels,
  className,
}: WizardProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Labels */}
      {stepLabels && (
        <div
          className="mt-4 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }}
        >
          {stepLabels.map((label, index) => (
            <div
              key={index}
              className={cn(
                "text-center text-xs",
                index + 1 === currentStep && "font-semibold text-primary",
                index + 1 < currentStep && "text-gray-500",
                index + 1 > currentStep && "text-gray-400"
              )}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CompletenessIndicatorProps {
  percentage: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function CompletenessIndicator({
  percentage,
  label = "Profile Completeness",
  size = "md",
  showLabel = true,
  className,
}: CompletenessIndicatorProps) {
  const circleSize = size === "sm" ? 60 : size === "md" ? 80 : 120;
  const strokeWidth = size === "sm" ? 6 : size === "md" ? 8 : 10;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (pct: number) => {
    if (pct >= 80) return "#f59e0b"; // amber-500 (primary-ish)
    if (pct >= 50) return "#fcd34d"; // amber-300
    return "#ef4444"; // red
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        <svg width={circleSize} height={circleSize}>
          {/* Background circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke={getColor(percentage)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "font-bold",
              size === "sm" && "text-lg",
              size === "md" && "text-2xl",
              size === "lg" && "text-4xl"
            )}
            style={{ color: getColor(percentage) }}
          >
            {percentage}%
          </span>
        </div>
      </div>
      {showLabel && (
        <p
          className={cn(
            "text-center font-medium text-gray-700",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base"
          )}
        >
          {label}
        </p>
      )}
    </div>
  );
}
