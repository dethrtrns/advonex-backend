import { Role, RequestStatus, AccountStatus, LocationType } from '@prisma/client';
import { countries } from './countries';
import { practiceAreas } from './practiceAreas';
import { practiceCourts } from './practiceCourts';

// --- Location Static Data ---

export const locations = [
  // Practice Courts Locations (India)
  {  cityId: '25c501d2-e183-4dfc-a386-39b300fa8373', address: 'Supreme Court of India, Tilak Marg', locationOf: LocationType.PRACTICE_COURT },
  {  cityId: 'ba72de0d-217b-450a-9e01-cfd236d2a296', address: 'High Court, Lko', locationOf: LocationType.PRACTICE_COURT },
  {  cityId: '25c501d2-e183-4dfc-a386-39b300fa8373', address: 'District Court, Delhi', locationOf: LocationType.PRACTICE_COURT },
  {  cityId: 'ba72de0d-217b-450a-9e01-cfd236d2a296', address: 'Family Court, Lucknow', locationOf: LocationType.PRACTICE_COURT },
  {  cityId: '7dc4cce4-543e-4883-a919-4a1ff33200ea', address: 'Consumer Court, Ayodhya', locationOf: LocationType.PRACTICE_COURT },
  // Lawyer Locations (Thailand)
  {  cityId: 'ba72de0d-217b-450a-9e01-cfd236d2a296', address: '123 Sukhumvit Road', locationOf: LocationType.LAWYER },
  {  cityId: 'ba72de0d-217b-450a-9e01-cfd236d2a296', address: '456 Nimmanhaemin Road, Chiang Mai', locationOf: LocationType.LAWYER },
  {  cityId: 'ba72de0d-217b-450a-9e01-cfd236d2a296', address: '789 Patong Beach Road, Phuket', locationOf: LocationType.LAWYER },
];


// --- Predefined Lists ---

export const services = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010', // Consultation
    name: 'Consultation',
    description: 'Initial legal consultation',
    isPredefined: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011', // Document Review
    name: 'Document Review',
    description: 'Review of legal documents',
    isPredefined: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012', // Contract Drafting
    name: 'Contract Drafting',
    description: 'Drafting legal contracts',
    isPredefined: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013', // Litigation Support
    name: 'Litigation Support',
    description: 'Support during legal proceedings',
    isPredefined: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014', // Legal Research
    name: 'Legal Research',
    description: 'In-depth legal research',
    isPredefined: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015', // Mediation
    name: 'Mediation',
    description: 'Legal mediation services',
    isPredefined: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440016', // Arbitration
    name: 'Arbitration',
    description: 'Legal arbitration services',
    isPredefined: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440017', // Notary Services
    name: 'Notary Services',
    description: 'Notary public services',
    isPredefined: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440018', // Legal Translation
    name: 'Legal Translation',
    description: 'Translation of legal documents',
    isPredefined: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440019', // Legal Opinion
    name: 'Legal Opinion',
    description: 'Expert legal opinion',
    isPredefined: true,
  },
];

// --- Mock Users ---
// Note: In a real seed, phone numbers should be unique and realistic.
// We'll use simple IDs for linking profiles easily here.

export const users = [
  // Clients
  {
    id: '550e8400-e29b-41d4-a716-446655440020', // Client 1
    phoneNumber: '+919876543210',
    email: 'alice.adams@email.com',
    accountStatus: AccountStatus.ACTIVE,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440021', // Client 2
    phoneNumber: '+919876543211',
    email: 'bob.brown@email.com',
    accountStatus: AccountStatus.ACTIVE,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440022', // Client 3
    phoneNumber: '+919876543212',
    email: 'carol.clark@email.com',
    accountStatus: AccountStatus.ACTIVE,
  },
  // Lawyers
  {
    id: '550e8400-e29b-41d4-a716-446655440023', // Lawyer 1
    phoneNumber: '+919876543213',
    email: 'john.smith@email.com',
    accountStatus: AccountStatus.ACTIVE,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440024', // Lawyer 2
    phoneNumber: '+919876543214',
    email: 'sarah.johnson@email.com',
    accountStatus: AccountStatus.ACTIVE,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440025', // Lawyer 3
    phoneNumber: '+919876543215',
    email: 'michael.brown@email.com',
    accountStatus: AccountStatus.ACTIVE,
  },
];

// User Roles
export const userRoles = [
  { userId: '550e8400-e29b-41d4-a716-446655440020', role: Role.CLIENT },
  { userId: '550e8400-e29b-41d4-a716-446655440021', role: Role.CLIENT },
  { userId: '550e8400-e29b-41d4-a716-446655440022', role: Role.CLIENT },
  { userId: '550e8400-e29b-41d4-a716-446655440023', role: Role.LAWYER },
  { userId: '550e8400-e29b-41d4-a716-446655440024', role: Role.LAWYER },
  { userId: '550e8400-e29b-41d4-a716-446655440025', role: Role.LAWYER },
];

// --- Mock Profiles ---

export const clientProfiles = [
  {
    id: '550e8400-e29b-41d4-a716-446655440026', // Client Profile 1
    userId: '550e8400-e29b-41d4-a716-446655440020',
    name: 'Alice Adams',
    photo: 'https://example.com/photos/alice.jpg',
    registrationPending: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440027', // Client Profile 2
    userId: '550e8400-e29b-41d4-a716-446655440021',
    name: 'Bob Brown',
    photo: 'https://example.com/photos/bob.jpg',
    registrationPending: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440028', // Client Profile 3
    userId: '550e8400-e29b-41d4-a716-446655440022',
    name: 'Carol Clark',
    photo: 'https://example.com/photos/carol.jpg',
    registrationPending: true,
  },
];

export const lawyerProfiles = [
  {
    id: '550e8400-e29b-41d4-a716-446655440029', // Lawyer Profile 1
    userId: '550e8400-e29b-41d4-a716-446655440023',
    name: 'John Smith',
    photo: 'https://example.com/photos/lawyer1.jpg',
    locationId: 'loc-lawyer-bkk',
    experience: 10,
    bio: 'Experienced corporate lawyer specializing in mergers and acquisitions.',
    consultFee: 3000,
    barId: 'BAR12345',
    isVerified: true,
    registrationPending: false,
    specializationName: 'Corporate Law',
    primaryCourtName: 'High Courts',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440030', // Lawyer Profile 2
    userId: '550e8400-e29b-41d4-a716-446655440024',
    name: 'Sarah Johnson',
    photo: 'https://example.com/photos/lawyer2.jpg',
    locationId: 'loc-lawyer-cnx',
    experience: 5,
    bio: 'Dedicated criminal defense attorney with a focus on client rights.',
    consultFee: 2000,
    barId: 'BAR67890',
    isVerified: false,
    registrationPending: false,
    specializationName: 'Criminal Law',
    primaryCourtName: 'District Courts',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440031', // Lawyer Profile 3
    userId: '550e8400-e29b-41d4-a716-446655440025',
    name: 'Michael Brown',
    photo: 'https://example.com/photos/lawyer3.jpg',
    locationId: 'loc-lawyer-hkt',
    experience: 8,
    bio: 'Specialized in real estate and property law with extensive experience in coastal properties.',
    consultFee: 2500,
    barId: 'BAR13579',
    isVerified: true,
    registrationPending: false,
    specializationName: 'Real Estate Law',
    primaryCourtName: 'Family Courts',
  },
];

// --- Mock Lawyer Details ---

export const educations = [
  {
    id: '550e8400-e29b-41d4-a716-446655440032', // Education 1
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    institution: 'National Law School of India University',
    degree: 'Bachelor of Laws (LL.B.)',
    year: 2014,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440033', // Education 2
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    institution: 'Faculty of Law, University of Delhi',
    degree: 'Bachelor of Laws (LL.B.)',
    year: 2019,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440034', // Education 3
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    institution: 'Symbiosis Law School',
    degree: 'Bachelor of Laws (LL.B.)',
    year: 2016,
  },
];

// --- Mock Join Table Data (Many-to-Many) ---

export const lawyerPracticeAreas = [
  // Lawyer 1 (Corporate) also does Real Estate and Intellectual Property
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    practiceAreaName: 'Corporate Law',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    practiceAreaName: 'Real Estate Law',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    practiceAreaName: 'Intellectual Property Law',
  },

  // Lawyer 2 (Criminal) also does Family Law
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    practiceAreaName: 'Criminal Law',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    practiceAreaName: 'Family Law',
  },

  // Lawyer 3 (Real Estate) also does Corporate
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    practiceAreaName: 'Real Estate Law',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    practiceAreaName: 'Corporate Law',
  },
];

export const lawyerPracticeCourts = [
  // Lawyer 1 practices in High Court and Supreme Court
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    practiceCourtName: 'High Courts',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    practiceCourtName: 'Supreme Court of India',
  },

  // Lawyer 2 practices in District Court and High Court
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    practiceCourtName: 'District Courts',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    practiceCourtName: 'High Courts',
  },

  // Lawyer 3 practices in Family Court and High Court
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    practiceCourtName: 'Family Courts',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    practiceCourtName: 'High Courts',
  },
];

export const lawyerServices = [
  // Lawyer 1 offers Consultation, Contract Drafting, Legal Research
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    serviceId: '550e8400-e29b-41d4-a716-446655440010',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    serviceId: '550e8400-e29b-41d4-a716-446655440012',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    serviceId: '550e8400-e29b-41d4-a716-446655440014',
  },

  // Lawyer 2 offers Consultation, Document Review, Litigation Support
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    serviceId: '550e8400-e29b-41d4-a716-446655440010',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    serviceId: '550e8400-e29b-41d4-a716-446655440011',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    serviceId: '550e8400-e29b-41d4-a716-446655440013',
  },

  // Lawyer 3 offers Consultation, Contract Drafting, Legal Translation
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    serviceId: '550e8400-e29b-41d4-a716-446655440010',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    serviceId: '550e8400-e29b-41d4-a716-446655440012',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    serviceId: '550e8400-e29b-41d4-a716-446655440018',
  },
];

// --- Mock Interaction Data ---

export const savedLawyers = [
  // Client 1 saved Lawyer 1 and 2
  {
    clientProfileId: '550e8400-e29b-41d4-a716-446655440026',
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
  },
  {
    clientProfileId: '550e8400-e29b-41d4-a716-446655440027',
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
  },
  // Client 2 saved Lawyer 3
  {
    clientProfileId: '550e8400-e29b-41d4-a716-446655440028',
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
  },
];

export const consultationRequests = [
  // Client 1 requested consultation from Lawyer 1 (Pending)
  {
    id: '550e8400-e29b-41d4-a716-446655440037', // Request 1
    clientProfileId: '550e8400-e29b-41d4-a716-446655440026',
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    message: 'I need help with a corporate merger case.',
    status: RequestStatus.PENDING,
  },
  // Client 1 requested consultation from Lawyer 2 (Viewed)
  {
    id: '550e8400-e29b-41d4-a716-446655440038', // Request 2
    clientProfileId: '550e8400-e29b-41d4-a716-446655440027',
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    message: 'I need assistance with a criminal defense case.',
    status: RequestStatus.RESPONDED,
  },
  // Client 2 requested consultation from Lawyer 3 (Responded)
  {
    id: '550e8400-e29b-41d4-a716-446655440039', // Request 3
    clientProfileId: '550e8400-e29b-41d4-a716-446655440028',
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    message: 'Need help with a property purchase agreement.',
    status: RequestStatus.RESPONDED,
  },
];

export {
  countries,
  practiceAreas,
  practiceCourts,
  // services, // Already exported
  // users, // Already exported
  // userRoles, // Already exported
  // clientProfiles, // Already exported
  // lawyerProfiles, // Already exported
  // educations, // Already exported
  // lawyerPracticeAreas, // Already exported
  // lawyerPracticeCourts, // Already exported
  // lawyerServices, // Already exported
  // savedLawyers, // Already exported
  // consultationRequests, // Already exported
};