
import React from "react";
import { Input } from "@/components/ui/input";

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        type="tel"
        placeholder="+1 (555) 123-4567"
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";
