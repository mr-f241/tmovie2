-- Create storage bucket for comment images
INSERT INTO storage.buckets (id, name, public)
VALUES ('comment-images', 'comment-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload comment images
CREATE POLICY "Users can upload comment images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comment-images');

-- Allow public to view comment images
CREATE POLICY "Public can view comment images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'comment-images');

-- Allow users to delete their own comment images
CREATE POLICY "Users can delete own comment images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'comment-images' AND auth.uid()::text = (storage.foldername(name))[1]);