# File Upload Storage Setup

## Supabase Storage Bucket Setup

To enable file uploads in the request flow, you need to create a storage bucket in Supabase.

### 1. Create Storage Bucket

Go to your Supabase dashboard and navigate to **Storage** section.

Create a new bucket with the following settings:

- **Bucket name**: `request-files`
- **Public bucket**: `false` (private)
- **File size limit**: 10MB (optional, but recommended)
- **Allowed MIME types**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `application/pdf`

### 2. Set Storage Policies

Add the following RLS policies for the `request-files` bucket:

#### Policy 1: Allow authenticated users to upload

```sql
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'request-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 2: Allow users to read their own files

```sql
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'request-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 3: Allow users to delete their own files

```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'request-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Database Table

The `request_files` table should already exist with this schema:

```sql
CREATE TABLE request_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES profiles(id)
);
```

## Features Implemented

✅ **Multi-file upload** - Users can upload multiple files
✅ **File validation** - Only JPG, PNG, WEBP, PDF files up to 10MB
✅ **Image preview** - Shows thumbnail for uploaded images
✅ **File removal** - Users can remove files before submission
✅ **Automatic upload** - Files are uploaded after request creation
✅ **Metadata storage** - File info saved to `request_files` table

## Usage

1. Navigate to Request Quote or Request Prototype page
2. On Step 2 (Files & References), click the upload area
3. Select one or multiple files (JPG, PNG, WEBP, or PDF)
4. Preview uploaded files and remove any if needed
5. Continue with the form and submit
6. Files will be automatically uploaded to Supabase Storage

## File Structure

Files are stored in this structure:

```
request-files/
  └── {request_id}/
      └── {timestamp}-{random}.{ext}
```

This ensures:

- Files are organized by request
- No file name conflicts
- Easy cleanup when deleting requests
