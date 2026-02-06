import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--sbb-border-radius-2x)] px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]",
        secondary:
          "border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)]",
        destructive:
          "border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)]",
        outline: "border border-[var(--border)] text-[var(--foreground)]",
        sight:
          "border-transparent bg-sky-100 text-sky-600",
        resort:
          "border-transparent bg-orange-200 text-white",
        railaway:
          "border-transparent bg-green-100 text-green-600",
        iconic:
          "border-transparent bg-red-100 text-red-600",
        major:
          "border-transparent bg-orange-100 text-orange-600",
        notable:
          "border-transparent bg-sky-100 text-sky-600",
        hidden:
          "border-transparent bg-gray-100 text-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
