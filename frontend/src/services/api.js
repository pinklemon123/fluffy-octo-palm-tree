// API functions for user registration, login, file upload, etc.

import supabase from './supabase';

// User registration
export async function registerUser(username, password) {
  const { user, error } = await supabase.auth.signUp({
    email: `${username}@example.com`, // Temporary email generation (no verification needed)
    password: password,
  });

  if (error) {
    console.error(error);
    return { success: false, error };
  } else {
    // Insert additional user info
    const { data, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username: username,
          password: password, // Note: Should hash password in production
        }
      ]);
    
    if (insertError) {
      console.error(insertError);
      return { success: false, error: insertError };
    } else {
      console.log('User registered successfully');
      return { success: true, user };
    }
  }
}

// User login
export async function loginUser(username, password) {
  const { user, error } = await supabase.auth.signInWithPassword({
    email: `${username}@example.com`,
    password: password,
  });

  if (error) {
    console.error(error);
    return { success: false, error };
  } else {
    return { success: true, user };
  }
}

// Upload avatar
export async function uploadAvatar(file, userId) {
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`avatars/${file.name}`, file);

  if (error) {
    console.error(error);
    return { success: false, error };
  }

  const url = supabase.storage.from('avatars').getPublicUrl(`avatars/${file.name}`).data.publicUrl;

  // Update user avatar URL
  const { data: updateData, error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: url })
    .eq('id', userId);

  if (updateError) {
    console.error(updateError);
    return { success: false, error: updateError };
  } else {
    console.log('Avatar uploaded successfully');
    return { success: true, url };
  }
}

// Update bio
export async function updateBio(userId, bioText) {
  const { data, error } = await supabase
    .from('users')
    .update({ bio: bioText })
    .eq('id', userId);

  if (error) {
    console.error(error);
    return { success: false, error };
  } else {
    console.log('Bio updated successfully');
    return { success: true };
  }
}

// Upload file
export async function uploadFile(file) {
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`uploads/${file.name}`, file);

  if (error) {
    console.error(error);
    return { success: false, error };
  } else {
    const fileUrl = supabase.storage.from('uploads').getPublicUrl(`uploads/${file.name}`).data.publicUrl;
    console.log('File uploaded successfully. URL: ', fileUrl);
    return { success: true, url: fileUrl };
  }
}

// Send message
export async function sendMessage(userId, messageContent) {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        user_id: userId,
        content: messageContent,
        created_at: new Date(),
      }
    ]);

  if (error) {
    console.error(error);
    return { success: false, error };
  } else {
    console.log('Message sent');
    return { success: true };
  }
}

// Fetch messages
export async function fetchMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*, users(username, avatar_url)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return { success: false, error };
  } else {
    return { success: true, messages: data };
  }
}

// Follow user
export async function followUser(followerId, followingId) {
  const { data, error } = await supabase
    .from('follows')
    .insert([
      { follower_id: followerId, following_id: followingId }
    ]);

  if (error) {
    console.error(error);
    return { success: false, error };
  } else {
    console.log('User followed successfully');
    return { success: true };
  }
}

// Get user profile
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(error);
    return { success: false, error };
  } else {
    return { success: true, profile: data };
  }
}

// Get follows
export async function getFollows(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id, users(username)')
    .eq('follower_id', userId)
    .join('users', { 'following_id': 'id' });

  if (error) {
    console.error(error);
    return { success: false, error };
  } else {
    return { success: true, follows: data };
  }
}