import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch
} from 'firebase/firestore';

import { db, auth } from '../services/firebase';
import {
  HorimetroRegistro,
  PlanoManutencao
} from '../types';
import {
  handleFirestoreError,
  OperationType
} from '../utils/errorHandling';

function converterHorimetro(
  documentId: string,
  data: Record<string, any>
): HorimetroRegistro {
  return {
    id: documentId,
    ...data,
    dataRegistro: data.dataRegistro?.toDate
      ? data.dataRegistro.toDate()
      : new Date(),
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate()
      : data.createdAt
  } as unknown as HorimetroRegistro;
}

export function useHorimetros(
  farmId: string | null,
  maquinaId?: string
) {
  const [horimetros, setHorimetros] = useState<
    HorimetroRegistro[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setHorimetros([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const consultaPrincipal = maquinaId
      ? query(
          collection(db, 'horimetros'),
          where('farmId', '==', farmId),
          where('maquinaId', '==', maquinaId),
          orderBy('dataRegistro', 'desc')
        )
      : query(
          collection(db, 'horimetros'),
          where('farmId', '==', farmId),
          orderBy('dataRegistro', 'desc')
        );

    let unsubscribeFallback: (() => void) | null =
      null;

    const unsubscribePrincipal = onSnapshot(
      consultaPrincipal,
      snapshot => {
        const dados = snapshot.docs.map(documento =>
          converterHorimetro(
            documento.id,
            documento.data()
          )
        );

        setHorimetros(dados);
        setLoading(false);
      },
      error => {
        const indiceAusente = error.message
          .toLowerCase()
          .includes('index');

        if (!indiceAusente) {
          handleFirestoreError(
            error,
            OperationType.LIST,
            'horimetros'
          );
          setLoading(false);
          return;
        }

        console.warn(
          'Índice composto de horímetros ainda não disponível. Utilizando consulta simplificada.'
        );

        const consultaFallback = maquinaId
          ? query(
              collection(db, 'horimetros'),
              where('farmId', '==', farmId),
              where('maquinaId', '==', maquinaId)
            )
          : query(
              collection(db, 'horimetros'),
              where('farmId', '==', farmId)
            );

        unsubscribeFallback = onSnapshot(
          consultaFallback,
          snapshot => {
            const dados = snapshot.docs
              .map(documento =>
                converterHorimetro(
                  documento.id,
                  documento.data()
                )
              )
              .sort(
                (a, b) =>
                  b.dataRegistro.getTime() -
                  a.dataRegistro.getTime()
              );

            setHorimetros(dados);
            setLoading(false);
          },
          fallbackError => {
            handleFirestoreError(
              fallbackError,
              OperationType.LIST,
              'horimetros'
            );
            setLoading(false);
          }
        );
      }
    );

    return () => {
      unsubscribePrincipal();
      unsubscribeFallback?.();
    };
  }, [farmId, maquinaId]);

  const registrarHorimetro = async (
    dados: Omit<
      HorimetroRegistro,
      'id' | 'farmId' | 'producerId' | 'createdAt'
    >
  ) => {
    if (!farmId) {
      throw new Error(
        'A fazenda é obrigatória para registrar o horímetro.'
      );
    }

    if (!auth.currentUser) {
      throw new Error(
        'Usuário não autenticado para registrar o horímetro.'
      );
    }

    try {
      const batch = writeBatch(db);

      const novoRegistroRef = doc(
        collection(db, 'horimetros')
      );

      batch.set(novoRegistroRef, {
        id: novoRegistroRef.id,
        farmId,
        producerId: auth.currentUser.uid,
        ...dados,
        createdAt: serverTimestamp()
      });

      const equipamentoRef = doc(
        db,
        'equipamentos',
        dados.maquinaId
      );

      batch.update(equipamentoRef, {
        horimetroAtual: dados.horimetroAtual,
        ultimaAtualizacaoHorimetro:
          serverTimestamp()
      });

      await batch.commit();

      try {
        const consultaPlanos = query(
          collection(db, 'planos_manutencao'),
          where('farmId', '==', farmId),
          where(
            'equipamentoId',
            '==',
            dados.maquinaId
          ),
          where('ativo', '==', true)
        );

        const planosSnapshot = await getDocs(
          consultaPlanos
        );

        const planos = planosSnapshot.docs.map(
          documento => ({
            id: documento.id,
            ...documento.data()
          })
        ) as unknown as PlanoManutencao[];

        for (const plano of planos) {
          const horasRestantes =
            plano.proximaExecucaoHorimetro -
            dados.horimetroAtual;

          const percentualRestante =
            plano.intervaloHoras > 0
              ? (horasRestantes /
                  plano.intervaloHoras) *
                100
              : 0;

          const manutencaoVencida =
            horasRestantes <= 0;

          const manutencaoProxima =
            !manutencaoVencida &&
            percentualRestante <= 20;

          if (
            !manutencaoVencida &&
            !manutencaoProxima
          ) {
            continue;
          }

          const notificacaoRef = doc(
            collection(
              db,
              'notificacoes_operacionais'
            )
          );

          const mensagem = manutencaoVencida
            ? `A manutenção preventiva "${plano.tipoManutencao}" da máquina ${dados.maquinaNome} está vencida no horímetro ${dados.horimetroAtual}h.`
            : `A manutenção preventiva "${plano.tipoManutencao}" da máquina ${dados.maquinaNome} está próxima. Restam ${horasRestantes.toFixed(
                1
              )}h.`;

          await setDoc(notificacaoRef, {
            id: notificacaoRef.id,
            farmId,
            tipo: manutencaoVencida
              ? 'MANUTENCAO_VENCIDA'
              : 'MANUTENCAO_PROXIMA',
            titulo: manutencaoVencida
              ? 'Manutenção vencida'
              : 'Manutenção próxima',
            mensagem,
            severidade: manutencaoVencida
              ? 'critical'
              : 'warning',
            visualizada: false,
            createdAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.warn(
          'Não foi possível verificar os planos de manutenção:',
          error
        );
      }

      return novoRegistroRef.id;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        'horimetros'
      );

      throw error;
    }
  };

  return {
    horimetros,
    loading,
    registrarHorimetro
  };
}