import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/shell";

/** Every dashboard page except Sign in sits in the Portfolio manager shell. */
export default function ManagerLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
