import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { initializeApp } from '@firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, initializeAuth, getReactNativePersistence } from '@firebase/auth';
import { useNavigation } from 'expo-router'; // Updated to use expo-router
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const firebaseConfig = {
  apiKey: "AIzaSyCoZGEMEylJoGZUPF0iL76tB-YpNv7O12Q",
  authDomain: "style-sp.firebaseapp.com",
  projectId: "style-sp",
  storageBucket: "style-sp.firebasestorage.app",
  messagingSenderId: "s105217633721",
  appId: "1:105217633721:web:87a99189a2a4cd6cdc5a68",
  measurementId: "G-9YW44NF6LH"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null); // Track user authentication state
  const [isLogin, setIsLogin] = useState(true);
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Redirect to Profile after successful login
        navigation.navigate('Profile'); // Adjust to match your route name
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleAuthentication = async () => {
    try {
      if (user) {
        // If user is already authenticated, log out
        console.log('User logged out successfully!');
        await signOut(auth);
      } else {
        // Sign in or sign up
        if (isLogin) {
          // Sign in
          await signInWithEmailAndPassword(auth, email, password);
          console.log('User signed in successfully!');
        } else {
          // Sign up
          await createUserWithEmailAndPassword(auth, email, password);
          console.log('User created successfully!');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text>{isLogin ? 'Sign in' : 'Sign Up'}</Text>
        <TextInput 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail} 
          placeholder="Email" 
          autoCapitalize='none' 
          keyboardType='email-address' // Improved input for email
        />
        <TextInput 
          style={styles.input} 
          value={password} 
          onChangeText={setPassword} 
          placeholder="Password" 
          autoCapitalize='none' 
          secureTextEntry // Added secure text entry for password
        />
        <Button title={isLogin ? 'Sign In' : 'Sign Up'} onPress={handleAuthentication} />
        <Text onPress={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
