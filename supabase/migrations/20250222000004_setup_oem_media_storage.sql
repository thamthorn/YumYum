-- Create storage bucket for OEM media
insert into storage.buckets (id, name, public)
values ('oem-media', 'oem-media', true)
on conflict (id) do nothing;

-- Set up RLS policies for oem-media bucket
create policy "Public can view oem media"
on storage.objects for select
using ( bucket_id = 'oem-media' );

create policy "Authenticated users can upload oem media"
on storage.objects for insert
with check (
  bucket_id = 'oem-media'
  and auth.role() = 'authenticated'
);

create policy "Users can update their own oem media"
on storage.objects for update
using (
  bucket_id = 'oem-media'
  and auth.uid() = owner
);

create policy "Users can delete their own oem media"
on storage.objects for delete
using (
  bucket_id = 'oem-media'
  and auth.uid() = owner
);
