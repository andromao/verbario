import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZLzrxhSC-a_n73i9ZiqtW0pTul5BCx10",
  authDomain: "verbario-e6bda.firebaseapp.com",
  projectId: "verbario-e6bda",
  storageBucket: "verbario-e6bda.firebasestorage.app",
  messagingSenderId: "767691653023",
  appId: "1:767691653023:web:bea41208b96b3205b707aa",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
