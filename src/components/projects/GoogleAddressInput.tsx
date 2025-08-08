import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem("google_maps_api_key"));
  const [loaded, setLoaded] = useState(false);
  const [editingKey, setEditingKey] = useState(!apiKey);

  useEffect(() => {
    if (!apiKey) return;
    loadGoogleMaps(apiKey)
      .then(() => setLoaded(true))
      .catch((e) => {
        console.error(e);
        toast.error("Google Maps failed to load. Check API key.");
      });
  }, [apiKey]);

  useEffect(() => {
    if (!loaded || !inputRef.current || !window.google) return;
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
      fields: ["formatted_address", "address_components"],
    });
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const formatted = place.formatted_address || inputRef.current?.value || "";
      const components: Record<string, string> = {};
      (place.address_components || []).forEach((c: any) => {
        components[c.types[0]] = c.long_name;
      });
      onChange({ formatted, components });
    });
    return () => {
      if (listener && listener.remove) listener.remove();
    };
  }, [loaded, onChange]);

  const saveKey = () => {
    const input = (document.getElementById("gmaps-key-input") as HTMLInputElement) || null;
    const keyVal = input?.value?.trim();
    if (!keyVal) {
      toast.error("Please enter a Google Maps browser API key");
      return;
    }
    localStorage.setItem("google_maps_api_key", keyVal);
    setApiKey(keyVal);
    setEditingKey(false);
    toast.success("API key saved");
  };

  return (
    <div className="space-y-2">
      {!apiKey || editingKey ? (
        <div className="rounded-md border p-3 space-y-2">
          <div className="space-y-1">
            <Label htmlFor="gmaps-key-input">Google Maps API Key</Label>
            <Input id="gmaps-key-input" defaultValue={apiKey || ""} placeholder="Enter browser API key" />
          </div>
          <div className="flex gap-2">
            <Button onClick={saveKey}>Save</Button>
            {apiKey && (
              <Button variant="outline" onClick={() => setEditingKey(false)}>Cancel</Button>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-1">
        <Label>Address</Label>
        <Input
          ref={inputRef}
          defaultValue={value}
          placeholder={placeholder}
          onBlur={(e) => {
            // allow manual entry fallback
            if (e.currentTarget.value && !loaded) {
              onChange({ formatted: e.currentTarget.value });
            }
          }}
        />
        <div className="text-xs text-muted-foreground">
          {loaded ? (
            <button className="underline" type="button" onClick={() => setEditingKey(true)}>Change API key</button>
          ) : (
            <span>Autocomplete loads after saving API key. Manual entry works too.</span>
          )}
        </div>
      </div>
    </div>
  );
}
