import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const fitnessButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gradient-primary text-primary-foreground hover:shadow-primary hover:scale-105 transform transition-all duration-300 font-bold tracking-wide",
        accent: "bg-gradient-accent text-accent-foreground hover:shadow-accent hover:scale-105 transform transition-all duration-300 font-bold tracking-wide",
        glass: "bg-glass border border-glass text-foreground backdrop-blur-glass hover:bg-opacity-90 hover:border-primary/30 transition-all duration-300",
        outline: "border border-primary/30 bg-transparent text-foreground hover:bg-primary/10 hover:border-primary transition-all duration-300",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-md px-8 text-base font-bold",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface FitnessButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fitnessButtonVariants> {
  asChild?: boolean;
}

const FitnessButton = React.forwardRef<HTMLButtonElement, FitnessButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(fitnessButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
FitnessButton.displayName = "FitnessButton";

export { FitnessButton, fitnessButtonVariants };