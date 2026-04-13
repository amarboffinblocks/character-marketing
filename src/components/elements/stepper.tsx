import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface StepperProps {
  steps: Step[];
  className?: string;
  itemClassName?: string;
}

export function Stepper({ steps, className, itemClassName }: StepperProps) {
  return (
    <div className={cn("grid gap-12 sm:gap-16 lg:grid-cols-3 lg:gap-8", className)}>
      {steps.map((step, index) => (
        <div key={step.number} className="group relative">
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <>
              {/* Desktop Horizontal Line */}
              <div className="absolute left-[64%] top-12 hidden h-[2px] w-[calc(100%-20%)] bg-gradient-to-r from-primary/40 via-primary/10 to-transparent lg:block" />
              {/* Mobile Vertical Line */}
              <div className="absolute left-1/2 top-24 mx-auto h-12 w-[2px] -translate-x-1/2 bg-gradient-to-b from-primary/40 via-primary/10 to-transparent lg:hidden" />
            </>
          )}

          <div
            className={cn(
              "relative flex flex-col items-center text-center transition-transform duration-300 group-hover:-translate-y-1",
              itemClassName
            )}
          >
            {/* Icon Circle */}
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/5 text-primary shadow-[inset_0_0_20px_rgba(85,46,251,0.05)] border border-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_10px_30px_-10px_rgba(85,46,251,0.5)]">
              <step.icon className="h-10 w-10 transition-transform duration-500 group-hover:scale-110" />
            </div>

            {/* Step Number */}
            <div className="mt-6 inline-flex items-center justify-center rounded-full bg-muted/50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/50">
              Step {step.number}
            </div>

            {/* Title */}
            <h3 className="mt-4 text-xl font-black uppercase tracking-tight">
              {step.title}
            </h3>

            {/* Description */}
            <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-muted-foreground opacity-80 group-hover:opacity-100 transition-opacity">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
