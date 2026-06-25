import { initializeApp } from 'firebase/app';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth';

import {
  getFirestore,
  enableIndexedDbPersistence,
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Múltiplas abas abertas. A persistência offline só funciona em uma aba por vez.');
  } else if (err.code === 'unimplemented') {
    console.warn('Este navegador não suporta persistência offline do Firestore.');
  } else {
    console.warn('Erro ao ativar persistência offline:', err);
  }
});

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  const isMobile =
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  console.log('LOGIN BUTTON CLICKED');
  console.log('isMobile:', isMobile);
  console.log('isStandalone:', isStandalone);
  console.log('authDomain:', auth.app.options.authDomain);

  
  return signInWithPopup(auth, googleProvider);
};

export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    console.log('REDIRECT RESULT:', result?.user?.email || 'sem resultado');
    return result;
  } catch (error) {
    console.error('REDIRECT ERROR:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);