import { notFound } from "next/navigation";

/** Unknown addresses: nothing to prerender, so render on request (blocking is fine) and show the 404. */
export const instant = false;

export default function Missing() {
  notFound();
}
