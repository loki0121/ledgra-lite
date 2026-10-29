import type { Customer } from './types';

/** Demo customers. All companies and people are fictional. */
export const customers: Customer[] = [
  { id: 'c01', company: 'Northwind Logistics', contact: 'Helena Ortiz', email: 'ap@northwind.example', country: 'United States', industry: 'Logistics', owner: 'Ariana Moss', since: '2023-03-14' },
  { id: 'c02', company: 'Ferro & Vale LLP', contact: 'Marcus Vale', email: 'billing@ferrovale.example', country: 'United Kingdom', industry: 'Legal', owner: 'Ariana Moss', since: '2022-11-02' },
  { id: 'c03', company: 'Kestrel Foods', contact: 'Priya Raman', email: 'finance@kestrel.example', country: 'Canada', industry: 'Food & beverage', owner: 'Rhea Shah', since: '2024-01-22' },
  { id: 'c04', company: 'Tidewater Clinics', contact: 'Owen Brandt', email: 'accounts@tidewater.example', country: 'Australia', industry: 'Healthcare', owner: 'Jonah Kim', since: '2024-06-09' },
  { id: 'c05', company: 'Corvid Security', contact: 'Lena Fischer', email: 'ap@corvid.example', country: 'Germany', industry: 'Security', owner: 'Jonah Kim', since: '2023-08-30' },
  { id: 'c06', company: 'Marlow Studio', contact: 'Tess Marlow', email: 'hello@marlow.example', country: 'United States', industry: 'Design', owner: 'Ariana Moss', since: '2025-02-11' },
  { id: 'c07', company: 'Pinegate Hotels', contact: 'Diego Alvarez', email: 'finance@pinegate.example', country: 'Spain', industry: 'Hospitality', owner: 'Rhea Shah', since: '2022-05-18' },
  { id: 'c08', company: 'Halcyon Cloud', contact: 'Sora Nakamura', email: 'billing@halcyon.example', country: 'Japan', industry: 'Software', owner: 'Jonah Kim', since: '2023-12-01' },
  { id: 'c09', company: 'Brightline Media', contact: 'Ava Thompson', email: 'ap@brightline.example', country: 'United States', industry: 'Media', owner: 'Ariana Moss', since: '2024-09-03' },
  { id: 'c10', company: 'Orbis Facilities', contact: 'Noah Okafor', email: 'accounts@orbis.example', country: 'Nigeria', industry: 'Facilities', owner: 'Rhea Shah', since: '2024-04-15' },
  { id: 'c11', company: 'Aster Robotics', contact: 'Mila Novak', email: 'finance@aster.example', country: 'Czechia', industry: 'Manufacturing', owner: 'Jonah Kim', since: '2025-05-27' },
  { id: 'c12', company: 'Lumen Dental', contact: 'Grace Lee', email: 'office@lumen.example', country: 'South Korea', industry: 'Healthcare', owner: 'Rhea Shah', since: '2025-08-19' },
  { id: 'c13', company: 'Steppe Mining Co.', contact: 'Bat-Erdene Ganbold', email: 'finance@steppe.example', country: 'Mongolia', industry: 'Mining', owner: 'Ariana Moss', since: '2024-02-07' },
  { id: 'c14', company: 'Quillon Partners', contact: 'Rafael Costa', email: 'ap@quillon.example', country: 'Brazil', industry: 'Consulting', owner: 'Jonah Kim', since: '2023-06-21' },
  { id: 'c15', company: 'Verdant Energy', contact: 'Ingrid Holm', email: 'billing@verdant.example', country: 'Norway', industry: 'Energy', owner: 'Rhea Shah', since: '2022-09-12' },
  { id: 'c16', company: 'Cobalt Retail Group', contact: 'Sam Patel', email: 'finance@cobalt.example', country: 'India', industry: 'Retail', owner: 'Ariana Moss', since: '2024-10-29' },
];

export const customerById = new Map(customers.map((c) => [c.id, c]));
