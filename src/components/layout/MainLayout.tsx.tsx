import React from "react";
import { User } from "firebase/auth";
import { LogOut, ShieldCheck, Sprout } from "lucide-react";
import { FarmSelector } from "../FarmSelector";
import { HealthStatusIndicator } from "../HealthStatusIndicator";
import { SyncStatus } from "../SyncStatus";
import { Usuario } from "../../types";

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
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
              <Sprout className="w-6 h-6" />
              AgroGomes
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />

            <div className="flex items-center gap-3">
              <FarmSelector />

              {isSystemAdmin && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-200">
                  <ShieldCheck className="w-3 h-3" />
                  System Admin
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <HealthStatusIndicator farmId={currentFarmId} />
              <SyncStatus />
            </div>

            <div className="flex items-center gap-2">
              <img
                src={
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${user.email}`
                }
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-slate-200"
                referrerPolicy="no-referrer"
              />

              <div className="hidden sm:block">
                <span className="text-sm font-medium text-slate-700 block leading-tight">
                  {user.displayName || user.email}
                </span>

                <span className="text-xs text-slate-500 capitalize">
                  {usuario.role}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Sair"
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