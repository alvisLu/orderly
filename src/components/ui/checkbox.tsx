"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

const checkboxVariants = cva(
  "peer group/checkbox relative flex shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:aria-checked:border-primary dark:bg-input/30",
  {
    variants: {
      variant: {
        default:
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        destructive:
          "border-destructive/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-destructive data-checked:bg-destructive data-checked:text-destructive-foreground dark:data-checked:bg-destructive",
        success:
          "data-checked:border-success data-checked:bg-success data-checked:text-success-foreground dark:data-checked:bg-success",
        outline:
          "data-checked:border-muted data-checked:bg-background data-checked:text-muted-foreground",
      },
      size: {
        sm: "size-3.5 rounded-[3px]",
        default: "size-4",
        lg: "size-6 rounded-[6px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Checkbox({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-variant={variant}
      data-size={size}
      className={cn(checkboxVariants({ variant, size, className }))}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none group-data-[size=sm]/checkbox:[&>svg]:size-2.5 group-data-[size=default]/checkbox:[&>svg]:size-3.5 group-data-[size=lg]/checkbox:[&>svg]:size-4"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, checkboxVariants };
