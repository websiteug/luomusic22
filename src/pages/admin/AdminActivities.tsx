import { useEffect, useState, useSyncExternalStore } from 'react';
import { Activity, Loader2, Trash2, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { clearAllActivities, subscribeToActivities, subscribeRecordingStatus, getRecordingStatus, getServerRecordingStatus, type UserActivity } from '@/lib/activityService';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from '@/hooks/use-toast';

function ActivitiesContent() {
  const [rows, setRows] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [count, setCount] = useState(100);
  const [attempt, setAttempt] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const recordingStatus = useSyncExternalStore(subscribeRecordingStatus, getRecordingStatus, getServerRecordingStatus);

  useEffect(() => {
    setLoading(true);
    setError('');
    return subscribeToActivities(data => { setRows(data); setLoading(false); }, () => {
      setError('Activity records are unavailable. Check that activity access rules have been enabled.');
      setLoading(false);
    }, count);
  }, [count, attempt]);

  async function handleClear() {
    setClearing(true);
    try {
      await clearAllActivities();
      setConfirmOpen(false);
      toast({ title: 'Activities cleared' });
    } catch {
      toast({ title: 'Could not clear activities', description: 'Check your connection and activity access permissions, then try again.', variant: 'destructive' });
    } finally { setClearing(false); }
  }

  return (
    <section className="space-y-6 min-w-0">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3"><Activity className="size-7 text-primary shrink-0" />User Activities</h1>
        <Button variant="destructive" className="gap-2" onClick={() => setConfirmOpen(true)} disabled={loading || Boolean(error) || clearing || rows.length === 0}>
          {clearing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}Clear All Activities
        </Button>
      </header>
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>{rows.length} recent clicks</span><span>{new Set(rows.map(row => row.sessionId)).size} visits</span>
        <span className={recordingStatus === 'permission-denied' || recordingStatus === 'unavailable' ? 'text-destructive' : ''} role="status">
          {recordingStatus === 'permission-denied' ? 'Recording blocked by Firestore rules' : recordingStatus === 'unavailable' ? 'Recording failed — check connection' : recordingStatus === 'connected' ? 'Latest click saved' : recordingStatus === 'recording' ? 'Saving clicks…' : 'Waiting for clicks'}
        </span>
      </div>
      {error ? <div role="alert" className="space-y-3 text-destructive"><p>{error}</p><Button variant="outline" onClick={() => setAttempt(value => value + 1)} className="gap-2"><RefreshCw className="size-4" />Retry</Button></div> : (
        <>
          <div className="md:hidden space-y-3">
            {loading && rows.length === 0 ? <Loader2 className="size-5 animate-spin mx-auto" /> : rows.length === 0 ? <p className="text-muted-foreground py-8 text-center">No activities yet</p> : rows.map(row => (
              <article key={row.id} className="bg-card border border-border rounded-lg p-4 space-y-2 min-w-0">
                <div className="flex items-start justify-between gap-3"><strong className="break-words">{row.action}</strong><span className="text-xs text-muted-foreground capitalize shrink-0">{row.device}</span></div>
                <p className="text-xs text-muted-foreground">{row.createdAt?.toDate().toLocaleString() ?? 'Just now'}</p>
                <dl className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-2 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Visitor</dt><dd>{row.signedIn ? 'Member' : 'Guest'} · {row.sessionId.slice(0, 8)}</dd>
                  <dt className="text-muted-foreground">Page</dt><dd className="break-all">{row.page}</dd>
                  {row.destination && <><dt className="text-muted-foreground">Destination</dt><dd className="break-all">{row.destination}</dd></>}
                </dl>
              </article>
            ))}
          </div>
          <div className="hidden md:block">
          <Table>
            <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Visitor</TableHead><TableHead>Activity</TableHead><TableHead>Page</TableHead><TableHead>Destination</TableHead><TableHead>Device</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading && rows.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="size-5 animate-spin mx-auto" /></TableCell></TableRow> : rows.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No activities yet</TableCell></TableRow> : rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap">{row.createdAt?.toDate().toLocaleString() ?? 'Just now'}</TableCell>
                  <TableCell className="whitespace-nowrap"><span>{row.signedIn ? 'Member' : 'Guest'}</span><span className="block font-mono text-xs text-muted-foreground">{row.sessionId.slice(0, 8)}</span></TableCell>
                  <TableCell>{row.action}</TableCell><TableCell className="whitespace-nowrap">{row.page}</TableCell><TableCell>{row.destination || '—'}</TableCell><TableCell className="capitalize">{row.device}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          {rows.length >= count && <Button variant="outline" disabled={loading} onClick={() => setCount(value => value + 100)}>Load older activities</Button>}
        </>
      )}
      <AlertDialog open={confirmOpen} onOpenChange={open => { if (!clearing) setConfirmOpen(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Clear all activities?</AlertDialogTitle><AlertDialogDescription>All existing activity records will be permanently deleted for everyone. New clicks will continue to be recorded. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel><Button variant="destructive" disabled={clearing} onClick={handleClear}>{clearing ? 'Clearing…' : 'Clear All Activities'}</Button></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export default function AdminActivities() {
  const { isAdmin, loading } = useAdmin();
  return <AdminLayout>{!loading && isAdmin ? <ActivitiesContent /> : null}</AdminLayout>;
}