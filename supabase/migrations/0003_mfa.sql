-- Portfolio backend, step 4: second sign-in step (authenticator app code).
-- Once the owner has set one up, the owner's rights (drafts, edits, uploads, messages) need a session that passed
-- it ("aal2"). A password-only session counts as nobody, even if it reached the database directly.
-- Before anything is set up, the password alone still works (otherwise you couldn't set it up).

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.app_config c where c.owner_id = auth.uid())
    and (
      coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      or not exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified')
    );
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;
