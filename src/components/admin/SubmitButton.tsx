"use client";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
export function SubmitButton({ children, className, pendingLabel = "Saving…" }: { children: ReactNode; className?: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} disabled={pending} aria-disabled={pending}>{pending ? pendingLabel : children}</button>;
}
