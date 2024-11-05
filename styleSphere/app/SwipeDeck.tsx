import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Define the User type
interface User {
  id: string;
  name: string;
  weight: string;
  location: string;
  instagram: string;
  price: string;
  imageUrl: string;
}

const SwipeDeck = () => {
  const [users, setUsers] = useState<User[]>([]); // Set the state type to User[]

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      const usersCollection = collection(db, 'barbers');
      const snapshot = await getDocs(usersCollection);
      const userData = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<User, 'id'>) }));
      setUsers(userData);
    };

    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Swiper
        cards={users}
        renderCard={(card) =>
          card ? (
            <View style={styles.card}>
              {card.imageUrl ? (
                <Image source={{ uri: card.imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.emptyImage}><Text>No Image</Text></View>
              )}
              <Text style={styles.name}>{card.name}</Text>
              <Text style={styles.details}>Weight: {card.weight}</Text>
              <Text style={styles.details}>Location: {card.location}</Text>
              <Text style={styles.details}>Instagram: {card.instagram}</Text>
              <Text style={styles.details}>Price: ${card.price}</Text>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text>No more users</Text>
            </View>
          )
        }
        onSwiped={(cardIndex) => {
          console.log('Card swiped:', cardIndex);
        }}
        onSwipedAll={() => {
          console.log('All cards swiped');
        }}
        cardIndex={0}
        backgroundColor={'#4CAF50'}
        stackSize={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  emptyImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
    marginVertical: 2,
  },
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
  },
});

export default SwipeDeck;
