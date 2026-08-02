import assert from "node:assert/strict";
import test from "node:test";

import { gerarPontosColetaUEI } from "../src/modules/solo/gerarPontosColetaUEI.ts";
import { resolverPresencaOperacional } from "../src/modules/motorEspacial/presencaOperacional.ts";

const talhao = {
  id: "talhao-1", nome: "Primavera 01", farmId: "farm-1", producerId: "prod-1",
  coordenadas: [{ lat: -2, lng: -2 }, { lat: -2, lng: 2 }, { lat: 2, lng: 2 }, { lat: 2, lng: -2 }],
  limiteAtivacaoOperacional: [{ lat: -1, lng: -1 }, { lat: -1, lng: 1 }, { lat: 1, lng: 1 }, { lat: 1, lng: -1 }],
};
const uei = {
  id: "uei-27", farmId: "farm-1", talhaoId: "talhao-1",
  codigo: "PRIMAVERA-01-UEI-0027", areaHa: 1,
  geometria: [{ lat: -0.8, lng: -0.8 }, { lat: -0.8, lng: 0.8 }, { lat: 0.8, lng: 0.8 }, { lat: 0.8, lng: -0.8 }],
};

test("identifica fora, dentro, UEI e GPS impreciso", () => {
  assert.equal(resolverPresencaOperacional({ lat: 1.5, lng: 1.5, accuracy: 5 }, [talhao], [uei]).status, "fora");
  const dentro = resolverPresencaOperacional({ lat: 0, lng: 0, accuracy: 5 }, [talhao], [uei]);
  assert.equal(dentro.status, "dentro");
  assert.equal(dentro.ueiCodigo, "PRIMAVERA-01-UEI-0027");
  assert.equal(resolverPresencaOperacional({ lat: 0, lng: 0, accuracy: 40 }, [talhao], [uei]).status, "gps_impreciso");
});

test("gera cinco pontos permanentes e identificadores estáveis por UEI", () => {
  const primeira = gerarPontosColetaUEI(uei);
  assert.equal(primeira.length, 5);
  assert.deepEqual(primeira, gerarPontosColetaUEI(uei));
  assert.equal(primeira[0].codigo, "PRIMAVERA-01-UEI-0027-P01");
  assert.equal(primeira[0].principal, true);
  assert.ok(primeira.slice(1).every((ponto) => ponto.principal === false));
  assert.ok(primeira.every((ponto) => ponto.talhaoId === talhao.id));
  assert.ok(primeira.every((ponto) => ponto.ueiId === uei.id));
  assert.equal(new Set(primeira.map((ponto) => ponto.id)).size, 5);
  assert.ok(primeira.every((ponto) => ponto.raioOperacionalMetros >= 2 && ponto.raioOperacionalMetros <= 5));
});
