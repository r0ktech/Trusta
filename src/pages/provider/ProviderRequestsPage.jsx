import { useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';
import { useBookings } from '../../context/BookingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { Notice } from '../../components/ui/Notice';
import { BookingCard } from '../../components/bookings/BookingCard';
import { RequestActions } from '../../components/provider/RequestActions';
import { ProviderRequestModal } from '../../components/provider/ProviderRequestModal';

const TABS = [
  ['pending', 'New'],
  ['accepted', 'Accepted'],
  ['completed', 'Completed'],
  ['cancelled', 'Declined / cancelled'],
  ['all', 'All'],
];

export default function ProviderRequestsPage() {
  useDocumentTitle('Booking requests');
  const { providerRequests } = useBookings();
  const [tab, setTab] = useState('pending');
  const [openId, setOpenId] = useState(null);

  const counts = useMemo(
    () => providerRequests.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] ?? 0) + 1 }), { all: providerRequests.length }),
    [providerRequests],
  );

  const list = providerRequests
    .filter((b) => tab === 'all' || b.status === tab)
    .sort((a, b) => (tab === 'pending' || tab === 'accepted' ? a.date.localeCompare(b.date) : b.updatedAt.localeCompare(a.updatedAt)));

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Booking requests</h1>
      <p className="mt-1 text-muted">Accept, decline and complete jobs from customers.</p>
      <Notice className="mt-5">
        Requests marked “Sample” were added so you can try the workflow. Requests you send to your own listing from its public profile also appear here.
      </Notice>

      <Tabs className="mt-6" label="Request status" value={tab} onChange={setTab} tabs={TABS.map(([value, label]) => ({ value, label, count: counts[value] ?? 0 }))} />

      <div className="mt-5 space-y-3">
        {list.length ? (
          list.map((b) => <BookingCard key={b.id} booking={b} perspective="provider" onOpen={(x) => setOpenId(x.id)} actions={<RequestActions booking={b} />} />)
        ) : (
          <EmptyState icon={Inbox} title="Nothing here" description="Requests with this status will show up here." />
        )}
      </div>

      <ProviderRequestModal booking={providerRequests.find((b) => b.id === openId) ?? null} onClose={() => setOpenId(null)} />
    </div>
  );
}
