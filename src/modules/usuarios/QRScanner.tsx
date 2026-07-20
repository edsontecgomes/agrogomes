import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";

interface QRScannerProps {
  onSuccess: (farmId: string) => void;
  onCancel: () => void;
}

export function QRScanner({
  onSuccess,
  onCancel,
}: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      false,
    );

    scanner.render(
      async (decodedText) => {
        await scanner.clear();

        setProcessing(true);
        setError(null);

        try {
          if (!auth.currentUser) {
            throw new Error("Usuário não autenticado.");
          }

          const token = decodedText.trim();

          const conviteRef = doc(
            db,
            "convites",
            token,
          );

          const conviteDoc = await getDoc(
            conviteRef,
          );

          if (!conviteDoc.exists()) {
            throw new Error(
              "Convite inválido ou não encontrado.",
            );
          }

          const convite = conviteDoc.data();

          if (
            !convite.expiresAt?.toDate ||
            convite.expiresAt.toDate() < new Date()
          ) {
            throw new Error(
              "Este convite expirou ou possui data inválida.",
            );
          }

          if (convite.used) {
            throw new Error(
              "Este convite já foi utilizado.",
            );
          }

          if (
            convite.role !== "gerente" &&
            convite.role !== "colaborador" &&
            convite.role !== "operador"
          ) {
            throw new Error(
              "O perfil definido neste convite é inválido.",
            );
          }

          if (
            typeof convite.farmId !== "string" ||
            !convite.farmId
          ) {
            throw new Error(
              "O convite não possui uma fazenda válida.",
            );
          }

          const userId = auth.currentUser.uid;

          const userRef = doc(
            db,
            "usuarios",
            userId,
          );

          const batch = writeBatch(db);

          batch.set(userRef, {
            id: userId,
            email: auth.currentUser.email ?? "",
            nome:
              auth.currentUser.displayName ??
              "Usuário",
            role: convite.role,
            farmId: convite.farmId,
            conviteId: conviteDoc.id,
            createdAt: serverTimestamp(),
          });

          batch.update(conviteRef, {
            used: true,
            usedBy: userId,
            usedAt: serverTimestamp(),
          });

          await batch.commit();

          onSuccess(convite.farmId);
        } catch (caughtError) {
          const message =
            caughtError instanceof Error
              ? caughtError.message
              : "Erro ao processar convite.";

          setError(message);
          setProcessing(false);
        }
      },
      () => {
        // Leituras sem QR válido são ignoradas.
      },
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onSuccess]);

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-center text-xl font-bold text-slate-900">
        Escanear Convite
      </h2>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {processing ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="text-slate-600">
            Processando convite...
          </p>
        </div>
      ) : (
        <div
          id="qr-reader"
          className="mb-4 w-full overflow-hidden rounded-xl border-2 border-slate-100"
        />
      )}

      <button
        type="button"
        onClick={onCancel}
        disabled={processing}
        className="w-full rounded-xl bg-slate-100 px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
      >
        Cancelar
      </button>
    </div>
  );
}