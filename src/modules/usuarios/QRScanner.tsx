import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { handleFirestoreError } from '../../utils/errorHandling';
import { UserRole } from '../../types';

interface QRScannerProps {
  onSuccess: (farmId: string) => void;
  onCancel: () => void;
}

export function QRScanner({ onSuccess, onCancel }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(async (decodedText) => {
      // Stop scanning once we get a result
      scanner.clear();
      setProcessing(true);
      setError(null);

      try {
        if (!auth.currentUser) throw new Error('Usuário não autenticado');

        // Buscar convite pelo token
        const q = query(
          collection(db, 'convites'),
          where('token', '==', decodedText)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('Convite inválido ou não encontrado.');
        }

        const conviteDoc = querySnapshot.docs[0];
        const convite = conviteDoc.data();

        // Validar se não expirou
        if (convite.expiresAt.toDate() < new Date()) {
          throw new Error('Este convite expirou.');
        }

        // Validar se não foi usado
        if (convite.used) {
          throw new Error('Este convite já foi utilizado.');
        }

        // Criar usuário automaticamente
        const userId = auth.currentUser.uid;
        const userRef = doc(db, 'usuarios', userId);
        
        await setDoc(userRef, {
          email: auth.currentUser.email || '',
          nome: auth.currentUser.displayName || 'Usuário',
          role: convite.role,
          farmId: convite.farmId,
          createdAt: serverTimestamp()
        });

        // Marcar convite como usado
        await updateDoc(doc(db, 'convites', conviteDoc.id), {
          used: true
        });

        onSuccess(convite.farmId);
      } catch (err: any) {
        setError(err.message || 'Erro ao processar convite.');
        setProcessing(false);
      }
    }, (err) => {
      // Ignore scan errors (happens when no QR code is in view)
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onSuccess]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full mx-auto">
      <h2 className="text-xl font-bold text-slate-900 mb-4 text-center">Escanear Convite</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {processing ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600">Processando convite...</p>
        </div>
      ) : (
        <div id="qr-reader" className="w-full overflow-hidden rounded-xl border-2 border-slate-100 mb-4"></div>
      )}

      <button
        onClick={onCancel}
        disabled={processing}
        className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors disabled:opacity-50"
      >
        Cancelar
      </button>
    </div>
  );
}
