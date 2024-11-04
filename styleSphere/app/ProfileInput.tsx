import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth } from '@firebase/auth';

const ProfileInput = () => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const auth = getAuth(); // Get the current authenticated user

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser; // Get current user
      if (user) {
        const db = getFirestore();
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name || '');
          setWeight(userData.weight || '');
          setLocation(userData.location || '');
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchData(); // Call the fetch function
  }, [auth]);

  const handleSubmit = async () => {
    const db = getFirestore();
    const user = auth.currentUser; // Get current user
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name,
        weight,
        location,
      });
      console.log('User data stored successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Enter your details:</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Weight"
        value={weight}
        onChangeText={setWeight}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: 200,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
});

export default ProfileInput;
