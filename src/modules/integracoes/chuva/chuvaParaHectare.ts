import { criarRegistroChuvaUei } from "../../uei/motor/chuvaUei";

export function vincularChuvaAoHectare(
  hectareId: string,
  pluviometroId: string,
  volumeMm: number,
  distanciaPluviometroMetros: number,
  data: string,
) {
  return criarRegistroChuvaUei({
    ueiId: hectareId,
    pluviometroId,
    volumeMm,
    distanciaPluviometroMetros,
    data,
  });
}