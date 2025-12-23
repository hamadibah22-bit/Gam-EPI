
import { storageService } from './storageService';

// We simulate a remote database using a separate localStorage key
const REMOTE_KEY = 'epi_remote_db_mock';

export const syncService = {
  sync: async () => {
    if (!navigator.onLine) throw new Error('Cannot sync while offline');

    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    const localChildren = storageService.getChildren();
    const localRecords = storageService.getRecords();
    
    // Get "Remote" data
    const remoteData = JSON.parse(localStorage.getItem(REMOTE_KEY) || '{"children":[], "records":[]}');
    
    // Conflict Resolution: Latest Updated Wins
    const mergedChildren = [...remoteData.children];
    localChildren.forEach(local => {
      const remoteIdx = mergedChildren.findIndex(r => r.id === local.id);
      if (remoteIdx === -1) {
        mergedChildren.push(local);
      } else if (new Date(local.updatedAt) > new Date(mergedChildren[remoteIdx].updatedAt)) {
        mergedChildren[remoteIdx] = local;
      }
    });

    const mergedRecords = [...remoteData.records];
    localRecords.forEach(local => {
      const remoteIdx = mergedRecords.findIndex(r => r.id === local.id);
      if (remoteIdx === -1) {
        mergedRecords.push(local);
      } else if (new Date(local.updatedAt) > new Date(mergedRecords[remoteIdx].updatedAt)) {
        mergedRecords[remoteIdx] = local;
      }
    });

    // Save to both
    const syncedData = { children: mergedChildren, records: mergedRecords };
    localStorage.setItem(REMOTE_KEY, JSON.stringify(syncedData));
    localStorage.setItem('epi_app_children', JSON.stringify(mergedChildren));
    localStorage.setItem('epi_app_records', JSON.stringify(mergedRecords));
    storageService.setLastSync(new Date().toISOString());

    return syncedData;
  }
};
