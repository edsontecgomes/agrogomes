import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { useOfflineSync } from "../../hooks/useOfflineSync";

export function MobileSyncStatus() {
  const { isOffline } = useNetworkStatus();
  const { queueSize, isSyncing, syncNow } = useOfflineSync();

  if (queueSize === 0 && !isSyncing) return null;

  return (
    <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-zinc-300">
      <div className="flex items-center justify-between gap-3">
        <span>
          {isSyncing
            ? "Sincronizando dados..."
            : `${queueSize} item(ns) aguardando sincronização`}
        </span>

        {!isOffline && !isSyncing && (
          <button
            type="button"
            onClick={syncNow}
            className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white"
          >
            Sincronizar
          </button>
        )}
      </div>
    </div>
  );
}