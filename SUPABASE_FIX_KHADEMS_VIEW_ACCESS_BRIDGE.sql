-- Fix: honor the app's per-account "khadems" module permission for read-only access.
-- The frontend stores menu/module permissions in public.user_access_profiles,
-- while the khadems SELECT RLS policy checks public.has_app_permission('khadems.view').
-- This bridge enables SELECT only; INSERT/UPDATE/DELETE retain their own explicit
-- database permissions and are not granted by the module visibility flag.

CREATE OR REPLACE FUNCTION public.has_app_permission(p_permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_config jsonb;
  v_user_permissions jsonb;
  v_role_permissions jsonb;
BEGIN
  IF v_uid IS NULL OR p_permission IS NULL OR length(trim(p_permission)) = 0 THEN
    RETURN false;
  END IF;

  SELECT p.role INTO v_role
  FROM public.profiles AS p
  WHERE p.id = v_uid AND p.is_active = true
  LIMIT 1;

  IF v_role = 'admin' THEN
    RETURN true;
  END IF;

  IF v_role NOT IN ('manager', 'user') OR v_role IS NULL THEN
    RETURN false;
  END IF;

  SELECT uap.permissions INTO v_user_permissions
  FROM public.user_access_profiles AS uap
  WHERE uap.user_id = v_uid AND uap.is_custom = true
  LIMIT 1;

  IF v_user_permissions IS NOT NULL
     AND jsonb_typeof(v_user_permissions) = 'object'
     AND p_permission = 'khadems.view'
     AND v_user_permissions ? 'khadems' THEN
    RETURN (v_user_permissions ->> 'khadems') = 'true';
  END IF;

  SELECT s.value INTO v_config
  FROM public.app_settings AS s
  WHERE s.setting_key = 'admin_access_assignments'
  LIMIT 1;

  IF v_config IS NULL OR jsonb_typeof(v_config) <> 'object' THEN
    RETURN false;
  END IF;

  v_user_permissions := v_config -> 'users' -> (v_uid::text);
  IF v_user_permissions IS NOT NULL AND jsonb_typeof(v_user_permissions) = 'array' THEN
    RETURN v_user_permissions ? p_permission;
  END IF;

  v_role_permissions := v_config -> 'roles' -> v_role;
  IF v_role_permissions IS NOT NULL AND jsonb_typeof(v_role_permissions) = 'array' THEN
    RETURN v_role_permissions ? p_permission;
  END IF;

  RETURN false;
END;
$function$;
