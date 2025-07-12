
import { GalleryItem } from '../types';

let initPromise: Promise<string | null> | null = null;

const firebaseService = {
  db: null as any,
  auth: null as any,
  firebase: null as any,

  initializeFirebase(): Promise<string | null> {
    if (initPromise) return initPromise;

    initPromise = new Promise((resolve, reject) => {
      this.firebase = window.firebase;
      if (!this.firebase) {
        return reject("CRITICAL: Firebase SDK is missing.");
      }
      
      const firebaseConfigString = window._firebase_config;
      if(!firebaseConfigString) {
          return reject("CRITICAL: Firebase configuration is missing.");
      }

      try {
        const firebaseConfig = JSON.parse(firebaseConfigString);
        if (this.firebase.apps.length === 0) {
          this.firebase.initializeApp(firebaseConfig);
        }
        this.auth = this.firebase.auth();
        this.db = this.firebase.firestore();

        const handleUser = (user: any) => {
          if (user) resolve(user.uid);
          else reject(new Error("Firebase user is null after authentication flow."));
        };

        const unsubscribe = this.auth.onAuthStateChanged(async (user: any) => {
          unsubscribe();
          if (user) return handleUser(user);

          try {
            const token = window._initial_auth_token;
            if (token) {
              await this.auth.signInWithCustomToken(token);
            } else {
              await this.auth.signInAnonymously();
            }
            const finalUnsubscribe = this.auth.onAuthStateChanged((finalUser: any) => {
                finalUnsubscribe();
                handleUser(finalUser);
            });
          } catch (authError) {
            console.error("Firebase Auth Error:", authError);
            reject(authError);
          }
        });
      } catch (error) {
        console.error("Firebase Initialization Error:", error);
        reject(error);
      }
    });
    return initPromise;
  },

  getCollectionRef(userId: string, name: string) {
    if (!this.db) throw new Error("Firestore is not initialized.");
    const appId = window._app_id || 'ai-image-studio-dev';
    return this.db.collection(`artifacts/${appId}/users/${userId}/${name}`);
  },

  listenToCollection(userId: string, collectionName: string, callback: (data: GalleryItem[]) => void) {
    const q = this.getCollectionRef(userId, collectionName)
      .orderBy('createdAt', 'desc')
      .limit(50);
    
    return q.onSnapshot((snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as GalleryItem[];
      callback(data);
    }, (error: any) => {
      console.error(`Error listening to ${collectionName}:`, error);
    });
  },

  saveCharacter(userId: string, prompt: string, imageSrc: string) {
    if (!this.db) return Promise.reject("Firestore not initialized.");
    return this.getCollectionRef(userId, 'characters').add({
      prompt,
      src: imageSrc,
      createdAt: this.firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  deleteCharacter(userId: string, id: string) {
    return this.getCollectionRef(userId, 'characters').doc(id).delete();
  },
};

export default firebaseService;
