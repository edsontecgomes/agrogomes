let warmedUp = false;

export async function warmupOperationalModules() {
  if (
    warmedUp ||
    !navigator.onLine
  ) {
    return;
  }

  warmedUp = true;

  await Promise.allSettled([
    import(
      "../../modules/servicos/ServicosDashboard"
    ),
    import(
      "../../modules/servicos/ChecklistRunner"
    ),
    import(
      "../../modules/operador/OperadorDashboard"
    ),
  ]);
}
