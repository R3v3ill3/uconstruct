import { createClient } from "@supabase/supabase-js";

export function getBrowserSupabase() {
  // Fallback to dev keys to avoid build-time crashes when env is absent.
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || "https://jzuoawqxqmrsftbtjkzv.supabase.co";
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6dW9hd3F4cW1yc2Z0YnRqa3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjYwMDcsImV4cCI6MjA2OTk0MjAwN30.iOvn3b02CX_Dch4bWlJbzY6EYLbWrmwpM7sQgAqimd8";
  return createClient(url, anonKey);
}

