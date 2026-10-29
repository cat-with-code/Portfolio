-- Portfolio backend: sessions can't last forever.
-- Supabase's own session limits are a paid feature, so the owner's rights also require a sign-in from the last 24 hours
-- (measured from the token's authentication time, which carries over when the token is refreshed). The site itself
-- signs you out sooner (30 min without activity, 12 h at most — src/lib/supabase/session-policy.ts); this is the
-- database's own backstop, e.g. against a copied sign-in token used directly against Supabase.
-- Keeps the second-step rule from 0003_mfa.sql.

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.app_config c where c.owner_id = auth.uid())
    and (
      coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      or not exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified')
    )
    and coalesce(
      (select min((a ->> 'timestamp')::bigint) from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb)) a),
      0
    ) > extract(epoch from now()) - 24 * 60 * 60;
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;
