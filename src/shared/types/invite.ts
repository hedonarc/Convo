import type { User } from "./user";

/**
 * Public resolution of an invite token — returned by GET /api/invites/<token>/.
 * Drives the Accept Invite screen before the user is authenticated.
 *
 * `email` is the canonical address the invite was issued to (never derived
 * from the URL). `has_account` tells the frontend whether to route the user
 * to login vs register after they click Accept.
 */
export interface InviteResolveResponse {
  email: string;
  inviter: User;
  conversation_id: number;
  is_accepted: boolean;
  has_account: boolean;
}
