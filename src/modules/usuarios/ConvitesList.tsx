import React, { useState } from "react";
import { useConvites } from "../../hooks/useUsuarios";
import { UserRole } from "../../types";
import { QRCodeSVG } from "qrcode.react";
import {
  Plus,
  QrCode,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import {
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { handleFirestoreError } from "../../utils/errorHandling";

interface ConvitesListProps {
  farmId: string;
}

export function ConvitesList({ farmId }: ConvitesListProps) {
  const { convites, loading } = useConvites(farmId);
  const [isCreating, setIsCreating] = useState(false);
  const [role, setRole] = useState<UserRole>("colaborador");
  const [expandedConvite, setExpandedConvite] =
    useState<string | null>(null);

  const handleCreateConvite = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!auth.currentUser) return;

    const token = Array.from(
      crypto.getRandomValues(new Uint8Array(16)),
    )
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    try {
      await setDoc(doc(db, "convites", token), {
        id: token,
        token,
        farmId,
        role,
        createdBy: auth.currentUser.uid,
        expiresAt,
        used: false,
        createdAt: serverTimestamp(),
      });

      setIsCreating(false);
      setRole("colaborador");
    } catch (error) {
      handleFirestoreError(
        error,
        "create" as any,
        "convites",
      );
    }
  };

  const handleDeleteConvite = async (id: string) => {
    if (
      !window.confirm(
        "Tem certeza que deseja remover este convite?",
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "convites", id));
    } catch (error) {
      handleFirestoreError(
        error,
        "delete" as any,
        "convites",
      );
    }
  };

  if (loading) {
    return (
      <div className="py-4 text-center text-slate-500">
        Carregando convites...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          Convites Ativos
        </h2>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Adicionar Usuário
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreateConvite}
          className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <h3 className="font-semibold text-slate-800">
            Criar Novo Convite
          </h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tipo de Usuário
            </label>

            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value as UserRole)
              }
              className="w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="gerente">
                Gerente (Acesso parcial)
              </option>

              <option value="colaborador">
                Colaborador (Acesso limitado)
              </option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Gerar Convite
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {convites.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-100 bg-white py-12 text-center">
            <p className="text-slate-500">
              Nenhum convite gerado.
            </p>
          </div>
        ) : (
          convites.map((convite) => {
            const isExpired =
              convite.expiresAt < new Date();
            const isUsed = convite.used;
            const isValid = !isExpired && !isUsed;

            return (
              <div
                key={convite.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isValid
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      <QrCode className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold capitalize text-slate-900">
                        {convite.role}
                      </h3>

                      <p className="text-xs text-slate-500">
                        Expira em:{" "}
                        {convite.expiresAt.toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteConvite(convite.id)
                    }
                    className="text-slate-400 transition-colors hover:text-red-600"
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex flex-col items-center gap-4 border-t border-slate-100 pt-4">
                  <div className="flex w-full items-center justify-center gap-2 text-sm font-medium">
                    {isUsed ? (
                      <span className="flex items-center gap-1 text-slate-500">
                        <CheckCircle2 className="h-4 w-4" />
                        Utilizado
                      </span>
                    ) : isExpired ? (
                      <span className="flex items-center gap-1 text-red-500">
                        <XCircle className="h-4 w-4" />
                        Expirado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Clock className="h-4 w-4" />
                        Válido
                      </span>
                    )}
                  </div>

                  {isValid && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedConvite(
                          expandedConvite === convite.id
                            ? null
                            : convite.id,
                        )
                      }
                      className="w-full rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      {expandedConvite === convite.id
                        ? "Ocultar QR Code"
                        : "Mostrar QR Code"}
                    </button>
                  )}

                  {expandedConvite === convite.id &&
                    isValid && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <QRCodeSVG
                          value={convite.token}
                          size={150}
                        />

                        <p className="mt-2 break-all text-center text-xs text-slate-500">
                          {convite.token}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}