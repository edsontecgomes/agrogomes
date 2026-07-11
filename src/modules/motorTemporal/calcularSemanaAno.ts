export function calcularSemanaAno(
  data: Date,
): number {
  const dataUTC = new Date(
    Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth(),
      data.getUTCDate(),
    ),
  );

  const diaSemana =
    dataUTC.getUTCDay() || 7;

  dataUTC.setUTCDate(
    dataUTC.getUTCDate() +
      4 -
      diaSemana,
  );

  const inicioAno = new Date(
    Date.UTC(
      dataUTC.getUTCFullYear(),
      0,
      1,
    ),
  );

  return Math.ceil(
    (
      (
        dataUTC.getTime() -
        inicioAno.getTime()
      ) /
        86_400_000 +
      1
    ) /
      7,
  );
}