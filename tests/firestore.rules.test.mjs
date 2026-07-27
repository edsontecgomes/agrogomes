import { readFile } from 'node:fs/promises';
import { after, before, beforeEach, describe, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';

const PROJECT_ID = 'agrogomes-cfa3f';
const FARM_A = 'fazenda-a';
const FARM_B = 'fazenda-b';
const OWNER_A = 'proprietario-a';
const OWNER_B = 'proprietario-b';
const MANAGER_A = 'gerente-a';
const OPERATOR_A = 'operador-a';
const OPERATOR_B = 'operador-b';

let testEnv;

function authenticatedDb(userId) {
  return testEnv.authenticatedContext(userId).firestore();
}

async function seedDatabase() {
  await testEnv.withSecurityRulesDisabled(async context => {
    const adminDb = context.firestore();
    const now = Timestamp.now();

    await Promise.all([
      setDoc(doc(adminDb, 'fazendas', FARM_A), {
        id: FARM_A,
        nome: 'Fazenda A',
        producerId: OWNER_A,
        createdAt: now
      }),
      setDoc(doc(adminDb, 'fazendas', FARM_B), {
        id: FARM_B,
        nome: 'Fazenda B',
        producerId: OWNER_B,
        createdAt: now
      }),
      setDoc(doc(adminDb, 'usuarios', MANAGER_A), {
        id: MANAGER_A,
        nome: 'Gerente A',
        role: 'gerente',
        farmId: FARM_A,
        createdAt: now
      }),
      setDoc(doc(adminDb, 'usuarios', OPERATOR_A), {
        id: OPERATOR_A,
        nome: 'Operador A',
        role: 'operador',
        farmId: FARM_A,
        createdAt: now
      }),
      setDoc(doc(adminDb, 'usuarios', OPERATOR_B), {
        id: OPERATOR_B,
        nome: 'Operador B',
        role: 'operador',
        farmId: FARM_B,
        createdAt: now
      }),
      setDoc(doc(adminDb, 'ordens_servico', 'ordem-a'), {
        id: 'ordem-a',
        farmId: FARM_A,
        titulo: 'Pulverização A',
        tipoOperacao: 'Pulverizacao',
        status: 'pendente',
        createdAt: now
      }),
      setDoc(doc(adminDb, 'execucoes_servico', 'execucao-a'), {
        id: 'execucao-a',
        farmId: FARM_A,
        ordemId: 'ordem-a',
        operadorId: OPERATOR_A,
        status: 'em_execucao',
        createdAt: now
      }),
      setDoc(doc(adminDb, 'execucoes_servico', 'execucao-b'), {
        id: 'execucao-b',
        farmId: FARM_B,
        ordemId: 'ordem-b',
        operadorId: OPERATOR_B,
        status: 'em_execucao',
        createdAt: now
      }),
      setDoc(doc(adminDb, 'talhoes', 'talhao-a'), {
        id: 'talhao-a',
        farmId: FARM_A,
        nome: 'Talhão A',
        area: 10,
        createdAt: now
      })
    ]);
  });
}

before(async () => {
  const rules = await readFile('firestore.rules', 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules
    }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await seedDatabase();
});

after(async () => {
  await testEnv?.cleanup();
});

describe('isolamento por fazenda', () => {
  test('nega leitura para usuário não autenticado', async () => {
    const anonymousDb = testEnv.unauthenticatedContext().firestore();

    await assertFails(
      getDoc(doc(anonymousDb, 'execucoes_servico', 'execucao-a'))
    );
  });

  test('permite leitura dentro da fazenda e nega leitura cruzada', async () => {
    const operatorDb = authenticatedDb(OPERATOR_A);

    await assertSucceeds(
      getDoc(doc(operatorDb, 'execucoes_servico', 'execucao-a'))
    );
    await assertFails(
      getDoc(doc(operatorDb, 'execucoes_servico', 'execucao-b'))
    );
  });

  test('exige farmId na consulta de execuções', async () => {
    const operatorDb = authenticatedDb(OPERATOR_A);
    const scopedQuery = query(
      collection(operatorDb, 'execucoes_servico'),
      where('farmId', '==', FARM_A)
    );

    await assertSucceeds(getDocs(scopedQuery));
    await assertFails(getDocs(collection(operatorDb, 'execucoes_servico')));
  });
});

describe('permissões operacionais', () => {
  test('operador cria execução própria somente na sua fazenda', async () => {
    const operatorDb = authenticatedDb(OPERATOR_A);
    const now = Timestamp.now();

    await assertSucceeds(
      setDoc(doc(operatorDb, 'execucoes_servico', 'execucao-propria'), {
        id: 'execucao-propria',
        farmId: FARM_A,
        ordemId: 'ordem-a',
        operadorId: OPERATOR_A,
        status: 'em_execucao',
        createdAt: now
      })
    );

    await assertFails(
      setDoc(doc(operatorDb, 'execucoes_servico', 'execucao-cruzada'), {
        id: 'execucao-cruzada',
        farmId: FARM_B,
        ordemId: 'ordem-b',
        operadorId: OPERATOR_A,
        status: 'em_execucao',
        createdAt: now
      })
    );
  });

  test('operador atualiza sua execução sem trocar o farmId', async () => {
    const operatorDb = authenticatedDb(OPERATOR_A);
    const executionRef = doc(
      operatorDb,
      'execucoes_servico',
      'execucao-a'
    );

    await assertSucceeds(
      updateDoc(executionRef, {
        status: 'finalizada',
        dataFim: Timestamp.now()
      })
    );

    await assertFails(updateDoc(executionRef, { farmId: FARM_B }));
  });

  test('operador altera somente o status da ordem', async () => {
    const operatorDb = authenticatedDb(OPERATOR_A);
    const orderRef = doc(operatorDb, 'ordens_servico', 'ordem-a');

    await assertSucceeds(
      updateDoc(orderRef, { status: 'em_execucao' })
    );
    await assertFails(
      updateDoc(orderRef, { titulo: 'Título alterado indevidamente' })
    );
  });

  test('somente gestor cria estrutura gerenciada', async () => {
    const operatorDb = authenticatedDb(OPERATOR_A);
    const managerDb = authenticatedDb(MANAGER_A);
    const now = Timestamp.now();

    await assertFails(
      setDoc(doc(operatorDb, 'talhoes', 'talhao-operador'), {
        id: 'talhao-operador',
        farmId: FARM_A,
        nome: 'Talhão do operador',
        area: 5,
        createdAt: now
      })
    );

    await assertSucceeds(
      setDoc(doc(managerDb, 'talhoes', 'talhao-gestor'), {
        id: 'talhao-gestor',
        farmId: FARM_A,
        nome: 'Talhão do gestor',
        area: 5,
        createdAt: now
      })
    );
  });
});

describe('pluviometria operacional', () => {
  test('permite criar pluviômetro e chuva somente na própria fazenda', async () => {
    const operatorDb = authenticatedDb(OPERATOR_A);
    const now = Timestamp.now();

    await assertSucceeds(
      setDoc(doc(operatorDb, 'pluviometros', 'pluv-a'), {
        nome: 'Pluviômetro A',
        farmId: FARM_A,
        location: {
          lat: -2.5,
          lng: -54.7,
          accuracy: 4
        },
        createdAt: now
      })
    );

    const chuvaData = {
      mm: 15.5,
      farmId: FARM_A,
      userId: OPERATOR_A,
      pluviometroId: 'pluv-a',
      location: {
        lat: -2.5,
        lng: -54.7,
        accuracy: 4
      },
      source: 'manual',
      timestamp: now,
      createdAt: now
    };

    const batch = writeBatch(operatorDb);

    batch.set(
      doc(operatorDb, 'chuvas_comunitarias', 'chuva-a'),
      chuvaData
    );

    batch.set(
      doc(operatorDb, 'registros_pessoais', 'registro-a'),
      {
        ...chuvaData,
        month: 7,
        year: 2026
      }
    );

    await assertSucceeds(batch.commit());

    await assertFails(
      setDoc(doc(operatorDb, 'pluviometros', 'pluv-cruzado'), {
        nome: 'Pluviômetro inválido',
        farmId: FARM_B,
        location: {
          lat: -2.5,
          lng: -54.7
        },
        createdAt: now
      })
    );
  });
});

describe('aceite atômico de convite', () => {
  test('aceita uma vez e rejeita reutilização do token', async () => {
    const token = 'convite-operador-a';
    const invitedUserId = 'novo-operador-a';
    const secondUserId = 'segundo-operador-a';

    await testEnv.withSecurityRulesDisabled(async context => {
      const adminDb = context.firestore();

      await setDoc(doc(adminDb, 'convites', token), {
        token,
        farmId: FARM_A,
        role: 'operador',
        createdBy: MANAGER_A,
        used: false,
        expiresAt: Timestamp.fromMillis(Date.now() + 60 * 60 * 1000),
        createdAt: Timestamp.now()
      });
    });

    const invitedDb = authenticatedDb(invitedUserId);
    const acceptanceBatch = writeBatch(invitedDb);

    acceptanceBatch.set(doc(invitedDb, 'usuarios', invitedUserId), {
      id: invitedUserId,
      nome: 'Novo operador',
      email: 'novo.operador@example.com',
      role: 'operador',
      farmId: FARM_A,
      conviteId: token,
      createdAt: Timestamp.now()
    });

    acceptanceBatch.update(doc(invitedDb, 'convites', token), {
      used: true,
      usedBy: invitedUserId,
      usedAt: Timestamp.now()
    });

    await assertSucceeds(acceptanceBatch.commit());

    const secondDb = authenticatedDb(secondUserId);
    const reuseBatch = writeBatch(secondDb);

    reuseBatch.set(doc(secondDb, 'usuarios', secondUserId), {
      id: secondUserId,
      nome: 'Segundo operador',
      email: 'segundo.operador@example.com',
      role: 'operador',
      farmId: FARM_A,
      conviteId: token,
      createdAt: Timestamp.now()
    });

    reuseBatch.update(doc(secondDb, 'convites', token), {
      used: true,
      usedBy: secondUserId,
      usedAt: Timestamp.now()
    });

    await assertFails(reuseBatch.commit());
  });
});
