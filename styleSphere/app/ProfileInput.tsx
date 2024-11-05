import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';

const ProfileInput = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [instagram, setInstagram] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const auth = getAuth();

  // Fetch user data from Firestore
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
          setImageUri(userData.imageUrl || null); // Change from setImageUrl to setImageUri for consistency
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

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri); // Set the image URI from the first asset
    }
  };

  const handleUpload = async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (!user || !imageUri) return null;

    const storage = getStorage();
    const storageRef = ref(storage, `barberImages/${user.uid}.jpg`);

    try {
      const imgBlob = await fetch(imageUri).then((res) => res.blob());
      await uploadBytes(storageRef, imgBlob);
      console.log('Image uploaded successfully!');
      return await getDownloadURL(storageRef); // Return the URL of the uploaded image
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Error uploading image: ${error.message}`);
      return null;
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('User is not logged in!');
      return;
    }

    const db = getFirestore();

    try {
      // Upload the image and get the URL
      const uploadedImageUrl = await handleUpload();

      // Store user data with the obtained image URL if available
      await setDoc(doc(db, 'barbers', user.uid), {
        name,
        weight,
        location,
        instagram,
        price,
        imageUrl: uploadedImageUrl || '', // Use the image URL obtained from upload, default to empty string if null
      });

      console.log('User data stored successfully!');
      navigation.navigate('SwipeDeck'); // Redirect to SwipeDeck after submission
    } catch (error: any) {
      console.error('Error saving user data:', error);
      alert(`Error saving user data: ${error.message}`);
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
      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10,
  },
});

export default ProfileInput;
