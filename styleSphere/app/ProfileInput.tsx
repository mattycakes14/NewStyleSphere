import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth } from '@firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const ProfileInput = () => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [instagram, setInstagram] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        const docRef = doc(db, 'barbers', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name || '');
          setWeight(userData.weight || '');
          setLocation(userData.location || '');
          setInstagram(userData.instagram || '');
          setPrice(userData.price || '');
          setImageUrl(userData.imageUrl || '');
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchData();
  }, [auth]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need permission to access your photo library.');
      return false;
    }
    return true;
  };

  const handleImagePick = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.uri);
    }
  };

  const handleUpload = async () => {
    if (!imageUri) return;

    const user = auth.currentUser;
    const storage = getStorage();
    const storageRef = ref(storage, `barberImages/${user.uid}.jpg`);

    const imgBlob = await fetch(imageUri).then((res) => res.blob());
    await uploadBytes(storageRef, imgBlob);
    const downloadUrl = await getDownloadURL(storageRef);
    setImageUrl(downloadUrl);

    console.log('Image uploaded successfully!');
  };

  const handleSubmit = async () => {
    const db = getFirestore();
    const user = auth.currentUser;
    try {
      await setDoc(doc(db, 'barbers', user.uid), {
        name,
        weight,
        location,
        instagram,
        price,
        imageUrl,
      });
      console.log('User data stored successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Enter your details:</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Weight" value={weight} onChangeText={setWeight} />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Instagram Handle" value={instagram} onChangeText={setInstagram} />
      <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <Button title="Pick an Image" onPress={handleImagePick} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
      <Button title="Upload Image" onPress={handleUpload} />
      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '90%', // Use a percentage to adapt to screen width
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
});

export default ProfileInput;
