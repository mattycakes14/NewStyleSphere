// Profile.tsx
import React from 'react';
import { View, Text } from 'react-native';
import ProfileInput from './ProfileInput'; // Import your ProfileInput component

const Profile = () => {
  return (
    <View>
      <Text>Your Profile</Text>
      <ProfileInput />
    </View>
  );
};

export default Profile;
