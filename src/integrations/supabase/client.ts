import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

declare global {
  // eslint-disable-next-line no-var
  var __supabase_browser_client__: SupabaseClient | undefined;
}

export const supabaseBrowser = (): SupabaseClient => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

  // During server-side rendering at build time, Railway may not inject env vars.
  // Avoid throwing to let static prerender complete; a dummy client is fine
  // because no Supabase calls are executed until after hydration.
  if (typeof window === "undefined") {
    if (!url || !anonKey) {
      return createClient("https://example.invalid", "public-anon-key");
    }
    return createClient(url, anonKey);
  }

  if (!globalThis.__supabase_browser_client__) {
    if (!url || !anonKey) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    globalThis.__supabase_browser_client__ = createClient(url, anonKey);
  }

  return globalThis.__supabase_browser_client__ as SupabaseClient;
};