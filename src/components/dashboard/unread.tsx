"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Unread messages, shared with the navigation (the red dot on Inbox). The count is read on the server with the rest of
 * the owner's data and handed over by <UnreadSync>; reading, archiving or deleting a message refreshes it.
 */
let unread = 0;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn));

export function UnreadSync({ count }: { count: number }) {
  useEffect(() => {
    unread = count;
    listeners.forEach((fn) => fn());
  }, [count]);
  return null;
}

export const useUnread = () => useSyncExternalStore(subscribe, () => unread, () => 0);
