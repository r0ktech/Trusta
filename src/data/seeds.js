// Seed content written to localStorage the first time the demo loads.
// All of it is sample data — no booking or message here involves a real person.

import { getArtisanById } from './artisans';
import { getCategory } from './categories';

const DAY = 1000 * 60 * 60 * 24;
const HOUR = 1000 * 60 * 60;

const isoDate = (offsetDays) => new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10);
const isoTime = (offsetMs) => new Date(Date.now() + offsetMs).toISOString();

export const TIME_WINDOWS = [
  'Morning (8 AM – 12 PM)',
  'Afternoon (12 PM – 4 PM)',
  'Evening (4 PM – 7 PM)',
  'Flexible — any time',
];

export const LOCAL_PROVIDER_ID = 'local-provider';

function customerBooking(id, artisanId, fields, status, history) {
  const artisan = getArtisanById(artisanId);
  return {
    id,
    artisanId,
    artisanName: artisan?.name ?? 'Unknown provider',
    artisanCategory: artisan?.category,
    customerName: 'You',
    origin: 'customer',
    isSample: true,
    reviewed: false,
    budget: null,
    notes: '',
    ...fields,
    status,
    history,
    createdAt: history[0].at,
    updatedAt: history[history.length - 1].at,
  };
}

export function createSeedBookings() {
  return [
    customerBooking(
      'bk-seed-1',
      'a10',
      {
        service: 'Screen replacement',
        description: 'Cracked screen on my Android phone after a fall. Touch still works on the top half only.',
        date: isoDate(-12),
        time: TIME_WINDOWS[1],
        address: 'Temp Site, Awka',
        budget: 25000,
      },
      'completed',
      [
        { status: 'pending', at: isoTime(-16 * DAY), note: 'Booking request sent' },
        { status: 'accepted', at: isoTime(-15 * DAY), note: 'Accepted by provider (simulated)' },
        { status: 'completed', at: isoTime(-12 * DAY + 3 * HOUR), note: 'Marked as completed' },
      ],
    ),
    customerBooking(
      'bk-seed-2',
      'a01',
      {
        service: 'Inverter & solar installation',
        description: 'Install a 3.5kVA inverter with two batteries for a 2-bedroom flat. Batteries already purchased.',
        date: isoDate(3),
        time: TIME_WINDOWS[0],
        address: 'Amawbia, Awka',
        budget: 60000,
      },
      'accepted',
      [
        { status: 'pending', at: isoTime(-2 * DAY), note: 'Booking request sent' },
        { status: 'accepted', at: isoTime(-1 * DAY), note: 'Accepted by provider (simulated)' },
      ],
    ),
    customerBooking(
      'bk-seed-3',
      'a06',
      {
        service: 'Deep cleaning',
        description: 'Move-in deep clean for a 3-bedroom flat, including kitchen cabinets and windows.',
        date: isoDate(8),
        time: TIME_WINDOWS[0],
        address: 'Ajah, Lagos',
        notes: 'Building has a gate man — please call on arrival.',
      },
      'pending',
      [{ status: 'pending', at: isoTime(-5 * HOUR), note: 'Booking request sent' }],
    ),
    customerBooking(
      'bk-seed-4',
      'a16',
      {
        service: 'Leak repairs',
        description: 'Water leaking from the ceiling below the upstairs bathroom.',
        date: isoDate(-28),
        time: TIME_WINDOWS[3],
        address: 'Nibo, Awka',
      },
      'cancelled',
      [
        { status: 'pending', at: isoTime(-31 * DAY), note: 'Booking request sent' },
        { status: 'cancelled', at: isoTime(-30 * DAY), note: 'Cancelled by you' },
      ],
    ),
  ].map((b) => (b.status === 'cancelled' ? { ...b, cancelledBy: 'customer' } : b));
}

// Sample requests added to a newly created provider profile so the dashboard
// has something to act on. Customers here are fictional.
export function createSampleProviderRequests(profile) {
  const services = profile.specialties?.length ? profile.specialties : [getCategory(profile.category)?.name ?? 'General service'];
  const area = profile.serviceAreas?.[0] || profile.city || 'your area';
  const s = (i) => services[i % services.length];
  const base = {
    artisanId: LOCAL_PROVIDER_ID,
    artisanName: profile.name,
    artisanCategory: profile.category,
    origin: 'sample-provider',
    isSample: true,
    reviewed: false,
    notes: '',
  };
  return [
    {
      ...base, id: 'pr-sample-1', customerName: 'Adaeze O. (sample)', service: s(0),
      description: 'Would like this done before the weekend if possible. Please let me know what materials I should buy.',
      date: isoDate(2), time: TIME_WINDOWS[0], address: area, budget: 20000, status: 'pending',
      history: [{ status: 'pending', at: isoTime(-3 * HOUR), note: 'Booking request received' }],
      createdAt: isoTime(-3 * HOUR), updatedAt: isoTime(-3 * HOUR),
    },
    {
      ...base, id: 'pr-sample-2', customerName: 'Tobi A. (sample)', service: s(1),
      description: 'Small office job. We are open Monday to Friday, access from 9am.',
      date: isoDate(5), time: TIME_WINDOWS[1], address: area, budget: null, status: 'pending',
      history: [{ status: 'pending', at: isoTime(-20 * HOUR), note: 'Booking request received' }],
      createdAt: isoTime(-20 * HOUR), updatedAt: isoTime(-20 * HOUR),
    },
    {
      ...base, id: 'pr-sample-3', customerName: 'Halima D. (sample)', service: s(2),
      description: 'Follow-up on a job another person started but did not finish.',
      date: isoDate(1), time: TIME_WINDOWS[2], address: area, budget: 35000, status: 'accepted',
      history: [
        { status: 'pending', at: isoTime(-2 * DAY), note: 'Booking request received' },
        { status: 'accepted', at: isoTime(-1 * DAY), note: 'You accepted this request' },
      ],
      createdAt: isoTime(-2 * DAY), updatedAt: isoTime(-1 * DAY),
    },
    {
      ...base, id: 'pr-sample-4', customerName: 'Uche I. (sample)', service: s(0),
      description: 'Routine job for a 2-bedroom flat.',
      date: isoDate(-6), time: TIME_WINDOWS[3], address: area, budget: 15000, status: 'completed',
      history: [
        { status: 'pending', at: isoTime(-10 * DAY), note: 'Booking request received' },
        { status: 'accepted', at: isoTime(-9 * DAY), note: 'You accepted this request' },
        { status: 'completed', at: isoTime(-6 * DAY), note: 'Marked as completed' },
      ],
      createdAt: isoTime(-10 * DAY), updatedAt: isoTime(-6 * DAY),
    },
  ];
}

export function createSeedConversations() {
  const convo = (id, artisanId, messages, unread = 0) => {
    const a = getArtisanById(artisanId);
    return {
      id,
      artisanId,
      participantName: a.name,
      participantCategory: a.category,
      isSample: true,
      unread,
      messages,
      updatedAt: messages[messages.length - 1].sentAt,
    };
  };
  return [
    convo(
      'cv-seed-1',
      'a01',
      [
        { id: 'm1', sender: 'me', text: 'Good afternoon. I booked you for the inverter installation. Do I need to buy any cables?', sentAt: isoTime(-26 * HOUR) },
        { id: 'm2', sender: 'them', text: 'Good afternoon. I will bring the cables and breakers. Just make sure the batteries are at the house.', sentAt: isoTime(-25 * HOUR) },
        { id: 'm3', sender: 'me', text: 'Perfect, they are already here. See you on the day.', sentAt: isoTime(-24 * HOUR) },
        { id: 'm4', sender: 'them', text: 'Alright. I will call when I get to Amawbia junction.', sentAt: isoTime(-2 * HOUR) },
      ],
      1,
    ),
    convo('cv-seed-2', 'a06', [
      { id: 'm1', sender: 'me', text: 'Hello, do you clean kitchen cabinets inside as well?', sentAt: isoTime(-6 * HOUR) },
      { id: 'm2', sender: 'them', text: 'Yes we do, inside and outside. Please empty them before we arrive so we can work faster.', sentAt: isoTime(-5 * HOUR) },
    ]),
    convo('cv-seed-3', 'a02', [
      { id: 'm1', sender: 'me', text: 'Hi, how long do you need for 8 aso-ebi outfits?', sentAt: isoTime(-4 * DAY) },
      { id: 'm2', sender: 'them', text: 'For 8 pieces I need about two weeks after measurement. Is the fabric ready?', sentAt: isoTime(-4 * DAY + HOUR) },
      { id: 'm3', sender: 'me', text: 'Not yet, I will let you know once we buy it.', sentAt: isoTime(-3 * DAY) },
    ]),
  ];
}

export const PROVIDER_NOTIFICATIONS_SEED = [
  { id: 'n1', title: 'New booking request', body: 'Adaeze O. (sample) requested a booking.', at: isoTime(-3 * HOUR), read: false, type: 'booking' },
  { id: 'n2', title: 'Complete your profile', body: 'Profiles with work samples are easier for customers to evaluate.', at: isoTime(-1 * DAY), read: false, type: 'tip' },
  { id: 'n3', title: 'Verification is coming', body: 'Identity and skills verification will be introduced in a future release.', at: isoTime(-2 * DAY), read: true, type: 'info' },
];

// A ready-made profile a visitor can load to explore the provider dashboard
// without filling in the registration form.
export const SAMPLE_PROVIDER_PROFILE = {
  name: 'Ada Nwankwo (sample)',
  phone: '08000000000', // placeholder, not a real line
  email: '',
  category: 'electrician',
  specialties: ['House wiring', 'Inverter installation', 'Fault diagnosis'],
  state: 'Anambra',
  city: 'Awka',
  serviceAreas: ['Ifite', 'Amawbia'],
  yearsOfExperience: 6,
  bio: 'Sample provider profile created for exploring the Trusta provider dashboard. Edit anything here — changes are saved only in this browser.',
  pricingType: 'fixed',
  startingPrice: 7000,
  priceUnit: 'inspection visit',
  contactPreference: 'in-app',
  profileImage: null,
  portfolio: [],
  services: [
    { id: 's1', name: 'Socket & switch repair', price: 5000, pricingType: 'fixed' },
    { id: 's2', name: 'Inverter installation', price: null, pricingType: 'quote' },
  ],
};
