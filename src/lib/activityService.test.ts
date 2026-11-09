import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  currentUser: null as null | { email: string },
  addDoc: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  ready: vi.fn(async () => {}),
}));
vi.mock('./firebase', () => ({ auth: { get currentUser() { return mocks.currentUser; }, authStateReady: mocks.ready }, db: {} }));
vi.mock('./adminService', () => ({ isAdminEmail: (email?: string) => email === 'lightstarrecord@gmail.com' }));
vi.mock('firebase/firestore', () => ({
  addDoc: mocks.addDoc, collection: (_db: unknown, name: string) => name,
  doc: vi.fn(), getDocs: vi.fn(), limit: vi.fn(), onSnapshot: mocks.onSnapshot,
  orderBy: vi.fn(), query: vi.fn(), serverTimestamp: () => 'server-time',
  Timestamp: { now: () => 'now' }, where: vi.fn(), writeBatch: vi.fn(),
}));
import { clearAllActivities, getRecordingStatus, recordActivity, subscribeToActivities } from './activityService';

beforeEach(() => {
  vi.clearAllMocks(); mocks.currentUser = null;
  mocks.addDoc.mockResolvedValue({});
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({ matches: true }) });
});

describe('activity persistence', () => {
  const activity = { action: 'Play', target: 'button', page: '/music', destination: '' };
  it('writes guest clicks immediately to userActivities with safe fields', async () => {
    await recordActivity(activity, '0bc245dd-d7c0-42b3-9b16-d733e6fda991');
    expect(mocks.ready).toHaveBeenCalledTimes(1);
    expect(mocks.addDoc).toHaveBeenCalledWith('userActivities', { ...activity, sessionId: '0bc245dd-d7c0-42b3-9b16-d733e6fda991', signedIn: false, device: 'mobile', createdAt: 'server-time' });
    expect(getRecordingStatus()).toBe('connected');
  });
  it('records member clicks as signed in', async () => {
    mocks.currentUser = { email: 'member@example.com' };
    await recordActivity(activity, '0bc245dd-d7c0-42b3-9b16-d733e6fda991');
    expect(mocks.addDoc.mock.calls[0][1].signedIn).toBe(true);
  });
  it('exposes Firestore permission failures rather than silent success', async () => {
    mocks.addDoc.mockRejectedValue({ code: 'permission-denied' });
    await expect(recordActivity(activity, '0bc245dd-d7c0-42b3-9b16-d733e6fda991')).rejects.toEqual({ code: 'permission-denied' });
    expect(getRecordingStatus()).toBe('permission-denied');
  });
  it('does not read activity records for a guest', () => {
    const onError = vi.fn();
    subscribeToActivities(vi.fn(), onError);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(mocks.onSnapshot).not.toHaveBeenCalled();
  });
  it('does not allow non-admin members to clear activities', async () => {
    mocks.currentUser = { email: 'member@example.com' };
    await expect(clearAllActivities()).rejects.toThrow('Admin access required.');
  });
  it('subscribes admins to real-time activity updates', () => {
    mocks.currentUser = { email: 'lightstarrecord@gmail.com' };
    subscribeToActivities(vi.fn(), vi.fn());
    expect(mocks.onSnapshot).toHaveBeenCalledTimes(1);
  });
});