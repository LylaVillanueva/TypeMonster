import { createClient } from "@supabase/supabase-js";

function cleanEnv(value) {
  return value?.trim().replace(/^(['"])(.*)\1$/, "$2") || "";
}

const projectUrl = cleanEnv(import.meta.env.VITE_SUPABASE_URL).replace(/\/+$/, "");
const publishableKey = cleanEnv(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
);
function isPrivateKey(key) {
  if (key.startsWith("sb_secret_")) return true;
  const payload = key.split(".")[1];
  if (!payload) return false;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    return JSON.parse(decoded).role === "service_role";
  } catch {
    return false;
  }
}

const privateKeyWasProvided = Boolean(publishableKey && isPrivateKey(publishableKey));
export const supabaseConfigError = privateKeyWasProvided
  ? "The Supabase service-role/secret key must never be used in the browser. Replace it in Vercel with this project's publishable key or anon key, then redeploy."
  : !projectUrl || !publishableKey
    ? "Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel, then redeploy."
    : "";

export const supabase =
  projectUrl && publishableKey && !privateKeyWasProvided
    ? createClient(projectUrl, publishableKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true,
        },
      })
    : null;

if (!supabase && supabaseConfigError) console.warn(supabaseConfigError);
