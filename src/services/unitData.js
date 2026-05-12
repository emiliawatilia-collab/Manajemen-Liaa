export const unitsData = [
  {
    id: 1,
    unitNumber: '339',
    status: 'kosong',
    tenant: null,
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 2,
    unitNumber: '531',
    status: 'terisi',
    tenant: {
      name: 'Yana',
      checkIn: '2026-05-09',
      checkOut: '2026-05-13',
      phone: '081234567890',
    },
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 3,
    unitNumber: '731',
    status: 'terisi',
    tenant: {
      name: 'Deo',
      checkIn: '2026-05-10',
      checkOut: '2026-05-12',
      phone: '081298765432',
    },
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 4,
    unitNumber: '735',
    status: 'kosong',
    tenant: null,
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 5,
    unitNumber: '717',
    status: 'terisi',
    tenant: {
      name: 'Siti',
      checkIn: '2026-05-08',
      checkOut: '2026-05-10',
      phone: '081234509876',
    },
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 6,
    unitNumber: '802',
    status: 'kosong',
    tenant: null,
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 7,
    unitNumber: '815',
    status: 'terisi',
    tenant: {
      name: 'Dewi',
      checkIn: '2026-05-09',
      checkOut: '2026-05-11',
      phone: '081298761234',
    },
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 8,
    unitNumber: '2011',
    status: 'kosong',
    tenant: null,
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 9,
    unitNumber: '1033',
    status: 'terisi',
    tenant: {
      name: 'Eko',
      checkIn: '2026-05-11',
      checkOut: '2026-05-14',
      phone: '081234567123',
    },
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 10,
    unitNumber: '1017',
    status: 'terisi',
    tenant: {
      name: 'Andi',
      checkIn: '2026-05-17',
      checkOut: '2026-05-19',
      phone: '081298765678',
    },
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 11,
    unitNumber: '1205',
    status: 'kosong',
    tenant: null,
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 12,
    unitNumber: '1537',
    status: 'kosong',
    tenant: null,
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 13,
    unitNumber: '1801',
    status: 'terisi',
    tenant: {
      name: 'Mira',
      checkIn: '2026-05-08',
      checkOut: '2026-05-10',
      phone: '081234567890',
    },
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 14,
    unitNumber: '1817',
    status: 'kosong',
    tenant: null,
    price: 350000,
    pricePerMonth: 3500000,
  },
  {
    id: 15,
    unitNumber: '1926',
    status: 'terisi',
    tenant: {
      name: 'Budi',
      checkIn: '2026-05-09',
      checkOut: '2026-05-11',
      phone: '081298765432',
    },
    price: 350000,
    pricePerMonth: 3500000,
  },
];

export const getUnits = () => {
  return unitsData;
};

export const getUnitById = (id) => {
  return unitsData.find(unit => unit.id === parseInt(id));
};

export const getOccupiedUnits = () => {
  return unitsData.filter(unit => unit.status === 'terisi');
};

export const getEmptyUnits = () => {
  return unitsData.filter(unit => unit.status === 'kosong');
};

export const getOccupancyRate = () => {
  const occupied = getOccupiedUnits().length;
  const total = unitsData.length;
  return ((occupied / total) * 100).toFixed(1);
};
