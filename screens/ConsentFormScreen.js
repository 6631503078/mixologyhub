import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ConsentFormScreen({ navigation }) {
  const [agreed, setAgreed] = useState(false);

  const handleAgree = () => {
    if (!agreed) {
      Alert.alert('Consent Required', 'You must agree to continue.');
      return;
    }
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consent Form</Text>
      <Text style={styles.text}>
        By using this app, you agree to our Terms of Service and Privacy Policy. Your data will be stored securely and used only for the purposes of this app.
      </Text>
      <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed(!agreed)}>
        <Ionicons
          name={agreed ? 'checkbox' : 'square-outline'}
          size={28}
          color={agreed ? '#6F4E37' : '#aaa'}
        />
        <Text style={styles.checkboxLabel}>I agree to the terms and privacy policy</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, !agreed && styles.buttonDisabled]}
        onPress={handleAgree}
        disabled={!agreed}
      >
        <Text style={styles.buttonText}>Agree & Continue</Text>
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
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#6F4E37',
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#6F4E37',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#BCAAA4',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 