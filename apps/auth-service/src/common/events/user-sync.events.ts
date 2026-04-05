// ──── Queue Configuration ────
export const USER_SYNC_QUEUE = 'user-sync';

// ──── Job Names ────
export enum UserSyncJobName {
  USER_CREATED = 'user.created',
  // USER_UPDATED = 'user.updated',     ← Phase 2
  // USER_DELETED = 'user.deleted',     ← Phase 2
}

// ──── Payloads ────
export interface UserCreatedPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  timestamp: string; // ISO 8601
}
