import * as React from "react";
import { cn } from "@/lib/utils";

export interface FitnessInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const FitnessInput = React.forwardRef<HTMLInputElement, FitnessInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-glass bg-glass/50 backdrop-blur-glass px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
FitnessInput.displayName = "FitnessInput";

export { FitnessInput };