-- Create the request-files storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('request-files', 'request-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Set up storage policies for request-files bucket
-- Allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'request-files');

-- Allow authenticated users to read files
CREATE POLICY IF NOT EXISTS "Authenticated users can read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'request-files');

-- Allow users to delete their own files
CREATE POLICY IF NOT EXISTS "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'request-files' AND owner = auth.uid());

-- Allow public read access (since bucket is public)
CREATE POLICY IF NOT EXISTS "Public can read files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'request-files');
