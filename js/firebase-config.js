import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLBmCWxiV5n7cNg6NNQVkGKHmMmhY2yDM",
  authDomain: "lubeasy-c75be.firebaseapp.com",
  projectId: "lubeasy-c75be",
  storageBucket: "lubeasy-c75be.firebasestorage.app",
  messagingSenderId: "128335451883",
  appId: "1:128335451883:web:a8f4ca7afee4ad900b90ae"
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

const db = getFirestore(app);

export {
  db
};