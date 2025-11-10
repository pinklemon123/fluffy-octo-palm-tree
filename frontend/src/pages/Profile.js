import React, { useState, useEffect } from 'react';
import { getUserProfile, updateBio, uploadAvatar, getFollows } from '../services/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [follows, setFollows] = useState([]);

  useEffect(() => {
    // Assume userId is 1 for demo
    const userId = 1;
    getUserProfile(userId).then(result => {
      if (result.success) {
        setProfile(result.profile);
        setBio(result.profile.bio || '');
      }
    });
    getFollows(userId).then(result => {
      if (result.success) {
        setFollows(result.follows);
      }
    });
  }, []);

  const handleBioUpdate = async () => {
    const result = await updateBio(profile.id, bio);
    if (result.success) {
      alert('Bio updated');
    }
  };

  const handleAvatarUpload = async () => {
    if (avatar) {
      const result = await uploadAvatar(avatar, profile.id);
      if (result.success) {
        alert('Avatar uploaded');
        setProfile({ ...profile, avatar_url: result.url });
      }
    }
  };

  return (
    <div>
      <h2>Profile</h2>
      {profile && (
        <div>
          <img src={profile.avatar_url} alt="Avatar" className="avatar" />
          <p>Username: {profile.username}</p>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Your bio"
          />
          <button onClick={handleBioUpdate}>Update Bio</button>
          <br />
          <input type="file" onChange={(e) => setAvatar(e.target.files[0])} />
          <button onClick={handleAvatarUpload}>Upload Avatar</button>
        </div>
      )}
      <h3>Follows</h3>
      <ul>
        {follows.map(follow => (
          <li key={follow.following_id}>{follow.users.username}</li>
        ))}
      </ul>
    </div>
  );
}

export default Profile;