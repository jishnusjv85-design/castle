import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  enableNetwork,
  disableNetwork,
  onSnapshotsInSync
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize the Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent offline cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Firebase Auth
const auth = getAuth(app);

export { app, db, auth, enableNetwork, disableNetwork, onSnapshotsInSync };
