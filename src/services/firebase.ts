import { initializeApp } from 'firebase/app';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
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

setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('Persistência de autenticação ativada.'))
  .catch((error) => console.error('Erro ao ativar persistência de autenticação:', error));

export const googleProvider = new GoogleAuthProvider();

export const isMobileOrPWA = () => {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(
    navigator.userAgent
  );

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  return isMobile || isStandalone;
};

export const loginWithGoogle = async () => {
  if (isMobileOrPWA()) {
    throw new Error('No celular, use login por e-mail e senha.');
  }

  return signInWithPopup(auth, googleProvider);
};

export const loginWithEmail = async (email: string, senha: string) => {
  return signInWithEmailAndPassword(auth, email.trim(), senha);
};

export const criarContaComEmail = async (email: string, senha: string) => {
  return createUserWithEmailAndPassword(auth, email.trim(), senha);
};

export const recuperarSenha = async (email: string) => {
  return sendPasswordResetEmail(auth, email.trim());
};

export const logout = () => signOut(auth);