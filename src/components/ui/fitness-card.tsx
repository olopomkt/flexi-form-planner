import * as React from "react";
import { cn } from "@/lib/utils";

const FitnessCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-glass bg-glass/80 backdrop-blur-glass text-card-foreground shadow-glass transition-all duration-300 hover:shadow-primary/20 hover:border-primary/30",
      className
    )}
    {...props}
  />
));
FitnessCard.displayName = "FitnessCard";

const FitnessCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
FitnessCardHeader.displayName = "FitnessCardHeader";

const FitnessCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
FitnessCardTitle.displayName = "FitnessCardTitle";

const FitnessCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FitnessCardDescription.displayName = "FitnessCardDescription";

const FitnessCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
FitnessCardContent.displayName = "FitnessCardContent";

const FitnessCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
FitnessCardFooter.displayName = "FitnessCardFooter";

export {
  FitnessCard,
  FitnessCardHeader,
  FitnessCardFooter,
  FitnessCardTitle,
  FitnessCardDescription,
  FitnessCardContent,
};