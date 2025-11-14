import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, secret } = await req.json();

    // Simple secret check - you should set a strong secret
    const INIT_SECRET = Deno.env.get("INIT_SECRET") || "CHANGE_ME_IN_PRODUCTION";
    
    if (secret !== INIT_SECRET) {
      console.error("Invalid secret provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid secret" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Initializing super admin for: ${email}`);

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find user by email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, email")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      console.error("User not found:", profileError);
      return new Response(
        JSON.stringify({ error: `User with email ${email} not found` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found user: ${profile.user_id}`);

    // Update user role to super_admin
    const { error: updateError } = await supabaseAdmin
      .from("user_roles")
      .update({ role: "super_admin" })
      .eq("user_id", profile.user_id);

    if (updateError) {
      console.error("Error updating role:", updateError);
      return new Response(
        JSON.stringify({ error: `Failed to update role: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the initialization
    const { error: logError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: profile.user_id,
        action: "role_changed",
        entity_type: "system",
        entity_id: profile.user_id,
        details: {
          action: "super_admin_initialized",
          email: email,
          timestamp: new Date().toISOString(),
        },
      });

    if (logError) {
      console.error("Error logging initialization:", logError);
    }

    console.log(`Successfully initialized super admin for ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${email} is now a super admin. Please log out and log back in.`,
        userId: profile.user_id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in initialize-super-admin function:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
