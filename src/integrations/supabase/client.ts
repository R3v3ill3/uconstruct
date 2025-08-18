import { createClient } from "@supabase/supabase-js";

export const supabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

  // During server-side rendering at build time, Railway may not inject env vars.
  // Avoid throwing to let static prerender complete; a dummy client is fine
  // because no Supabase calls are executed until after hydration.
  if (!url || !anonKey) {
    if (typeof window === "undefined") {
      return createClient("https://example.invalid", "public-anon-key");
    }
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(url, anonKey);
};