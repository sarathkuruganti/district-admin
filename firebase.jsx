import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAOuDBl_XXldjyLgdhttjwa-2KoQhRN_LI",
    authDomain: "flavoursocean-23053.firebaseapp.com",
    projectId: "flavoursocean-23053",
    storageBucket: "flavoursocean-23053.appspot.com",
    messagingSenderId: "448237876371",
    appId: "1:448237876371:web:455981276ee2ad7b5dc966",
    measurementId: "G-GDYQ67H6RL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
