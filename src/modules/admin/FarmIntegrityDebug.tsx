import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Wrench,
  Search,
  Database,
  ChevronRight,
  User,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { migrationService, IntegrityIssue } from '../../services/migrationService';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../services/firebase';

export function FarmIntegrityDebug() {
  const [issues, setIssues] = useState<IntegrityIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, critical: 0 });

  const checkIntegrity = async () => {
    setLoading(true);
    try {
      const results = await migrationService.validateFarmConsistency();
      setIssues(results);
      setStats({
        total: results.length,
        critical: results.filter(i => i.issue.includes('Missing') || i.issue.includes('Invalid')).length
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const repairAll = async () => {
    if (!window.confirm('Deseja executar reparos automáticos em todos os registros possíveis?')) return;
    
    setRepairing(true);
    try {
      const result = await migrationService.repairOrphanRecords(issues);
      alert(`Reparo concluído!\nReparados: ${result.repaired}\nFalhas: ${result.failed}`);
      await checkIntegrity();
    } catch (error) {
      console.error(error);
      alert('Erro ao executar reparo em massa.');
    } finally {
      setRepairing(false);
    }
  };

  useEffect(() => {
    checkIntegrity();
  }, []);

  const handleFixIssue = async (issue: IntegrityIssue) => {
    // Implement specific fixes here or in service
    alert(`Ação de correção para ${issue.id} nas ${issue.collection} em breve.`);
  };

  const filteredIssues = issues.filter(i => 
    i.collection.toLowerCase().includes(filter.toLowerCase()) ||
    i.issue.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            Integridade de Dados (Farm Migration)
          </h1>
          <p className="text-slate-500 text-sm">Verificador de consistência da arquitetura multi-fazenda</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={repairAll}
            disabled={loading || repairing || issues.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 font-bold rounded-2xl transition-all active:scale-95"
          >
            <Wrench className={`w-5 h-5 ${repairing ? 'animate-bounce' : ''}`} />
            Auto-Reparar Tudo
          </button>
          <button 
            onClick={checkIntegrity}
            disabled={loading || repairing}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Recarregar
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-50 rounded-xl">
              <Database className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Anomalias</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 rounded-xl">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-xs font-black text-rose-400 uppercase tracking-widest">Inconsistências</span>
          </div>
          <p className="text-3xl font-black text-rose-600">{stats.critical}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Registros Válidos</span>
          </div>
          <p className="text-3xl font-black text-emerald-600">--</p>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Filtrar coleção ou problema..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="text-xs text-slate-400 font-bold">
            Mostrando {filteredIssues.length} problemas detectados
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredIssues.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Tudo em conformidade!</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Não foram encontradas inconsistências na estrutura multi-fazenda atualmente.</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <motion.div 
                key={issue.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-slate-50/50 transition-colors flex gap-4 items-start"
              >
                <div className={`p-3 rounded-2xl shrink-0 ${
                  issue.issue.includes('Missing') ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {issue.collection === 'usuarios' ? <User className="w-6 h-6" /> : <Database className="w-6 h-6" />}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-wider">
                      {issue.collection}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {issue.id}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">{issue.issue}</h4>
                  {issue.suggestedFix && (
                    <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                      <ChevronRight className="w-4 h-4" />
                      Sugestão: {issue.suggestedFix}
                    </p>
                  )}
                  
                  {/* Raw Data Preview */}
                  <details className="mt-4">
                    <summary className="text-xs text-slate-400 font-bold cursor-pointer hover:text-slate-600">Ver Dados Brutos</summary>
                    <pre className="mt-2 p-4 bg-slate-900 text-emerald-400 rounded-2xl text-[10px] font-mono overflow-x-auto">
                      {JSON.stringify(issue.data, null, 2)}
                    </pre>
                  </details>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleFixIssue(issue)}
                    className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 rounded-xl transition-all"
                    title="Reparar Registro"
                  >
                    <Wrench className="w-5 h-5" />
                  </button>
                  <button 
                    className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all"
                    title="Ignorar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
