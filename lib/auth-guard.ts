import { redirect } from "next/navigation";

/**
 * Server-side role guard for route groups.
 *
 * NOTE: Auth login UI + userProfiles creation land in a later phase. Until
 * then this guard is a no-op pass-through so the student shell renders during
 * development. Once Convex Auth sessions exist, replace the body with a real
 * check (e.g. fetch /api/auth + userProfiles.role === "student" → else redirect).
 */
export async function requireStudent(): Promise<void> {
  // TODO(auth): enforce student role once sessions are wired.
  return;
}

export async function requireParent(): Promise<void> {
  // TODO(auth): enforce parent role once sessions are wired.
  return;
}

/** Convenience: guard + redirect helper used in RSC layouts/pages. */
export async function guardStudent(): Promise<void> {
  await requireStudent();
  // intentionally no redirect for now
  void redirect;
}
