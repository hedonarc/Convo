import { useReducer } from "react";

import { useCountdown } from "./useCountdown";

/**
 * Status of an in-flight or just-resolved transaction in the user-search
 * panel. One discriminated union covers both "start direct conversation" and
 * "send email invite" flows — variants are mutually exclusive, so e.g.
 * `inviting + error` or `reminder_sent + creating` can't represent.
 */
type Status =
  | { kind: "idle" }
  | { kind: "starting_conversation"; userId: number }
  | { kind: "inviting" }
  | { kind: "reminder_sent" }
  | { kind: "error"; message: string; cooldownUntilMs: number | null };

type StatusAction =
  | { type: "reset" }
  | { type: "start_conversation"; userId: number }
  | { type: "start_invite" }
  | { type: "resolve_reminder_sent" }
  | { type: "resolve_error"; message: string; cooldownUntilMs?: number };

function statusReducer(_state: Status, action: StatusAction): Status {
  switch (action.type) {
    case "reset":
      return { kind: "idle" };
    case "start_conversation":
      return { kind: "starting_conversation", userId: action.userId };
    case "start_invite":
      return { kind: "inviting" };
    case "resolve_reminder_sent":
      return { kind: "reminder_sent" };
    case "resolve_error":
      return {
        kind: "error",
        message: action.message,
        cooldownUntilMs: action.cooldownUntilMs ?? null,
      };
  }
}

export interface UseUserSearchPanelStatusResult {
  /** Id of the user whose direct-conversation request is in flight, else null. */
  creatingId: number | null;
  isInviting: boolean;
  inviteSent: boolean;
  createError: string | null;
  /** Formatted countdown string while a 429 cooldown is active, else null. */
  remainingTime: string | null;

  reset: () => void;
  startConversation: (userId: number) => void;
  startInvite: () => void;
  resolveReminderSent: () => void;
  resolveError: (message: string, cooldownUntilMs?: number) => void;
}

export function useUserSearchPanelStatus(): UseUserSearchPanelStatusResult {
  const [status, dispatch] = useReducer(statusReducer, { kind: "idle" });

  const cooldownUntilMs =
    status.kind === "error" ? status.cooldownUntilMs : null;
  const remainingTime = useCountdown(cooldownUntilMs, 1000);

  return {
    creatingId:
      status.kind === "starting_conversation" ? status.userId : null,
    isInviting: status.kind === "inviting",
    inviteSent: status.kind === "reminder_sent",
    createError: status.kind === "error" ? status.message : null,
    remainingTime,

    reset: () => dispatch({ type: "reset" }),
    startConversation: (userId) =>
      dispatch({ type: "start_conversation", userId }),
    startInvite: () => dispatch({ type: "start_invite" }),
    resolveReminderSent: () => dispatch({ type: "resolve_reminder_sent" }),
    resolveError: (message, cooldownUntilMs) =>
      dispatch({ type: "resolve_error", message, cooldownUntilMs }),
  };
}
