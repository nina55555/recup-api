// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {


    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOM,
    projectId: import.meta.env.VITE_API_PROJ_ID,
    storageBucket: import.meta.env.VITE_API_STORAGEBUCKET,
    messagingSenderId:import.meta.env.VITE_API_MESSSENDERID,
    appId: import.meta.env.VITE_API_APPID


/*
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOM,
  projectId: process.env.REACT_APP_API_PROJ_ID,
  storageBucket: process.env.REACT_APP_API_STORAGEBUCKET,
  messagingSenderId:process.env.REACT_APP_API_MESSSENDERID,
  appId: process.env.REACT_APP_API_APPID
  */

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


