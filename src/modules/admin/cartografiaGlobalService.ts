import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../../services/firebase";
import type {
  CartografiaGlobal,
  CoordenadaCartografica,
  FazendaCartografica,
  TalhaoCartografico,
  UEICartografica,
} from "./cartografiaGlobalTypes";

function coordenadaValida(
  valor: unknown,
): valor is CoordenadaCartografica {
  if (
    typeof valor !== "object" ||
    valor === null
  ) {
    return false;
  }

  const candidato = valor as {
    lat?: unknown;
    lng?: unknown;
  };

  return (
    Number.isFinite(Number(candidato.lat)) &&
    Number.isFinite(Number(candidato.lng))
  );
}

function normalizarCoordenada(
  valor: unknown,
): CoordenadaCartografica | undefined {
  if (!coordenadaValida(valor)) {
    return undefined;
  }

  return {
    lat: Number(valor.lat),
    lng: Number(valor.lng),
  };
}

function normalizarListaCoordenadas(
  valor: unknown,
): CoordenadaCartografica[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .map((item) => normalizarCoordenada(item))
    .filter(
      (
        item,
      ): item is CoordenadaCartografica =>
        Boolean(item),
    );
}

function coordenadasGeoJson(
  valor: unknown,
): CoordenadaCartografica[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  const primeiro = valor[0];
  const anel =
    Array.isArray(primeiro) &&
    Array.isArray(primeiro[0])
      ? primeiro
      : valor;

  return anel
    .map((item) => {
      if (
        !Array.isArray(item) ||
        item.length < 2
      ) {
        return undefined;
      }

      const lng = Number(item[0]);
      const lat = Number(item[1]);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        return undefined;
      }

      return { lat, lng };
    })
    .filter(
      (
        item,
      ): item is CoordenadaCartografica =>
        Boolean(item),
    );
}

function obterCoordenadasTalhao(
  dados: Record<string, unknown>,
): CoordenadaCartografica[] {
  const diretas = normalizarListaCoordenadas(
    dados.coordenadas ?? dados.pontos,
  );

  if (diretas.length >= 3) {
    return diretas;
  }

  const geometria = dados.geometria as
    | {
        geometry?: { coordinates?: unknown };
        coordinates?: unknown;
      }
    | undefined;

  return coordenadasGeoJson(
    geometria?.geometry?.coordinates ??
      geometria?.coordinates,
  );
}

function calcularCentroide(
  pontos: CoordenadaCartografica[],
): CoordenadaCartografica | undefined {
  if (!pontos.length) {
    return undefined;
  }

  const soma = pontos.reduce(
    (acumulado, ponto) => ({
      lat: acumulado.lat + ponto.lat,
      lng: acumulado.lng + ponto.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: soma.lat / pontos.length,
    lng: soma.lng / pontos.length,
  };
}

export async function carregarCartografiaGlobal(): Promise<CartografiaGlobal> {
  const [fazendasSnapshot, talhoesSnapshot, ueisSnapshot] =
    await Promise.all([
      getDocs(collection(db, "fazendas")),
      getDocs(collection(db, "talhoes")),
      getDocs(collection(db, "ueis")),
    ]);

  const talhoes: TalhaoCartografico[] =
    talhoesSnapshot.docs.map((documento) => {
      const dados = documento.data();
      const coordenadas = obterCoordenadasTalhao(dados);

      return {
        id: documento.id,
        farmId: String(dados.farmId ?? ""),
        nome: String(dados.nome ?? "Talhão sem nome"),
        areaHa: Number(dados.areaHa ?? dados.area ?? 0),
        coordenadas,
        centroide:
          normalizarCoordenada(dados.centroide) ??
          calcularCentroide(coordenadas),
      };
    });

  const ueis: UEICartografica[] =
    ueisSnapshot.docs.map((documento) => {
      const dados = documento.data();
      const geometria = normalizarListaCoordenadas(
        dados.geometria,
      );

      return {
        id: documento.id,
        farmId: String(dados.farmId ?? ""),
        talhaoId: String(dados.talhaoId ?? ""),
        codigo: String(
          dados.codigo ?? dados.nome ?? documento.id,
        ),
        areaHa: Number(dados.areaHa ?? 0),
        geometria,
        centroide:
          normalizarCoordenada(dados.centroide) ??
          calcularCentroide(geometria),
        zonaTalhao:
          dados.zonaTalhao ===
          "faixa_avaliacao_bordadura"
            ? "faixa_avaliacao_bordadura"
            : "nucleo_produtivo",
      };
    });

  const fazendas: FazendaCartografica[] =
    fazendasSnapshot.docs.map((documento) => {
      const dados = documento.data();
      const talhoesDaFazenda = talhoes.filter(
        (talhao) => talhao.farmId === documento.id,
      );
      const centros = talhoesDaFazenda
        .map((talhao) => talhao.centroide)
        .filter(
          (
            centro,
          ): centro is CoordenadaCartografica =>
            Boolean(centro),
        );

      return {
        id: documento.id,
        nome: String(
          dados.nome ?? dados.name ?? "Fazenda sem nome",
        ),
        municipio:
          typeof dados.municipio === "string"
            ? dados.municipio
            : undefined,
        estado:
          typeof dados.estado === "string"
            ? dados.estado
            : undefined,
        centroide:
          normalizarCoordenada(
            dados.centroide ?? dados.location,
          ) ?? calcularCentroide(centros),
      };
    });

  return {
    fazendas: fazendas.sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR"),
    ),
    talhoes,
    ueis,
  };
}
