import React, { useState } from 'react';
import { useConvites } from '../../hooks/useUsuarios';
import { UserRole } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, QrCode, Trash2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { addDoc, collection, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { handleFirestoreError } from '../../utils/errorHandling';

interface ConvitesListProps {
  farmId: string;
}

export function ConvitesList({ farmId }: ConvitesListProps) {
  const { convites, loading } = useConvites(farmId);
  const [isCreating, setIsCreating] = useState(false);
  const [role, setRole] = useState<UserRole>('colaborador');
  const [expandedConvite, setExpandedConvite] = useState<string | null>(null);

  const handleCreateConvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    // Generate a secure random token
    const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    try {
      await addDoc(collection(db, 'convites'), {
        token,
        farmId,
        role,
        createdBy: auth.currentUser.uid,
        expiresAt,
        used: false,
        createdAt: serverTimestamp()
      });
      setIsCreating(false);
      setRole('colaborador');
    } catch (error) {
      handleFirestoreError(error, 'create' as any, 'convites');
    }
  };

  const handleDeleteConvite = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este convite?')) {
      try {
        await deleteDoc(doc(db, 'convites', id));
      } catch (error) {
        handleFirestoreError(error, 'delete' as any, 'convites');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-slate-500">Carregando convites...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Convites Ativos</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Usuário
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateConvite} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-semibold text-slate-800">Criar Novo Convite</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Usuário</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="gerente">Gerente (Acesso parcial)</option>
              <option value="colaborador">Colaborador (Acesso limitado)</option>
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Gerar Convite
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {convites.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500">Nenhum convite gerado.</p>
          </div>
        ) : (
          convites.map(convite => {
            const isExpired = convite.expiresAt < new Date();
            const isUsed = convite.used;
            const isValid = !isExpired && !isUsed;

            return (
              <div key={convite.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isValid ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 capitalize">{convite.role}</h3>
                      <p className="text-xs text-slate-500">
                        Expira em: {convite.expiresAt.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteConvite(convite.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium w-full justify-center">
                    {isUsed ? (
                      <span className="text-slate-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Utilizado</span>
                    ) : isExpired ? (
                      <span className="text-red-500 flex items-center gap-1"><XCircle className="w-4 h-4" /> Expirado</span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1"><Clock className="w-4 h-4" /> Válido</span>
                    )}
                  </div>

                  {isValid && (
                    <button
                      onClick={() => setExpandedConvite(expandedConvite === convite.id ? null : convite.id)}
                      className="w-full px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-xl transition-colors"
                    >
                      {expandedConvite === convite.id ? 'Ocultar QR Code' : 'Mostrar QR Code'}
                    </button>
                  )}

                  {expandedConvite === convite.id && isValid && (
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <QRCodeSVG value={convite.token} size={150} />
                      <p className="text-xs text-center text-slate-500 mt-2 break-all">
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
