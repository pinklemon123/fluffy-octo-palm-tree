// Storage configuration for file uploads

import supabase from './supabase';

// Buckets: avatars, uploads
// Ensure these buckets are created in Supabase dashboard

export const uploadToStorage = async (bucket, filePath, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  return data;
};

export const getPublicUrl = (bucket, filePath) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};