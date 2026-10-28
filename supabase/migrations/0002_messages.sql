-- Portfolio backend, step 4: contact messages land in the Inbox.
--   • sender_hash: a keyed hash of the sender's IP address, used only to rate-limit the contact form.
--     The raw address is never stored, and the hash can't be reversed without the server's secret.
--   • Messages stay server-written only (no insert policy) — see 0001_init.sql.

alter table public.messages
  add column sender_hash text check (sender_hash is null or char_length(sender_hash) = 64);

create index messages_sender_recent on public.messages (sender_hash, created_at desc);
create index messages_recent on public.messages (created_at desc);
