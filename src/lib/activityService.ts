import { addDoc, collection, doc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp, where, writeBatch } from 'firebase/firestore';
import { auth, db } from './firebase';
import { isAdminEmail } from './adminService';
import { clearActivityBatches, type ClickActivity } from './activityCapture';

export interface UserActivity extends ClickActivity {
  id: string;
  sessionId: string;
  signedIn: boolean;
  device: 'mobile' | 'desktop';
  createdAt: Timestamp | null;
}

type RecordingStatus = 'ready' | 'recording' | 'connected' | 'permission-denied' | 'unavailable';
let recordingStatus: RecordingStatus = 'ready';
const statusListeners = new Set<() => void>();
export const getRecordingStatus = () => recordingStatus;
export const getServerRecordingStatus = (): RecordingStatus => 'ready';
export function subscribeRecordingStatus(listener: () => void) {
  statusListeners.add(listener);
  return () => { statusListeners.delete(listener); };
}
function setRecordingStatus(status: RecordingStatus) {
  recordingStatus = status;
  statusListeners.forEach(listener => listener());
}

export async function recordActivity(activity: ClickActivity, sessionId: string): Promise<void> {
  setRecordingStatus('recording');
  try {
    // Wait for restored authentication so signedIn agrees with the Firestore token.
    await auth.authStateReady();
    await addDoc(collection(db, 'userActivities'), {
    ...activity,
    sessionId,
    signedIn: Boolean(auth.currentUser),
    device: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
    createdAt: serverTimestamp(),
    });
    setRecordingStatus('connected');
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : '';
    setRecordingStatus(code === 'permission-denied' ? 'permission-denied' : 'unavailable');
    throw error;
  }
}

export function subscribeToActivities(onData: (rows: UserActivity[]) => void, onError: (error: Error) => void, count = 100) {
  if (!isAdminEmail(auth.currentUser?.email)) {
    onError(new Error('Admin access required.'));
    return () => {};
  }
  return onSnapshot(query(collection(db, 'userActivities'), orderBy('createdAt', 'desc'), limit(count)),
    snapshot => onData(snapshot.docs.map(row => ({ ...row.data(), id: row.id } as UserActivity))), onError);
}

export async function clearAllActivities(): Promise<number> {
  if (!isAdminEmail(auth.currentUser?.email)) throw new Error('Admin access required.');
  const cutoff = Timestamp.now();
  return clearActivityBatches(async () => {
    const snapshot = await getDocs(query(collection(db, 'userActivities'), where('createdAt', '<=', cutoff), orderBy('createdAt'), limit(400)));
    return snapshot.docs.map(row => row.id);
  }, async ids => {
    const batch = writeBatch(db);
    ids.forEach(id => batch.delete(doc(db, 'userActivities', id)));
    await batch.commit();
  });
}