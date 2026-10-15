// DEMO DATA — every provider below is fictional. Names, reviews, prices and
// verification states exist only to demonstrate the interface and must never
// be presented as real people or genuine verification.
//
// The shape of each record mirrors what a future API is expected to return,
// so this module can be swapped for a fetch call later.

import {
  REVIEWER_NAMES,
  POSITIVE_GENERIC,
  MIXED_GENERIC,
  NEGATIVE_GENERIC,
  CATEGORY_REVIEWS,
  PORTFOLIO_TITLES,
} from './reviewPool.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const MON_SAT = [...WEEKDAYS, 'Sat'];
const ALL_WEEK = [...MON_SAT, 'Sun'];

const BASE = [
  {
    id: 'a01', name: 'Chinedu Okafor', category: 'electrician', city: 'Awka', state: 'Anambra',
    serviceAreas: ['Amawbia', 'Ifite', 'Okpuno', 'Temp Site'],
    specialties: ['House wiring', 'Inverter & solar installation', 'Fault diagnosis', 'Distribution board upgrades'],
    bio: 'Licensed-trade electrician focused on safe residential wiring and backup power. I explain the fault before quoting and label every breaker I touch so you can manage your load confidently.',
    yearsOfExperience: 9, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 8000, priceUnit: 'inspection visit',
    availability: { status: 'available', days: MON_SAT, hours: '8:00 AM – 6:00 PM' },
    contactPreference: 'phone', languages: ['English', 'Igbo', 'Pidgin'], joinedAt: '2025-11-02', quality: 0.82, reviewTotal: 18,
  },
  {
    id: 'a02', name: 'Ngozi Eze', category: 'tailor', city: 'Enugu', state: 'Enugu',
    serviceAreas: ['Independence Layout', 'New Haven', 'GRA Enugu'],
    specialties: ['Native attire', 'Aso-ebi & family sets', 'Bridal gowns', 'Alterations'],
    bio: 'Fashion designer with a small studio in New Haven. I specialise in aso-ebi orders and native wear, with fittings done at the studio or at your home within Enugu.',
    yearsOfExperience: 12, verificationStatus: 'verified', pricingType: 'quote', startingPrice: null,
    availability: { status: 'available', days: MON_SAT, hours: '9:00 AM – 7:00 PM' },
    contactPreference: 'whatsapp', languages: ['English', 'Igbo'], joinedAt: '2025-08-19', quality: 0.86, reviewTotal: 22,
  },
  {
    id: 'a03', name: 'Tunde Adebayo', category: 'plumber', city: 'Lagos', state: 'Lagos',
    serviceAreas: ['Surulere', 'Yaba', 'Ikeja', 'Gbagada'],
    specialties: ['Leak repairs', 'Borehole pumps', 'Water heaters', 'Bathroom fittings'],
    bio: 'Mainland plumber handling everything from dripping taps to full bathroom refits. I carry common fittings on my bike so most small jobs are done in one visit.',
    yearsOfExperience: 7, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 10000, priceUnit: 'call-out',
    availability: { status: 'available', days: ALL_WEEK, hours: '7:00 AM – 7:00 PM' },
    contactPreference: 'phone', languages: ['English', 'Yoruba', 'Pidgin'], joinedAt: '2025-09-30', quality: 0.74, reviewTotal: 16,
  },
  {
    id: 'a04', name: 'Aisha Bello', category: 'makeup', city: 'Abuja', state: 'FCT',
    serviceAreas: ['Wuse', 'Maitama', 'Jabi', 'Gwarinpa'],
    specialties: ['Bridal makeup', 'Gele tying', 'Photoshoot glam', 'Bridal party packages'],
    bio: 'Makeup artist for weddings, shoots and special occasions. I work with long-wear products suited to our heat and travel to venues across central Abuja.',
    yearsOfExperience: 6, verificationStatus: 'pending', pricingType: 'fixed', startingPrice: 25000, priceUnit: 'per look',
    availability: { status: 'busy', days: ['Thu', 'Fri', 'Sat', 'Sun'], hours: '6:00 AM – 4:00 PM' },
    contactPreference: 'in-app', languages: ['English', 'Hausa'], joinedAt: '2026-07-11', quality: 0.8, reviewTotal: 11,
  },
  {
    id: 'a05', name: 'Emeka Nwosu', category: 'mechanic', city: 'Onitsha', state: 'Anambra',
    serviceAreas: ['Fegge', 'GRA Onitsha', 'Inland Town', '3-3'],
    specialties: ['Engine diagnostics', 'Toyota & Honda specialist', 'Brakes & suspension', 'Gearbox repair'],
    bio: 'Running a roadside-to-workshop service for 15 years. I use a diagnostic scanner before touching your engine, and I return replaced parts so you can see what was changed.',
    yearsOfExperience: 15, verificationStatus: 'verified', pricingType: 'quote', startingPrice: null,
    availability: { status: 'available', days: MON_SAT, hours: '8:00 AM – 6:30 PM' },
    contactPreference: 'phone', languages: ['English', 'Igbo', 'Pidgin'], joinedAt: '2025-06-04', quality: 0.7, reviewTotal: 24,
  },
  {
    id: 'a06', name: 'Folake Adeyemi', category: 'cleaner', city: 'Lagos', state: 'Lagos',
    serviceAreas: ['Lekki', 'Ajah', 'Ikoyi'],
    specialties: ['Deep cleaning', 'Post-construction cleaning', 'Weekly home cleaning', 'Upholstery cleaning'],
    bio: 'I lead a three-person cleaning team serving the Lekki–Ajah axis. We bring our own equipment and supplies, and every booking ends with a walk-through so you can point out anything we missed.',
    yearsOfExperience: 5, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 20000, priceUnit: '2-bedroom flat',
    availability: { status: 'available', days: MON_SAT, hours: '8:00 AM – 5:00 PM' },
    contactPreference: 'whatsapp', languages: ['English', 'Yoruba'], joinedAt: '2026-02-14', quality: 0.84, reviewTotal: 19,
  },
  {
    id: 'a07', name: 'Ifeanyi Obi', category: 'ac-technician', city: 'Enugu', state: 'Enugu',
    serviceAreas: ['Trans-Ekulu', 'Abakpa', 'Independence Layout'],
    specialties: ['Split unit installation', 'Gas refill', 'AC servicing', 'Leak detection'],
    bio: 'Refrigeration and air-conditioning technician. I check for leaks before refilling gas, so you are not paying for the same refill every few months.',
    yearsOfExperience: 8, verificationStatus: 'unverified', pricingType: 'fixed', startingPrice: 12000, priceUnit: 'per unit service',
    availability: { status: 'available', days: MON_SAT, hours: '9:00 AM – 6:00 PM' },
    contactPreference: 'phone', languages: ['English', 'Igbo'], joinedAt: '2026-08-21', quality: 0.66, reviewTotal: 9,
  },
  {
    id: 'a08', name: 'Musa Ibrahim', category: 'carpenter', city: 'Abuja', state: 'FCT',
    serviceAreas: ['Kubwa', 'Gwarinpa', 'Lugbe'],
    specialties: ['Built-in wardrobes', 'Kitchen cabinets', 'Custom furniture', 'Door installation'],
    bio: 'Furniture maker and site carpenter. I work mostly with treated hardwood and marine board, and share drawings for approval before cutting anything.',
    yearsOfExperience: 14, verificationStatus: 'verified', pricingType: 'quote', startingPrice: null,
    availability: { status: 'busy', days: WEEKDAYS, hours: '8:00 AM – 5:00 PM' },
    contactPreference: 'in-app', languages: ['English', 'Hausa', 'Pidgin'], joinedAt: '2025-10-08', quality: 0.78, reviewTotal: 15,
  },
  {
    id: 'a09', name: 'Chiamaka Okeke', category: 'hair', city: 'Awka', state: 'Anambra',
    serviceAreas: ['Ifite', 'Temp Site', 'Okpuno'],
    specialties: ['Knotless braids', 'Natural hair care', 'Wig installation', 'Home service'],
    bio: 'Hairstylist close to the university area. Gentle on edges, quick on braids, and available for home service on weekends.',
    yearsOfExperience: 4, verificationStatus: 'pending', pricingType: 'fixed', startingPrice: 5000, priceUnit: 'from',
    availability: { status: 'available', days: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], hours: '10:00 AM – 8:00 PM' },
    contactPreference: 'whatsapp', languages: ['English', 'Igbo'], joinedAt: '2026-09-02', quality: 0.8, reviewTotal: 8,
  },
  {
    id: 'a10', name: 'Kelechi Umeh', category: 'phone-repair', city: 'Awka', state: 'Anambra',
    serviceAreas: ['Temp Site', 'Ifite', 'Amawbia'],
    specialties: ['Screen replacement', 'Charging port repair', 'Laptop upgrades', 'Software issues'],
    bio: 'Phone and laptop repair technician. Most screen and battery jobs are finished the same day, and I test every function with you before you leave.',
    yearsOfExperience: 6, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 3000, priceUnit: 'diagnosis',
    availability: { status: 'available', days: MON_SAT, hours: '9:00 AM – 7:00 PM' },
    contactPreference: 'in-app', languages: ['English', 'Igbo', 'Pidgin'], joinedAt: '2026-03-17', quality: 0.77, reviewTotal: 21,
  },
  {
    id: 'a11', name: 'Babatunde Ogunleye', category: 'painter', city: 'Lagos', state: 'Lagos',
    serviceAreas: ['Ikeja', 'Magodo', 'Gbagada', 'Ikorodu'],
    specialties: ['Interior painting', 'Screeding', 'Texcote exterior finish', 'POP finishing'],
    bio: 'Painter and finishing contractor. I can recommend paint brands for your budget and handle screeding so the final coat goes on smooth.',
    yearsOfExperience: 11, verificationStatus: 'unverified', pricingType: 'quote', startingPrice: null,
    availability: { status: 'available', days: MON_SAT, hours: '7:30 AM – 5:30 PM' },
    contactPreference: 'phone', languages: ['English', 'Yoruba'], joinedAt: '2025-12-12', quality: 0.68, reviewTotal: 12,
  },
  {
    id: 'a12', name: 'Uchenna Agu', category: 'tiler', city: 'Enugu', state: 'Enugu',
    serviceAreas: ['GRA Enugu', 'Achara Layout', 'Uwani', 'New Haven'],
    specialties: ['Floor tiling', 'Bathroom renovation', 'Interlocking', 'Staircase tiling'],
    bio: 'Tiler and finishing mason. I check the floor level before laying so your tiles do not crack or lift later.',
    yearsOfExperience: 10, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 2500, priceUnit: 'per m²',
    availability: { status: 'available', days: MON_SAT, hours: '7:00 AM – 6:00 PM' },
    contactPreference: 'phone', languages: ['English', 'Igbo'], joinedAt: '2025-07-23', quality: 0.79, reviewTotal: 14,
  },
  {
    id: 'a13', name: 'Hauwa Suleiman', category: 'caterer', city: 'Abuja', state: 'FCT',
    serviceAreas: ['Garki', 'Wuse', 'Maitama', 'Jabi'],
    specialties: ['Party jollof', 'Small chops', 'Northern dishes', 'Corporate lunches'],
    bio: 'Event caterer serving weddings, naming ceremonies and office events. Tastings available for orders above 100 guests.',
    yearsOfExperience: 9, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 150000, priceUnit: 'per 50 guests',
    availability: { status: 'available', days: ALL_WEEK, hours: 'By appointment' },
    contactPreference: 'whatsapp', languages: ['English', 'Hausa'], joinedAt: '2026-01-09', quality: 0.85, reviewTotal: 17,
  },
  {
    id: 'a14', name: 'Obinna Chukwu', category: 'appliance-repair', city: 'Nnewi', state: 'Anambra',
    serviceAreas: ['Otolo', 'Uruagu', 'Umudim', 'Nnewichi'],
    specialties: ['Fridge & freezer repair', 'Washing machines', 'Generator servicing', 'TV repair'],
    bio: 'Appliance technician with a workshop in Otolo. I repair rather than replace wherever it makes sense, and I quote before ordering any parts.',
    yearsOfExperience: 13, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 5000, priceUnit: 'inspection',
    availability: { status: 'available', days: MON_SAT, hours: '8:00 AM – 6:00 PM' },
    contactPreference: 'phone', languages: ['English', 'Igbo', 'Pidgin'], joinedAt: '2025-05-27', quality: 0.75, reviewTotal: 20,
  },
  {
    id: 'a15', name: 'Damilola Ojo', category: 'electrician', city: 'Lagos', state: 'Lagos',
    serviceAreas: ['Ikeja', 'Gbagada', 'Magodo', 'Yaba'],
    specialties: ['Solar installation', 'Smart meters', 'Lighting design', 'Fault diagnosis'],
    bio: 'Electrician with a focus on solar and energy-saving setups. Happy to size a system to your actual daily usage instead of guessing.',
    yearsOfExperience: 5, verificationStatus: 'pending', pricingType: 'hourly', startingPrice: 6000, priceUnit: 'per hour',
    availability: { status: 'available', days: WEEKDAYS, hours: '9:00 AM – 6:00 PM' },
    contactPreference: 'in-app', languages: ['English', 'Yoruba'], joinedAt: '2026-08-30', quality: 0.72, reviewTotal: 7,
  },
  {
    id: 'a16', name: 'Chidi Anozie', category: 'plumber', city: 'Awka', state: 'Anambra',
    serviceAreas: ['Amawbia', 'Nibo', 'Agu-Awka', 'Umuokpu'],
    specialties: ['Leak repairs', 'Overhead tank connection', 'Toilet & WC repair', 'Drainage'],
    bio: 'Plumber covering Awka and nearby communities. Good with older buildings where pipes have been patched many times.',
    yearsOfExperience: 10, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 7000, priceUnit: 'call-out',
    availability: { status: 'available', days: MON_SAT, hours: '7:30 AM – 6:00 PM' },
    contactPreference: 'phone', languages: ['English', 'Igbo'], joinedAt: '2025-09-12', quality: 0.76, reviewTotal: 13,
  },
  {
    id: 'a17', name: 'Blessing Etim', category: 'cleaner', city: 'Abuja', state: 'FCT',
    serviceAreas: ['Garki', 'Wuse', 'Lugbe'],
    specialties: ['Home cleaning', 'Office cleaning', 'Laundry & ironing', 'Move-out cleaning'],
    bio: 'Independent cleaner offering hourly home and small-office cleaning. Flexible with weekend schedules.',
    yearsOfExperience: 3, verificationStatus: 'unverified', pricingType: 'hourly', startingPrice: 3500, priceUnit: 'per hour',
    availability: { status: 'available', days: ALL_WEEK, hours: '8:00 AM – 6:00 PM' },
    contactPreference: 'whatsapp', languages: ['English', 'Efik', 'Pidgin'], joinedAt: '2026-09-25', quality: 0.7, reviewTotal: 6,
  },
  {
    id: 'a18', name: 'Ikenna Okonkwo', category: 'mechanic', city: 'Enugu', state: 'Enugu',
    serviceAreas: ['Abakpa', 'Trans-Ekulu', 'New Haven'],
    specialties: ['Full car service', 'Brake systems', 'AC (car) repair', 'Electrical faults'],
    bio: 'Auto technician with a covered workshop in Abakpa. Mobile service available for battery, brake and minor electrical jobs.',
    yearsOfExperience: 9, verificationStatus: 'verified', pricingType: 'quote', startingPrice: null,
    availability: { status: 'unavailable', days: MON_SAT, hours: '8:00 AM – 6:00 PM', note: 'Fully booked until next week' },
    contactPreference: 'phone', languages: ['English', 'Igbo'], joinedAt: '2025-11-28', quality: 0.73, reviewTotal: 16,
  },
  {
    id: 'a19', name: 'Yetunde Bakare', category: 'tailor', city: 'Lagos', state: 'Lagos',
    serviceAreas: ['Surulere', 'Yaba', 'Ikeja'],
    specialties: ['Corporate wear', 'Kaftans', 'Alterations', 'Ready-to-wear'],
    bio: 'Tailor focused on clean corporate wear and men’s kaftans. Express alterations available within 48 hours.',
    yearsOfExperience: 8, verificationStatus: 'verified', pricingType: 'quote', startingPrice: null,
    availability: { status: 'available', days: MON_SAT, hours: '9:00 AM – 6:00 PM' },
    contactPreference: 'in-app', languages: ['English', 'Yoruba'], joinedAt: '2026-04-03', quality: 0.81, reviewTotal: 14,
  },
  {
    id: 'a20', name: 'Samuel Okoro', category: 'carpenter', city: 'Awka', state: 'Anambra',
    serviceAreas: ['Amawbia', 'Okpuno', 'Ifite', 'Nibo'],
    specialties: ['Roofing', 'Doors & windows', 'Kitchen cabinets', 'Furniture repair'],
    bio: 'Carpenter with nearly two decades of roofing and joinery experience. I also train apprentices, so larger jobs can be finished quickly.',
    yearsOfExperience: 18, verificationStatus: 'verified', pricingType: 'quote', startingPrice: null,
    availability: { status: 'available', days: MON_SAT, hours: '7:00 AM – 6:00 PM' },
    contactPreference: 'phone', languages: ['English', 'Igbo'], joinedAt: '2025-06-18', quality: 0.83, reviewTotal: 23,
  },
  {
    id: 'a21', name: 'Adaobi Nnaji', category: 'makeup', city: 'Enugu', state: 'Enugu',
    serviceAreas: ['Independence Layout', 'GRA Enugu', 'New Haven'],
    specialties: ['Bridal makeup', 'Soft glam', 'Gele tying', 'Makeup classes'],
    bio: 'Soft-glam specialist for brides and celebrants. I keep a strict hygiene routine and bring a lighting kit for early morning sessions.',
    yearsOfExperience: 5, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 20000, priceUnit: 'per look',
    availability: { status: 'available', days: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'], hours: '6:00 AM – 6:00 PM' },
    contactPreference: 'whatsapp', languages: ['English', 'Igbo'], joinedAt: '2026-05-21', quality: 0.86, reviewTotal: 12,
  },
  {
    id: 'a22', name: 'Abdullahi Yusuf', category: 'ac-technician', city: 'Abuja', state: 'FCT',
    serviceAreas: ['Gwarinpa', 'Kubwa', 'Jabi', 'Wuse'],
    specialties: ['Split unit installation', 'Inverter AC', 'Gas refill', 'Commercial AC maintenance'],
    bio: 'AC technician for homes and small offices. Offers quarterly maintenance plans so your units do not break down in the hot season.',
    yearsOfExperience: 7, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 15000, priceUnit: 'per unit service',
    availability: { status: 'available', days: MON_SAT, hours: '8:00 AM – 6:00 PM' },
    contactPreference: 'phone', languages: ['English', 'Hausa'], joinedAt: '2026-06-06', quality: 0.77, reviewTotal: 13,
  },
  {
    id: 'a23', name: 'Ebuka Mbah', category: 'phone-repair', city: 'Enugu', state: 'Enugu',
    serviceAreas: ['Uwani', 'Achara Layout', 'GRA Enugu'],
    specialties: ['Laptop repair', 'Windows & macOS setup', 'Screen replacement', 'Data recovery'],
    bio: 'Computer and phone technician. Can back up your data before any repair and set up a fresh system with the software you need.',
    yearsOfExperience: 4, verificationStatus: 'unverified', pricingType: 'fixed', startingPrice: 2500, priceUnit: 'diagnosis',
    availability: { status: 'available', days: MON_SAT, hours: '10:00 AM – 7:00 PM' },
    contactPreference: 'in-app', languages: ['English', 'Igbo', 'Pidgin'], joinedAt: '2026-09-14', quality: 0.69, reviewTotal: 6,
  },
  {
    id: 'a24', name: 'Rasheed Lawal', category: 'hair', city: 'Lagos', state: 'Lagos',
    serviceAreas: ['Yaba', 'Surulere', 'Lekki'],
    specialties: ['Haircuts & fades', 'Beard grooming', 'Kids cuts', 'Home service'],
    bio: 'Barber with a clean, appointment-based shop in Yaba. Clippers are sterilised between every client.',
    yearsOfExperience: 6, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 3000, priceUnit: 'per cut',
    availability: { status: 'available', days: ALL_WEEK, hours: '9:00 AM – 9:00 PM' },
    contactPreference: 'in-app', languages: ['English', 'Yoruba', 'Pidgin'], joinedAt: '2026-01-30', quality: 0.83, reviewTotal: 19,
  },
  {
    id: 'a25', name: 'Nkechi Onyeka', category: 'caterer', city: 'Awka', state: 'Anambra',
    serviceAreas: ['Ifite', 'Amawbia', 'Okpuno', 'Agu-Awka'],
    specialties: ['Native soups', 'Small chops', 'Owambe packages', 'Cakes & desserts'],
    bio: 'Home-based caterer known for native soups and party trays. Delivers within Awka; larger events by arrangement.',
    yearsOfExperience: 7, verificationStatus: 'pending', pricingType: 'quote', startingPrice: null,
    availability: { status: 'available', days: ALL_WEEK, hours: 'By appointment' },
    contactPreference: 'whatsapp', languages: ['English', 'Igbo'], joinedAt: '2026-08-04', quality: 0.8, reviewTotal: 10,
  },
  {
    id: 'a26', name: 'Victor Eze', category: 'painter', city: 'Abuja', state: 'FCT',
    serviceAreas: ['Lugbe', 'Kubwa', 'Gwarinpa', 'Garki'],
    specialties: ['Interior painting', 'Wall finishes', 'Wallpaper', 'Exterior painting'],
    bio: 'Painter offering per-room pricing for interiors so you know your total upfront. Furniture is covered and moved back after the job.',
    yearsOfExperience: 6, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 35000, priceUnit: 'per room',
    availability: { status: 'busy', days: MON_SAT, hours: '8:00 AM – 5:00 PM' },
    contactPreference: 'phone', languages: ['English', 'Igbo'], joinedAt: '2026-04-27', quality: 0.75, reviewTotal: 11,
  },
  {
    id: 'a27', name: 'Gabriel Udeh', category: 'tiler', city: 'Awka', state: 'Anambra',
    serviceAreas: ['Okpuno', 'Nibo', 'Amawbia', 'Umuokpu'],
    specialties: ['Floor tiling', 'Block work', 'Fence & gate pillars', 'Interlocking'],
    bio: 'Mason and tiler working on new builds and renovations around Awka. I can recommend reliable tile suppliers on Zik Avenue.',
    yearsOfExperience: 12, verificationStatus: 'unverified', pricingType: 'quote', startingPrice: null,
    availability: { status: 'available', days: MON_SAT, hours: '7:00 AM – 6:00 PM' },
    contactPreference: 'phone', languages: ['English', 'Igbo'], joinedAt: '2026-02-26', quality: 0.67, reviewTotal: 9,
  },
  {
    id: 'a28', name: 'Ruth Akpan', category: 'appliance-repair', city: 'Lagos', state: 'Lagos',
    serviceAreas: ['Ikorodu', 'Gbagada', 'Ikeja'],
    specialties: ['Washing machines', 'Microwaves', 'Fridges', 'Smart TVs'],
    bio: 'Appliance technician offering home visits on the Ikorodu–Ikeja axis. Clear quotes and a 30-day workmanship promise on my own repairs.',
    yearsOfExperience: 5, verificationStatus: 'verified', pricingType: 'fixed', startingPrice: 6000, priceUnit: 'home visit',
    availability: { status: 'available', days: MON_SAT, hours: '9:00 AM – 6:00 PM' },
    contactPreference: 'in-app', languages: ['English', 'Efik', 'Yoruba'], joinedAt: '2026-06-19', quality: 0.79, reviewTotal: 12,
  },
  {
    id: 'a29', name: 'Joseph Ani', category: 'electrician', city: 'Nsukka', state: 'Enugu',
    serviceAreas: ['UNN Campus', 'Odenigbo', 'Odim', 'Hilltop'],
    specialties: ['House wiring', 'Socket & switch repair', 'Pumping machine wiring', 'Prepaid meter issues'],
    bio: 'Electrician serving Nsukka town and the campus area. Popular with landlords and students for quick fixes.',
    yearsOfExperience: 6, verificationStatus: 'unverified', pricingType: 'fixed', startingPrice: 5000, priceUnit: 'call-out',
    availability: { status: 'available', days: MON_SAT, hours: '8:00 AM – 7:00 PM' },
    contactPreference: 'phone', languages: ['English', 'Igbo'], joinedAt: '2026-07-29', quality: 0.71, reviewTotal: 8,
  },
  {
    id: 'a30', name: 'Sadiq Garba', category: 'plumber', city: 'Abuja', state: 'FCT',
    serviceAreas: ['Maitama', 'Wuse', 'Jabi', 'Garki'],
    specialties: ['Bathroom installation', 'Water heaters', 'Leak repairs', 'Pressure pumps'],
    bio: 'Plumber for residential estates and offices in central Abuja. Hourly pricing for small jobs, quotes for installations.',
    yearsOfExperience: 8, verificationStatus: 'verified', pricingType: 'hourly', startingPrice: 5000, priceUnit: 'per hour',
    availability: { status: 'available', days: WEEKDAYS, hours: '8:00 AM – 5:00 PM' },
    contactPreference: 'in-app', languages: ['English', 'Hausa', 'Pidgin'], joinedAt: '2026-03-08', quality: 0.78, reviewTotal: 15,
  },
];

// ---------------------------------------------------------------------------
// Deterministic generators so sample data stays stable across reloads.

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createRandom(seed) {
  let a = hashString(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rand, list) => list[Math.floor(rand() * list.length)];

// `quality` is a rough 0–1 knob; scaled down so sample averages land in a
// believable 4.0–4.8 range rather than a wall of perfect scores.
function pickRating(rand, quality) {
  const p5 = quality * 0.72;
  const r = rand();
  if (r < p5) return 5;
  const rest = (r - p5) / (1 - p5);
  if (rest < 0.7) return 4;
  if (rest < 0.9) return 3;
  if (rest < 0.97) return 2;
  return 1;
}

const START = new Date('2025-03-01').getTime();
const END = new Date('2026-10-05').getTime();

function generateReviews(artisan) {
  const rand = createRandom(`reviews-${artisan.id}`);
  const joined = Math.max(START, new Date(artisan.joinedAt).getTime() - 1000 * 60 * 60 * 24 * 120);
  const reviews = [];
  for (let i = 0; i < artisan.reviewTotal; i++) {
    const rating = pickRating(rand, artisan.quality);
    const pool =
      rating >= 4
        ? [...CATEGORY_REVIEWS[artisan.category], ...POSITIVE_GENERIC]
        : rating === 3
          ? MIXED_GENERIC
          : NEGATIVE_GENERIC;
    const date = new Date(joined + rand() * (END - joined));
    reviews.push({
      id: `${artisan.id}-r${i + 1}`,
      author: pick(rand, REVIEWER_NAMES),
      rating,
      text: pick(rand, pool),
      service: pick(rand, artisan.specialties),
      date: date.toISOString().slice(0, 10),
      hasPhoto: rating >= 4 && rand() < 0.22,
      isSample: true,
    });
  }
  return reviews.sort((a, b) => b.date.localeCompare(a.date));
}

function generatePortfolio(artisan) {
  const rand = createRandom(`portfolio-${artisan.id}`);
  const titles = PORTFOLIO_TITLES[artisan.category] || [];
  const count = 4 + Math.floor(rand() * 3);
  return titles.slice(0, count).map((title, i) => ({
    id: `${artisan.id}-p${i + 1}`,
    title,
    location: pick(rand, artisan.serviceAreas),
    image: null, // No photography bundled in the demo — the UI renders a styled placeholder.
    tone: i % 4,
  }));
}

export const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const ARTISANS = BASE.map(({ quality, reviewTotal, ...rest }) => {
  const reviews = generateReviews({ ...rest, quality, reviewTotal });
  const rating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;
  return {
    ...rest,
    slug: slugify(rest.name),
    profileImage: null,
    rating,
    reviewCount: reviews.length,
    reviews,
    portfolio: generatePortfolio(rest),
    isDemo: true,
  };
});

export const getArtisanById = (id) => ARTISANS.find((a) => a.id === id);
