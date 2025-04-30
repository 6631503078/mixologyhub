import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileSetupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required.');
      return;
    }
    setIsLoading(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        username: username.trim(),
        email: auth.currentUser.email,
        createdAt: new Date(),
      });
      navigation.replace('ConsentForm');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Up Your Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Continue'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6F4E37',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0D3C5',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#6F4E37',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6F4E37',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 