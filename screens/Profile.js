import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert 
} from 'react-native';
import { auth, db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch current user data and phone from Firestore on component mount
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      // Fetch username and phone from Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || currentUser.displayName || ''); // Prefer Firestore username, fallback to Auth
          setPhone(data.phone || '');
        } else {
          // If no Firestore doc exists, use Auth data
          setUsername(currentUser.displayName || '');
        }
      }).catch((error) => {
        console.error('Error fetching data from Firestore:', error);
        setUsername(currentUser.displayName || ''); // Fallback to Auth if Firestore fails
      });
    }
  }, []);

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        // Successfully signed out
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to log out: ' + error.message);
      });
  };

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // Update displayName in Firebase Authentication
      await updateProfile(currentUser, {
        displayName: username.trim(),
      });

      // Update username and phone in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, { 
        username: username.trim(),
        phone: phone.trim() 
      }, { merge: true });

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile: ' + error.message);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Profile Screen</Text> */}

      {/* Display User Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Username:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#888"
          />
        ) : (
          <Text style={styles.value}>{username || 'Not set'}</Text>
        )}

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email || 'Not set'}</Text>

        <Text style={styles.label}>Phone:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone (e.g., 9502007141)"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{phone || 'Not set'}</Text>
        )}
      </View>

      {/* Update Button */}
      {isEditing ? (
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.updateButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
  },
  value: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ff3333',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});