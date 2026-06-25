import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  query, 
  where, 
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

export interface IntegrityIssue {
  id: string;
  collection: string;
  issue: string;
  data: any;
  suggestedFix?: string;
}

export const migrationService = {
  async validateFarmConsistency(): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];
    const collectionsToCheck = [
      'talhoes',
      'ordens_servico',
      'execucoes_servico',
      'pluviometros',
      'chuvas_comunitarias',
      'checklist_templates',
      'checklist_respostas',
      'notificacoes_operacionais',
      'segmentos_execucao',
      'relatorios_execucao'
    ];

    // 1. Check Fazendas for producerId
    const fazendasSnap = await getDocs(collection(db, 'fazendas'));
    const fazendaIds = new Set(fazendasSnap.docs.map(d => d.id));
    
    fazendasSnap.docs.forEach(d => {
      const data = d.data();
      if (!data.producerId) {
        issues.push({
          id: d.id,
          collection: 'fazendas',
          issue: 'Missing producerId',
          data,
          suggestedFix: 'Link to an admin user'
        });
      }
    });

    // 2. Check Operational Entities for farmId
    for (const collName of collectionsToCheck) {
      const snap = await getDocs(collection(db, collName));
      snap.docs.forEach(d => {
        const data = d.data();
        if (!data.farmId) {
          issues.push({
            id: d.id,
            collection: collName,
            issue: 'Missing farmId',
            data
          });
        } else if (!fazendaIds.has(data.farmId)) {
          issues.push({
            id: d.id,
            collection: collName,
            issue: 'Invalid/Orphan farmId',
            data,
            suggestedFix: 'Reassign to an existing farm'
          });
        }
      });
    }

    // 3. Check Users without farms
    const usersSnap = await getDocs(collection(db, 'usuarios'));
    usersSnap.docs.forEach(d => {
      const data = d.data();
      if (data.role === 'admin' && !data.primaryFarmId) {
        // Find if they have at least one farm they own
        const ownedFarms = fazendasSnap.docs.filter(f => f.data().producerId === d.id);
        if (ownedFarms.length === 0) {
          issues.push({
            id: d.id,
            collection: 'usuarios',
            issue: 'Admin without any farms',
            data
          });
        } else {
          issues.push({
            id: d.id,
            collection: 'usuarios',
            issue: 'Admin without primaryFarmId set',
            data,
            suggestedFix: 'Set one of their farms as primary'
          });
        }
      } else if ((data.role === 'operador' || data.role === 'gerente') && !data.farmId) {
        issues.push({
          id: d.id,
          collection: 'usuarios',
          issue: 'Operator/Manager not assigned to any farmId',
          data
        });
      }
    });

    return issues;
  },

  async repairOrphanRecords(issues: IntegrityIssue[]): Promise<{ repaired: number; failed: number }> {
    let repaired = 0;
    let failed = 0;
    
    // Get all farms to check producer context
    const fazendasSnap = await getDocs(collection(db, 'fazendas'));
    const producerFarms: Record<string, string[]> = {};
    fazendasSnap.docs.forEach(d => {
      const pId = d.data().producerId;
      if (pId) {
        if (!producerFarms[pId]) producerFarms[pId] = [];
        producerFarms[pId].push(d.id);
      }
    });

    const batch = writeBatch(db);
    let batchCount = 0;

    for (const issue of issues) {
      try {
        let repairedThis = false;

        // Auto-fix: Missing farmId on operational entities
        // If we can identify the owner's farm
        if (issue.issue === 'Missing farmId' && issue.data.userId) {
          const ownerId = issue.data.userId;
          const userDoc = await getDocs(query(collection(db, 'usuarios'), where('id', '==', ownerId)));
          const userData = userDoc.docs[0]?.data();
          
          if (userData?.role === 'admin' && producerFarms[ownerId]?.length === 1) {
            batch.update(doc(db, issue.collection, issue.id), { 
              farmId: producerFarms[ownerId][0],
              updatedAt: serverTimestamp()
            });
            repairedThis = true;
          }
        }

        // Auto-fix: Admin missing primaryFarmId
        if (issue.collection === 'usuarios' && issue.issue === 'Admin without primaryFarmId set') {
          const farms = producerFarms[issue.id];
          if (farms && farms.length > 0) {
            batch.update(doc(db, 'usuarios', issue.id), { 
              primaryFarmId: farms[0],
              updatedAt: serverTimestamp()
            });
            repairedThis = true;
          }
        }

        if (repairedThis) {
          repaired++;
          batchCount++;
          if (batchCount >= 400) {
            await batch.commit();
            batchCount = 0;
          }
        }
      } catch (e) {
        console.error(`Failed to repair ${issue.id}:`, e);
        failed++;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    return { repaired, failed };
  },

  async runFarmMigration(): Promise<void> {
    console.log('Starting farm migration...');
    // Real logic would be here
  }
};
