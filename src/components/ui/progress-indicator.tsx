"use client";
import { cn } from "@/lib/utils";
import { AlertTriangle, FileCheck, Utensils } from "lucide-react";
import { animate } from "motion/react";
import React, { useEffect, useState } from "react";

interface ProgressIndicatorProps {
  currentStep: number; // 1, 2, or 3
  className?: string;
}

const steps = [
  { num: 1, label: "Select Allergies", icon: AlertTriangle },
  { num: 2, label: "Choose Dish", icon: Utensils },
  { num: 3, label: "Review Results", icon: FileCheck },
];

export function ProgressIndicator({ currentStep, className }: ProgressIndicatorProps) {
  const [animatedStep, setAnimatedStep] = useState(currentStep);

  useEffect(() => {
    // Animate to the current step when it changes
    if (currentStep !== animatedStep) {
      const scale = [1, 1.15, 1];
      const transform = ["translateY(0px)", "translateY(-6px)", "translateY(0px)"];
      
      // Animate the current step with a bounce effect
      animate(
        `.step-${currentStep}`,
        {
          scale,
          transform,
        },
        { duration: 0.8, ease: "easeOut" }
      );
      
      setAnimatedStep(currentStep);
    }
  }, [currentStep, animatedStep]);

  return (
    <div className={cn("w-full py-6 border-t border-b border-slate-800/50", className)}>
      <div className="flex items-center justify-center gap-4 md:gap-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;

          return (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    `step-${step.num} h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 relative`,
                    isActive
                      ? "bg-slate-900 text-white shadow-lg shadow-blue-500/20 border border-slate-600"
                      : isCompleted
                      ? "bg-slate-700 text-white border border-slate-600"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  )}
                >
                  {/* Show icon when active or completed, number otherwise */}
                  {isActive || isCompleted ? (
                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-300")} />
                  ) : (
                    <span className="text-sm font-semibold">{step.num}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs md:text-sm font-medium transition-colors duration-300",
                    isActive
                      ? "text-white font-semibold"
                      : isCompleted
                      ? "text-slate-400"
                      : "text-slate-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 md:w-16 h-0.5 transition-colors duration-300",
                    isCompleted
                      ? "bg-slate-600"
                      : step.num === currentStep - 1
                      ? "bg-slate-600"
                      : "bg-slate-700"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

