import React from "react";
import { User } from "firebase/auth";
import {
  LogOut,
  ShieldCheck,
  Sprout,
} from "lucide-react";

import { EQTARA } from "../../config/eqtara";
import { Usuario } from "../../types";
import { FarmSelector } from "../FarmSelector";
import { HealthStatusIndicator } from "../HealthStatusIndicator";
import { SyncStatus } from "../SyncStatus";

type MainLayoutProps = {
  user: User;

  usuario: Usuario;

  currentFarmId: string | null;

  isSystemAdmin: boolean;

  onLogout: () => void;

  children: React.ReactNode;
};

export function MainLayout({
  user,
  usuario,
  currentFarmId,
  isSystemAdmin,
  onLogout,
  children,
}: MainLayoutProps) {
  const nomeUsuario =
    user.displayName ||
    usuario.nome ||
    usuario.name ||
    user.email ||
    "Usuário";

  const avatarNome =
    encodeURIComponent(
      nomeUsuario,
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg shrink-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>

              <div className="hidden xs:block">
                <span className="block leading-none">
                  {EQTARA.nome}
                </span>

                <span className="hidden lg:block mt-1 text-[10px] leading-none font-medium tracking-wide text-slate-400">
                  {
                    EQTARA.conceitos
                      .sistema
                  }
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-3 min-w-0">
              <FarmSelector />

              {isSystemAdmin && (
                <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-200 whitespace-nowrap">
                  <ShieldCheck className="w-3 h-3" />

                  System Admin
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-3">
              <HealthStatusIndicator
                farmId={
                  currentFarmId
                }
              />

              <SyncStatus />
            </div>

            <div className="flex items-center gap-2">
              <img
                src={
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${avatarNome}`
                }
                alt={`Avatar de ${nomeUsuario}`}
                className="w-8 h-8 rounded-full border border-slate-200"
                referrerPolicy="no-referrer"
              />

              <div className="hidden sm:block max-w-48">
                <span className="text-sm font-medium text-slate-700 block leading-tight truncate">
                  {nomeUsuario}
                </span>

                <span className="text-xs text-slate-500 capitalize">
                  {usuario.role ??
                    "usuário"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Sair"
              aria-label="Sair da Eqtara"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}