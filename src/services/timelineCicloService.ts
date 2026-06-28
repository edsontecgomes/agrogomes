import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import {
  CategoriaTimelineCiclo,
  ItemTimelineCiclo,
} from "../types/timelineCiclo";
import { EventoAgronomico } from "../types/eventoAgronomico";

function classificarCategoriaTimeline(
  tipoEvento: EventoAgronomico["tipo"]
): CategoriaTimelineCiclo {
  if (
    tipoEvento === "criacao_ciclo" ||
    tipoEvento === "alteracao_ciclo"
  ) {
    return "estrutura";
  }

  if (
    tipoEvento === "criacao_plano_manejo" ||
    tipoEvento === "alteracao_plano_manejo"
  ) {
    return "planejamento";
  }

  if (
    tipoEvento === "plantio" ||
    tipoEvento === "emergencia" ||
    tipoEvento === "adubacao" ||
    tipoEvento === "pulverizacao" ||
    tipoEvento === "monitoramento" ||
    tipoEvento === "colheita"
  ) {
    return "execucao";
  }

  if (
    tipoEvento === "chuva" ||
    tipoEvento === "solo" ||
    tipoEvento === "clima" ||
    tipoEvento === "imagem"
  ) {
    return "ambiente";
  }

  if (
    tipoEvento === "produtividade" ||
    tipoEvento === "custo" ||
    tipoEvento === "receita"
  ) {
    return "resultado";
  }

  if (tipoEvento === "aprendizado") {
    return "inteligencia";
  }

  return "estrutura";
}

function deveDestacarEvento(tipoEvento: EventoAgronomico["tipo"]): boolean {
  return [
    "plantio",
    "emergencia",
    "chuva",
    "colheita",
    "produtividade",
    "aprendizado",
  ].includes(tipoEvento);
}

export async function criarItemTimelineAPartirDeEvento(
  evento: EventoAgronomico
): Promise<string> {
  const categoria = classificarCategoriaTimeline(evento.tipo);

  const ref = await addDoc(collection(db, "timelineCiclos"), {
    eventoAgronomicoId: evento.id,
    cicloAgronomicoId: evento.cicloAgronomicoId,
    memoriaAgronomicaId: evento.memoriaAgronomicaId ?? "",
    talhaoId: evento.talhaoId,
    categoria,
    tipoEvento: evento.tipo,
    titulo: evento.titulo,
    descricao: evento.descricao ?? "",
    dataEvento: evento.dataEvento,
    destaque: deveDestacarEvento(evento.tipo),
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listarTimelinePorCiclo(
  cicloAgronomicoId: string
): Promise<ItemTimelineCiclo[]> {
  const q = query(
    collection(db, "timelineCiclos"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId),
    orderBy("dataEvento", "asc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ItemTimelineCiclo[];
}

export async function listarTimelinePorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<ItemTimelineCiclo[]> {
  const q = query(
    collection(db, "timelineCiclos"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId),
    orderBy("dataEvento", "asc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ItemTimelineCiclo[];
}