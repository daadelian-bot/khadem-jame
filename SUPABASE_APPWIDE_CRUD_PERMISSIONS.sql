-- App-wide independent view/create/update/delete permissions.
-- Applied to Supabase project fxxtyfurdzpzfvweoppo.
-- Manager/user access is denied unless a custom access profile is saved.
CREATE OR REPLACE FUNCTION public.has_app_permission(p_permission text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_user_permissions jsonb;
  v_module text;
  v_action text;
BEGIN
  IF v_uid IS NULL OR p_permission IS NULL OR length(trim(p_permission)) = 0 THEN RETURN false; END IF;
  SELECT p.role INTO v_role FROM public.profiles p
   WHERE p.id=v_uid AND p.is_active=true LIMIT 1;
  IF v_role='admin' THEN RETURN true; END IF;
  IF v_role NOT IN ('manager','user') OR v_role IS NULL THEN RETURN false; END IF;
  SELECT uap.permissions INTO v_user_permissions FROM public.user_access_profiles uap
   WHERE uap.user_id=v_uid AND uap.is_custom=true LIMIT 1;
  IF v_user_permissions IS NULL OR jsonb_typeof(v_user_permissions)<>'object' THEN RETURN false; END IF;
  IF p_permission ~ '^[a-zA-Z0-9_]+\.(create|update|delete|view|manage)$' THEN
    v_module:=split_part(p_permission,'.',1);
    v_action:=split_part(p_permission,'.',2);
    IF v_action IN ('view','manage') THEN RETURN (v_user_permissions->>v_module)='true'; END IF;
    IF v_user_permissions ? p_permission THEN RETURN (v_user_permissions->>p_permission)='true'; END IF;
    RETURN false;
  END IF;
  RETURN false;
END;
$function$;

-- Convert legacy module-wide write policies into operation-specific policies.
DO $do$
DECLARE p record; oldkey text; basekey text; newkey text; act text;
        qualtxt text; checktxt text; tab text; pol text;
BEGIN
  FOR p IN
    SELECT schemaname,tablename,policyname,permissive,cmd,qual,with_check
      FROM pg_policies
     WHERE schemaname='public'
       AND (coalesce(qual,'')||' '||coalesce(with_check,'')) ~ 'has_app_permission\(''[^'']+\.manage''::text\)'
  LOOP
    oldkey:=substring((coalesce(p.qual,'')||' '||coalesce(p.with_check,'')) from 'has_app_permission\(''([^'']+\.manage)''::text\)');
    IF oldkey IS NULL THEN CONTINUE; END IF;
    basekey:=CASE split_part(oldkey,'.',1)
      WHEN 'funds' THEN 'fund'
      WHEN 'documents' THEN 'documents'
      WHEN 'fields' THEN 'settings'
      WHEN 'labels' THEN 'settings'
      ELSE split_part(oldkey,'.',1)
    END;
    tab:=p.tablename; pol:=p.policyname;
    IF p.cmd='ALL' THEN
      qualtxt:=coalesce(p.qual,'true'); checktxt:=coalesce(p.with_check,'true');
      EXECUTE format('DROP POLICY %I ON %I.%I',pol,p.schemaname,tab);
      EXECUTE format('CREATE POLICY %I ON %I.%I AS %s FOR SELECT TO authenticated USING (%s)',
        left(pol||'_view',60),p.schemaname,tab,p.permissive,
        replace(qualtxt,'has_app_permission('''||oldkey||'''::text)','has_app_permission('''||basekey||'.view''::text)'));
      FOREACH act IN ARRAY ARRAY['INSERT','UPDATE','DELETE'] LOOP
        newkey:=basekey||'.'||CASE act WHEN 'INSERT' THEN 'create' WHEN 'UPDATE' THEN 'update' ELSE 'delete' END;
        IF act='INSERT' THEN
          EXECUTE format('CREATE POLICY %I ON %I.%I AS %s FOR INSERT TO authenticated WITH CHECK (%s)',
            left(pol||'_create',60),p.schemaname,tab,p.permissive,
            replace(checktxt,'has_app_permission('''||oldkey||'''::text)','has_app_permission('''||newkey||'''::text)'));
        ELSIF act='UPDATE' THEN
          EXECUTE format('CREATE POLICY %I ON %I.%I AS %s FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)',
            left(pol||'_update',60),p.schemaname,tab,p.permissive,
            replace(qualtxt,'has_app_permission('''||oldkey||'''::text)','has_app_permission('''||newkey||'''::text)'),
            replace(checktxt,'has_app_permission('''||oldkey||'''::text)','has_app_permission('''||newkey||'''::text)'));
        ELSE
          EXECUTE format('CREATE POLICY %I ON %I.%I AS %s FOR DELETE TO authenticated USING (%s)',
            left(pol||'_delete',60),p.schemaname,tab,p.permissive,
            replace(qualtxt,'has_app_permission('''||oldkey||'''::text)','has_app_permission('''||newkey||'''::text)'));
        END IF;
      END LOOP;
    ELSE
      act:=CASE p.cmd WHEN 'SELECT' THEN 'view' WHEN 'INSERT' THEN 'create' WHEN 'UPDATE' THEN 'update' WHEN 'DELETE' THEN 'delete' ELSE NULL END;
      IF act IS NULL THEN CONTINUE; END IF;
      newkey:=basekey||'.'||act; qualtxt:=p.qual; checktxt:=p.with_check;
      IF qualtxt IS NOT NULL THEN qualtxt:=replace(qualtxt,'has_app_permission('''||oldkey||'''::text)','has_app_permission('''||newkey||'''::text)'); END IF;
      IF checktxt IS NOT NULL THEN checktxt:=replace(checktxt,'has_app_permission('''||oldkey||'''::text)','has_app_permission('''||newkey||'''::text)'); END IF;
      IF p.cmd='SELECT' THEN EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s)',pol,p.schemaname,tab,qualtxt);
      ELSIF p.cmd='INSERT' THEN EXECUTE format('ALTER POLICY %I ON %I.%I WITH CHECK (%s)',pol,p.schemaname,tab,checktxt);
      ELSIF p.cmd='UPDATE' THEN EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s) WITH CHECK (%s)',pol,p.schemaname,tab,qualtxt,checktxt);
      ELSIF p.cmd='DELETE' THEN EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s)',pol,p.schemaname,tab,qualtxt);
      END IF;
    END IF;
  END LOOP;
END;
$do$;

-- The service-entry form creates service records; history screens manage them.
DO $do$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname,with_check FROM pg_policies
   WHERE schemaname='public' AND tablename='service_records' AND cmd='INSERT'
     AND coalesce(with_check,'') LIKE '%services.create%'
  LOOP
    EXECUTE format('ALTER POLICY %I ON public.service_records WITH CHECK (%s)',
      p.policyname,replace(p.with_check,'services.create','serviceRegister.create'));
  END LOOP;
END;
$do$;

-- Equipment-related records use the equipment module rather than finance.
DO $do$
DECLARE t text; p record;
BEGIN
  FOREACH t IN ARRAY ARRAY['equipment_committee_payments','equipment_committee_receipt_items',
    'equipment_committee_receipts','khadem_equipment_issues','khadem_equipment_payments'] LOOP
    FOR p IN SELECT policyname,cmd,qual,with_check FROM pg_policies
      WHERE schemaname='public' AND tablename=t LOOP
      IF coalesce(p.qual,'') LIKE '%finance.%' OR coalesce(p.with_check,'') LIKE '%finance.%' THEN
        IF p.cmd='SELECT' OR p.cmd='DELETE' THEN
          EXECUTE format('ALTER POLICY %I ON public.%I USING (%s)',p.policyname,t,replace(p.qual,'finance.','equipment.'));
        ELSIF p.cmd='INSERT' THEN
          EXECUTE format('ALTER POLICY %I ON public.%I WITH CHECK (%s)',p.policyname,t,replace(p.with_check,'finance.','equipment.'));
        ELSIF p.cmd='UPDATE' OR p.cmd='ALL' THEN
          EXECUTE format('ALTER POLICY %I ON public.%I USING (%s) WITH CHECK (%s)',p.policyname,t,replace(p.qual,'finance.','equipment.'),replace(p.with_check,'finance.','equipment.'));
        END IF;
      END IF;
    END LOOP;
  END LOOP;
END;
$do$;

-- Nonattendance records use their own module.
DO $do$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname,cmd,qual,with_check FROM pg_policies
   WHERE schemaname='public' AND tablename='khadem_service_nonattendance' LOOP
    IF coalesce(p.qual,'') LIKE '%finance.%' OR coalesce(p.with_check,'') LIKE '%finance.%' THEN
      IF p.cmd='SELECT' OR p.cmd='DELETE' THEN
        EXECUTE format('ALTER POLICY %I ON public.khadem_service_nonattendance USING (%s)',p.policyname,replace(p.qual,'finance.','nonattendance.'));
      ELSIF p.cmd='INSERT' THEN
        EXECUTE format('ALTER POLICY %I ON public.khadem_service_nonattendance WITH CHECK (%s)',p.policyname,replace(p.with_check,'finance.','nonattendance.'));
      ELSIF p.cmd='UPDATE' OR p.cmd='ALL' THEN
        EXECUTE format('ALTER POLICY %I ON public.khadem_service_nonattendance USING (%s) WITH CHECK (%s)',p.policyname,replace(p.qual,'finance.','nonattendance.'),replace(p.with_check,'finance.','nonattendance.'));
      END IF;
    END IF;
  END LOOP;
END;
$do$;

-- Shrine-site data is controlled by settings CRUD permissions.
DROP POLICY IF EXISTS shrine_sites_manage_admin_manager ON public.shrine_sites;
DROP POLICY IF EXISTS shrine_sites_permission_view ON public.shrine_sites;
DROP POLICY IF EXISTS shrine_sites_permission_create ON public.shrine_sites;
DROP POLICY IF EXISTS shrine_sites_permission_update ON public.shrine_sites;
DROP POLICY IF EXISTS shrine_sites_permission_delete ON public.shrine_sites;
CREATE POLICY shrine_sites_permission_view ON public.shrine_sites FOR SELECT TO authenticated USING (has_app_permission('settings.view'));
CREATE POLICY shrine_sites_permission_create ON public.shrine_sites FOR INSERT TO authenticated WITH CHECK (has_app_permission('settings.create'));
CREATE POLICY shrine_sites_permission_update ON public.shrine_sites FOR UPDATE TO authenticated USING (has_app_permission('settings.update')) WITH CHECK (has_app_permission('settings.update'));
CREATE POLICY shrine_sites_permission_delete ON public.shrine_sites FOR DELETE TO authenticated USING (has_app_permission('settings.delete'));

DROP POLICY IF EXISTS profiles_active_directory_read ON public.profiles;
CREATE POLICY profiles_active_directory_read ON public.profiles FOR SELECT TO authenticated
  USING (is_active=true AND (auth.uid()=id OR has_app_permission('users.view')));

DROP POLICY IF EXISTS "registration managers select" ON public.registration_requests;
CREATE POLICY "registration managers select" ON public.registration_requests FOR SELECT TO authenticated
  USING (user_id=auth.uid() OR (private.account_access_allowed()
    AND get_my_role()=ANY(ARRAY['admin'::text,'manager'::text])
    AND has_app_permission('users.view')));
