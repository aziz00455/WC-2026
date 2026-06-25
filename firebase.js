// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCddw-B6fRbAQ7bdKBhCup-RSqewYD9PeA",
    authDomain: "wc2026-prd.firebaseapp.com",
    projectId: "wc2026-prd",
    storageBucket: "wc2026-prd.firebasestorage.app",
    messagingSenderId: "998282277656",
    appId: "1:998282277656:web:466a8efd85c8217c20e46d",
    measurementId: "G-5TQ671ZHQ4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// **** Instance Identifyer ****
const GAME_ID = "WC2026_PRD";

const R32_SELECTION = "Auto"; // allowed: "Auto" or "User"
