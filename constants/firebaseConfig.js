// firebaseConfig.js
import { initializeApp } from "firebase/app";
import {getFirestore} from  "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDruk9gvnvnoVJdpfm_d3Byrf-pXbIT6xU",
  authDomain: "btth-de099.firebaseapp.com",
  projectId: "btth-de099",
  storageBucket: "btth-de099.appspot.com",
  messagingSenderId: "688171639073",
  appId: "1:688171639073:web:b11ba159768667c8769e60",
  measurementId: "G-XE3DDSWYY3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db=getFirestore(app);
export {db};