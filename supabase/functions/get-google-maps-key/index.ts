
// Supabase Edge Function: get-google-maps-key
// Returns the browser-restricted Google Maps API key to authenticated clients

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const auth = req.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  // Prefer the project-specific key for this app, fallback to the shared default
  const projectKey = Deno.env.get("GOOGLE_MAPS_API_KEY_UCONSTRUCT");
  const fallbackKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  const key = projectKey || fallbackKey;

  if (!key) {
    return new Response(
      JSON.stringify({
        error:
          "No Google Maps API key configured. Checked GOOGLE_MAPS_API_KEY_UCONSTRUCT and GOOGLE_MAPS_API_KEY.",
      }),
      { status: 500, headers: corsHeaders }
    );
  }

  return new Response(JSON.stringify({ key }), {
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
});
