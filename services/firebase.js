import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBAlGSTT0pZxVrLEewbJ2W6IACjlvjKCVM",
    authDomain: "project25-mixologyhub.firebaseapp.com",
    projectId: "project25-mixologyhub",
    storageBucket: "project25-mixologyhub.firebasestorage.app",
    messagingSenderId: "29340647184",
    appId: "1:29340647184:web:7b7b37aedd804e882cef95"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
