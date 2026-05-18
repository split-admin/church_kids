
/*
  # Storage Policies for children-photos bucket

  Allows users to upload and read photos for the children's check-in system.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read children photos'
  ) THEN
    CREATE POLICY "Public read children photos"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'children-photos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated upload children photos'
  ) THEN
    CREATE POLICY "Authenticated upload children photos"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'children-photos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anon upload children photos'
  ) THEN
    CREATE POLICY "Anon upload children photos"
      ON storage.objects FOR INSERT
      TO anon
      WITH CHECK (bucket_id = 'children-photos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated update children photos'
  ) THEN
    CREATE POLICY "Authenticated update children photos"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'children-photos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated delete children photos'
  ) THEN
    CREATE POLICY "Authenticated delete children photos"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'children-photos');
  END IF;
END $$;
