// screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, Modal } from 'react-native';
import { auth, db } from '../services/firebase';
import { signOut, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ProfileScreen({ navigation }) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [recipeCount, setRecipeCount] = useState(0);

  useEffect(() => {
    // Fetch total number of recipes uploaded by the user
    const fetchRecipeCount = async () => {
      try {
        const q = query(collection(db, 'recipes'), where('createdBy', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        setRecipeCount(querySnapshot.size);
      } catch (e) {
        setRecipeCount(0);
      }
    };
    fetchRecipeCount();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setIsChanging(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      Alert.alert('Success', 'Password changed successfully!');
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsChanging(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      Alert.alert('Success', 'Password reset email sent!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#6F4E37" />
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={24} color="#6F4E37" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{auth.currentUser?.email}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="book-outline" size={24} color="#6F4E37" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Total Recipes Uploaded</Text>
              <Text style={styles.infoValue}>{recipeCount}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setShowChangePassword(true)}
          activeOpacity={0.9}
        >
          <Ionicons name="key-outline" size={22} color="#6F4E37" />
          <Text style={styles.profileButtonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleResetPassword}
          activeOpacity={0.9}
        >
          <Ionicons name="refresh-outline" size={22} color="#6F4E37" />
          <Text style={styles.profileButtonText}>Reset Password</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#6F4E37', '#8B5A2B']}
            style={styles.logoutButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        transparent
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.profileButton, { flex: 1, marginRight: 8 }]}
                onPress={() => setShowChangePassword(false)}
                disabled={isChanging}
              >
                <Text style={styles.profileButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileButton, { flex: 1, backgroundColor: '#6F4E37' }]}
                onPress={handleChangePassword}
                disabled={isChanging}
              >
                <Text style={[styles.profileButtonText, { color: '#fff' }]}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF8F0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6F4E37',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFEBD6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#6F4E37',
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF8F0',
    borderRadius: 15,
    marginBottom: 10,
  },
  infoTextContainer: {
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6F4E37',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBD6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  profileButtonText: {
    color: '#6F4E37',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  logoutButton: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6F4E37',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0D3C5',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#6F4E37',
    marginBottom: 14,
  },
  modalButtonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
});
