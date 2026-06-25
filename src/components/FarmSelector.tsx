import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  MapPin, 
  Plus, 
  Check, 
  Sprout,
  ArrowRight,
  Search,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFarm } from '../contexts/FarmContext';

export function FarmSelector() {
  const { fazendas: initialFazendas, activeFarm, setCurrentFarmId, usuario, searchAllFarms } = useFarm();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isSystemAdmin = usuario?.role === 'system_admin';
  const isAdmin = usuario?.role === 'admin' || usuario?.role === 'produtor' || isSystemAdmin;
  const showAddButton = isAdmin && !isSystemAdmin;

  useEffect(() => {
    if (isSystemAdmin && searchTerm.length > 2) {
      const delayDebounceFn = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchAllFarms(searchTerm);
          setSearchResults(results);
        } catch (error) {
          console.error("Error searching farms:", error);
        } finally {
          setIsSearching(false);
        }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, isSystemAdmin, searchAllFarms]);

  const displayedFazendas = isSystemAdmin && searchTerm.length > 2 ? searchResults : initialFazendas;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all active:scale-95 group ${
          isSystemAdmin ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
        }`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
          isSystemAdmin ? 'bg-amber-500 text-slate-900 shadow-amber-500/20' : 'bg-emerald-600 text-white shadow-emerald-100'
        }`}>
           {isSystemAdmin ? <ShieldCheck className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
        </div>
        <div className="text-left hidden sm:block">
           <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${
             isSystemAdmin ? 'text-amber-500' : 'text-slate-400'
           }`}>
             {isSystemAdmin ? 'Modo Suporte' : 'Fazenda Ativa'}
           </p>
           <p className={`text-sm font-bold leading-none truncate max-w-[150px] ${
             isSystemAdmin ? 'text-white' : 'text-slate-900'
           }`}>
             {activeFarm?.nome || 'Selecionar...'}
           </p>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${
          isSystemAdmin ? 'text-slate-500' : 'text-slate-400'
        }`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-80 bg-white rounded-[32px] shadow-2xl border border-slate-100 p-3 z-50 overflow-hidden"
            >
              {isSystemAdmin && (
                <div className="relative mb-3">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Buscar fazenda (nome)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 mb-2 flex items-center justify-between">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                   {isSystemAdmin && searchTerm.length > 2 ? 'Resultados' : 'Minhas Propriedades'}
                 </h3>
                 {isSystemAdmin && (
                   <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">Admin</span>
                 )}
              </div>

              <div className="space-y-1 max-h-[350px] overflow-y-auto no-scrollbar">
                {displayedFazendas.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-sm">Nenhuma fazenda encontrada</p>
                  </div>
                ) : (
                  displayedFazendas.map((f: any) => (
                    <button 
                      key={f.id}
                      onClick={() => {
                        setCurrentFarmId(f.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                        f.id === activeFarm?.id 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                         f.id === activeFarm?.id 
                           ? (isSystemAdmin ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white') 
                           : 'bg-slate-100 text-slate-400'
                      }`}>
                         <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-grow text-left">
                         <p className="text-sm font-bold leading-tight truncate">{f.nome}</p>
                         <p className="text-[10px] opacity-60 leading-tight">
                           {f.cidade && f.estado ? `${f.cidade}, ${f.estado}` : 'Localização não definida'}
                         </p>
                      </div>
                      {f.id === activeFarm?.id && <Check className="w-4 h-4" />}
                    </button>
                  ))
                )}
              </div>

              {showAddButton && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <button 
                    className="w-full flex items-center gap-3 p-3 rounded-2xl text-emerald-600 font-bold hover:bg-emerald-50 transition-all"
                    onClick={() => {
                      setIsOpen(false);
                      window.dispatchEvent(new CustomEvent('open-farm-onboarding'));
                    }}
                  >
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-sm">Adicionar Fazenda</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
