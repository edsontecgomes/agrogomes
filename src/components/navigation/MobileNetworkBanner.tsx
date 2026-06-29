import { useNetworkStatus } from "../../hooks/useNetworkStatus";

export function MobileNetworkBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <div className="border-b border-amber-800 bg-amber-950 px-4 py-2 text-xs text-amber-200">
      Você está offline. Os dados serão sincronizados quando a conexão voltar.
    </div>
  );
}