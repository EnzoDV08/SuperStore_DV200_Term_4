import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
apiKey: "AIzaSyALxFEsCHPFeZo_JFEaIVWAsETjgwWiHHk",
  authDomain: "superstore-692fb.firebaseapp.com",
  projectId: "superstore-692fb",
  storageBucket: "superstore-692fb.appspot.com",
  messagingSenderId: "329123054315",
  appId: "1:329123054315:web:b3b0e148d203f134d6b4ae",
  measurementId: "G-409Y24KBYF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };
