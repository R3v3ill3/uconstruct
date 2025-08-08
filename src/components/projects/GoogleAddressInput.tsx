import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_SCRIPT_ID = "google-maps-script";

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve();
      return;
    }
    if (document.getElementById(GOOGLE_SCRIPT_ID)) {
      const check = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        if (!(window.google && window.google.maps && window.google.maps.places)) {
          reject(new Error("Google Maps failed to load"));
        }
      }, 10000);
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

export type GoogleAddress = {
  formatted: string;
  components?: Record<string, string>;
  place_id?: string;
  lat?: number;
  lng?: number;
};

export function GoogleAddressInput({
  value,
  onChange,
  placeholder = "Start typing an address...",
}: {
  value?: string;
  onChange: (addr: GoogleAddress) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>(value || "");
  const lastFromAutocomplete = useRef(false);

  useEffect(() => {
    setText(value || "");
  }, [value]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-google-maps-key");
        if (error) throw error;
        const key = (data as any)?.key as string | undefined;
        if (!key) {
          setError("Autocomplete unavailable");
          return;
        }
        await loadGoogleMaps(key);
        if (!cancelled) setLoaded(true);
      } catch (e) {
        console.error(e);
        setError("Autocomplete unavailable");
        toast.error("Google Maps failed to load. Autocomplete disabled.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded || !inputRef.current || !window.google) return;
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
      fields: ["formatted_address", "address_components", "geometry", "place_id"],
    });
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const formatted = place.formatted_address || inputRef.current?.value || "";
      const components: Record<string, string> = {};
      (place.address_components || []).forEach((c: any) => {
        components[c.types[0]] = c.long_name;
      });
      const lat = place.geometry?.location?.lat?.();
      const lng = place.geometry?.location?.lng?.();
      lastFromAutocomplete.current = true;
      setText(formatted);
      onChange({ formatted, components, place_id: place.place_id, lat, lng });
    });
    return () => {
      if (listener && listener.remove) listener.remove();
    };
  }, [loaded, onChange]);

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>Address</Label>
        <Input
          ref={inputRef}
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              lastFromAutocomplete.current = false;
              if (text?.trim()) {
                onChange({ formatted: text.trim() });
              }
            }
          }}
          onBlur={() => {
            // commit manual entry on blur (avoid double-fire after autocomplete)
            if (lastFromAutocomplete.current) {
              lastFromAutocomplete.current = false;
              return;
            }
            if (text?.trim()) {
              onChange({ formatted: text.trim() });
            }
          }}
        />
        <div className="text-xs text-muted-foreground">
          {loaded ? <span>Autocomplete enabled.</span> : <span>{error || "Autocomplete unavailable; manual entry works."}</span>}
        </div>
      </div>
    </div>
  );
}
