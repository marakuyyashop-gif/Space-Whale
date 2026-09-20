(() => {
  const SUPABASE_URL = "https://xpeywyonbapnvtjnwawi.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_GAp0g1oQSikZ1GA6Z3NxfQ_WpZtdeVy";

  if (!window.supabase?.createClient) {
    console.warn("[Space Whale] Supabase client library is not loaded.");
    return;
  }

  window.spaceWhaleSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
})();
