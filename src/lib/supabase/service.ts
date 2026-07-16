import { createClient as createSb } from "@supabase/supabase-js";

// Service-role client. Server-only. Bypasses RLS — never import in a
// client component. Use for trusted background jobs (ingest, embeddings).
export function createServiceClient() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
