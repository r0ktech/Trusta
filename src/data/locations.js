// Cities and community-level service areas used across the demo.
// Location selection is manual — Trusta does not use live geolocation.

export const LOCATIONS = [
  {
    city: 'Awka',
    state: 'Anambra',
    areas: ['Amawbia', 'Ifite', 'Okpuno', 'Nibo', 'Agu-Awka', 'Temp Site', 'Umuokpu'],
  },
  {
    city: 'Onitsha',
    state: 'Anambra',
    areas: ['Fegge', 'GRA Onitsha', 'Odoakpu', 'Woliwo', 'Inland Town', '3-3'],
  },
  {
    city: 'Nnewi',
    state: 'Anambra',
    areas: ['Otolo', 'Uruagu', 'Umudim', 'Nnewichi'],
  },
  {
    city: 'Enugu',
    state: 'Enugu',
    areas: ['Independence Layout', 'New Haven', 'Trans-Ekulu', 'Abakpa', 'GRA Enugu', 'Achara Layout', 'Uwani'],
  },
  {
    city: 'Nsukka',
    state: 'Enugu',
    areas: ['UNN Campus', 'Odenigbo', 'Odim', 'Hilltop'],
  },
  {
    city: 'Lagos',
    state: 'Lagos',
    areas: ['Yaba', 'Surulere', 'Ikeja', 'Lekki', 'Ajah', 'Ikorodu', 'Gbagada', 'Magodo'],
  },
  {
    city: 'Abuja',
    state: 'FCT',
    areas: ['Wuse', 'Garki', 'Gwarinpa', 'Kubwa', 'Maitama', 'Lugbe', 'Jabi'],
  },
  {
    city: 'Port Harcourt',
    state: 'Rivers',
    areas: ['GRA Port Harcourt', 'Rumuola', 'Trans-Amadi', 'Eliozu'],
  },
];

export const CITIES = LOCATIONS.map((l) => l.city);

export const STATES = [...new Set(LOCATIONS.map((l) => l.state))];

export const citiesInState = (state) => LOCATIONS.filter((l) => l.state === state).map((l) => l.city);

export const getLocation = (city) => LOCATIONS.find((l) => l.city === city);
