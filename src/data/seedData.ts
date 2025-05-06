import { Role, RequestStatus, AccountStatus } from '@prisma/client';

// --- Predefined Lists ---

export const practiceAreas = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000', // Corporate Law
    name: 'Corporate Law',
    description: 'Legal matters related to business and corporate entities',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001', // Criminal Law
    name: 'Criminal Law',
    description: 'Legal matters related to criminal offenses and defense',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002', // Family Law
    name: 'Family Law',
    description:
      'Legal matters related to family relationships and domestic issues',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003', // Real Estate Law
    name: 'Real Estate Law',
    description:
      'Legal matters related to property and real estate transactions',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004', // Intellectual Property Law
    name: 'Intellectual Property Law',
    description: 'Legal matters related to patents, trademarks, and copyrights',
  },
];

export const practiceCourts = [
  {
    id: '550e8400-e29b-41d4-a716-446655440005', // Supreme Court
    name: 'Supreme Court',
    location: 'New Delhi',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006', // High Court
    name: 'High Court',
    location: 'Mumbai',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007', // District Court
    name: 'District Court',
    location: 'Bangalore',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008', // Family Court
    name: 'Family Court',
    location: 'Chennai',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009', // Consumer Court
    name: 'Consumer Court',
    location: 'Kolkata',
  },
];

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
    phoneNumber: '+66810000001',
    email: 'alice.adams@email.com',
    accountStatus: AccountStatus.ACTIVE,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440021', // Client 2
    phoneNumber: '+66810000002',
    email: 'bob.brown@email.com',
    accountStatus: AccountStatus.ACTIVE,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440022', // Client 3
    phoneNumber: '+66810000003',
    email: 'carol.clark@email.com',
    accountStatus: AccountStatus.ACTIVE,
  },
  // Lawyers
  {
    id: '550e8400-e29b-41d4-a716-446655440023', // Lawyer 1
    phoneNumber: '+66810000011',
    email: 'john.smith@email.com',
    accountStatus: AccountStatus.ACTIVE,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440024', // Lawyer 2
    phoneNumber: '+66810000012',
    email: 'sarah.johnson@email.com',
    accountStatus: AccountStatus.ACTIVE,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440025', // Lawyer 3
    phoneNumber: '+66810000013',
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
    location: 'Bangkok, Thailand',
    experience: 10,
    bio: 'Experienced corporate lawyer specializing in mergers and acquisitions.',
    consultFee: 3000,
    barId: 'BAR12345',
    isVerified: true,
    registrationPending: false,
    specializationName: 'Corporate Law',
    primaryCourtName: 'High Court',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440030', // Lawyer Profile 2
    userId: '550e8400-e29b-41d4-a716-446655440024',
    name: 'Sarah Johnson',
    photo: 'https://example.com/photos/lawyer2.jpg',
    location: 'Chiang Mai, Thailand',
    experience: 5,
    bio: 'Dedicated criminal defense attorney with a focus on client rights.',
    consultFee: 2000,
    barId: 'BAR67890',
    isVerified: false,
    registrationPending: false,
    specializationName: 'Criminal Law',
    primaryCourtName: 'District Court',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440031', // Lawyer Profile 3
    userId: '550e8400-e29b-41d4-a716-446655440025',
    name: 'Michael Brown',
    photo: 'https://example.com/photos/lawyer3.jpg',
    location: 'Phuket, Thailand',
    experience: 8,
    bio: 'Specialized in real estate and property law with extensive experience in coastal properties.',
    consultFee: 2500,
    barId: 'BAR13579',
    isVerified: true,
    registrationPending: false,
    specializationName: 'Real Estate Law',
    primaryCourtName: 'Family Court',
  },
];

// --- Mock Lawyer Details ---

export const educations = [
  {
    id: '550e8400-e29b-41d4-a716-446655440032', // Education 1
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    institution: 'Thammasat University Faculty of Law',
    degree: 'Bachelor of Laws (LL.B.)',
    year: 2014,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440033', // Education 2
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    institution: 'Chulalongkorn University Faculty of Law',
    degree: 'Bachelor of Laws (LL.B.)',
    year: 2019,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440034', // Education 3
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    institution: 'Mahidol University Faculty of Law',
    degree: 'Bachelor of Laws (LL.B.)',
    year: 2016,
  },
];

// --- Mock Join Table Data (Many-to-Many) ---

export const lawyerPracticeAreas = [
  // Lawyer 1 (Corporate) also does Real Estate and Intellectual Property
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    practiceAreaId: '550e8400-e29b-41d4-a716-446655440000',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    practiceAreaId: '550e8400-e29b-41d4-a716-446655440003',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    practiceAreaId: '550e8400-e29b-41d4-a716-446655440004',
  },

  // Lawyer 2 (Criminal) also does Family Law
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    practiceAreaId: '550e8400-e29b-41d4-a716-446655440001',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    practiceAreaId: '550e8400-e29b-41d4-a716-446655440002',
  },

  // Lawyer 3 (Real Estate) also does Corporate
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    practiceAreaId: '550e8400-e29b-41d4-a716-446655440003',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    practiceAreaId: '550e8400-e29b-41d4-a716-446655440000',
  },
];

export const lawyerPracticeCourts = [
  // Lawyer 1 practices in High Court and Supreme Court
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    practiceCourtId: '550e8400-e29b-41d4-a716-446655440006',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440029',
    practiceCourtId: '550e8400-e29b-41d4-a716-446655440005',
  },

  // Lawyer 2 practices in District Court and High Court
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    practiceCourtId: '550e8400-e29b-41d4-a716-446655440007',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440030',
    practiceCourtId: '550e8400-e29b-41d4-a716-446655440006',
  },

  // Lawyer 3 practices in Family Court and High Court
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    practiceCourtId: '550e8400-e29b-41d4-a716-446655440008',
  },
  {
    lawyerProfileId: '550e8400-e29b-41d4-a716-446655440031',
    practiceCourtId: '550e8400-e29b-41d4-a716-446655440006',
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
