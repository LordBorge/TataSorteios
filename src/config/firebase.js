import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// 1. ADICIONAMOS A IMPORTAÇÃO DO FIRESTORE AQUI
import { getFirestore } from "firebase/firestore";

// As suas chaves secretas do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD9wfIUWNkWqGXTYaApAb0QAZbUOU1cGjI",
  authDomain: "appdesorteio-9f57f.firebaseapp.com",
  projectId: "appdesorteio-9f57f",
  storageBucket: "appdesorteio-9f57f.firebasestorage.app",
  messagingSenderId: "789547500883",
  appId: "1:789547500883:web:45b36d0d6c7760008b4da6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db = getFirestore(app);