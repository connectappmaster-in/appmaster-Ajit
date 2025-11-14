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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("Authentication error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Request from user:", user.id);

    // Check if user is super admin
    const { data: userRole, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole || userRole.role !== "super_admin") {
      console.error("Authorization error: User is not super admin", roleError);
      return new Response(
        JSON.stringify({ error: "Forbidden: Only super admins can manage user roles" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { targetUserId, newRole } = await req.json();

    if (!targetUserId || !newRole) {
      return new Response(
        JSON.stringify({ error: "Missing targetUserId or newRole" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate role
    const validRoles = ["user", "admin", "super_admin"];
    if (!validRoles.includes(newRole)) {
      return new Response(
        JSON.stringify({ error: "Invalid role. Must be one of: user, admin, super_admin" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Changing role for user ${targetUserId} to ${newRole}`);

    // Update user role using service role for bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: updateError } = await supabaseAdmin
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", targetUserId);

    if (updateError) {
      console.error("Error updating role:", updateError);
      return new Response(
        JSON.stringify({ error: `Failed to update role: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the action in audit logs
    const { error: logError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: user.id,
        action: "role_changed",
        entity_type: "user",
        entity_id: targetUserId,
        details: {
          old_role: userRole.role,
          new_role: newRole,
          changed_by: user.email,
        },
      });

    if (logError) {
      console.error("Error logging action:", logError);
    }

    console.log(`Successfully updated role for user ${targetUserId} to ${newRole}`);

    return new Response(
      JSON.stringify({ success: true, message: "Role updated successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in manage-user-role function:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
