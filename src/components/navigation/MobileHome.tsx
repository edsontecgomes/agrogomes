import { MobileModuleGrid } from "./MobileModuleGrid";

export function MobileHome() {
  return (
    <main className="min-h-screen bg-zinc-950 pb-20 text-white">
      <section className="p-4">
        <p className="text-sm text-emerald-400">
          Sistema Operacional Agronômico
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          Gestão Agro
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Organize a fazenda, registre o campo e alimente a Memória Agronômica.
        </p>
      </section>

      <MobileModuleGrid />
    </main>
  );
}