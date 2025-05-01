import { Role, RequestStatus } from '@prisma/client';

// --- Predefined Lists ---

export const practiceAreas = [
  { id: 'area-1', name: 'Family Law' },
  { id: 'area-2', name: 'Corporate Law' },
  { id: 'area-3', name: 'Criminal Defense' },
  { id: 'area-4', name: 'Real Estate Law' },
  { id: 'area-5', name: 'Intellectual Property' },
];

export const practiceCourts = [
  { id: 'court-1', name: 'Supreme Court of Thailand' },
  { id: 'court-2', name: 'delhi High Court - Division A' },
  { id: 'court-3', name: 'District Court - Sector 7G' },
  { id: 'court-4', name: 'Small Claims Court - Metro Area' },
];

export const services = [
  { id: 'service-1', name: 'Consultation', isPredefined: true },
  { id: 'service-2', name: 'Document Review', isPredefined: true },
  { id: 'service-3', name: 'Contract Drafting', isPredefined: true },
  { id: 'service-4', name: 'Litigation Support', isPredefined: true },
  // Example of a potentially non-predefined service a lawyer might add later
  // { id: 'service-5', name: 'Custom Legal Research', isPredefined: false },
];

// --- Mock Users ---
// Note: In a real seed, phone numbers should be unique and realistic.
// We'll use simple IDs for linking profiles easily here.

export const users = [
  // Clients
  {
    id: 'user-client-1',
    phoneNumber: '+10000000001',
    role: Role.CLIENT,
    registrationPending: false, // Assume client completed minimal profile
  },
  {
    id: 'user-client-2',
    phoneNumber: '+10000000002',
    role: Role.CLIENT,
    registrationPending: true, // Assume client just registered
  },
  // Lawyers
  {
    id: 'user-lawyer-1',
    phoneNumber: '+10000000011',
    role: Role.LAWYER,
    registrationPending: false, // Assume lawyer completed profile
  },
  {
    id: 'user-lawyer-2',
    phoneNumber: '+10000000012',
    role: Role.LAWYER,
    registrationPending: false, // Assume lawyer completed profile
  },
  {
    id: 'user-lawyer-3',
    phoneNumber: '+10000000013',
    role: Role.LAWYER,
    registrationPending: true, // Assume lawyer just registered, needs profile completion
  },
];

// --- Mock Profiles ---

export const clientProfiles = [
  {
    id: 'profile-client-1',
    userId: 'user-client-1', // Link to user-client-1
    name: 'Alice Adams',
    email: 'alice.adams@email.com',
    photo: 'https://example.com/photos/alice.jpg',
  },
  // Client 2 has no profile details yet as registrationPending is true
];

export const lawyerProfiles = [
  {
    id: 'profile-lawyer-1',
    userId: 'user-lawyer-1', // Link to user-lawyer-1
    photo: 'https://example.com/photos/bob.jpg',
    location: 'Example City, ExampleLand',
    experience: 10,
    bio: 'Experienced corporate lawyer specializing in mergers and acquisitions.',
    consultFee: 300,
    barId: 'BAR12345',
    isVerified: true,
    specializationId: 'area-2', // Corporate Law
    primaryCourtId: 'court-2', // ExampleLand High Court - Division A
  },
  {
    id: 'profile-lawyer-2',
    userId: 'user-lawyer-2', // Link to user-lawyer-2
    photo: 'https://example.com/photos/charlie.jpg',
    location: 'Metro Area, ExampleLand',
    experience: 5,
    bio: 'Dedicated criminal defense attorney with a focus on client rights.',
    consultFee: 200,
    barId: 'BAR67890',
    isVerified: false, // Not yet verified
    specializationId: 'area-3', // Criminal Defense
    primaryCourtId: 'court-3', // District Court - Sector 7G
  },
  // Lawyer 3 has no profile details yet as registrationPending is true
];

// --- Mock Lawyer Details ---

export const educations = [
  {
    id: 'edu-lawyer-1',
    lawyerProfileId: 'profile-lawyer-1', // Link to lawyer 1
    institution: 'Example University School of Law',
    degree: 'Juris Doctor (JD)',
    graduationYear: 2014,
  },
  {
    id: 'edu-lawyer-2',
    lawyerProfileId: 'profile-lawyer-2', // Link to lawyer 2
    institution: 'Metro Law College',
    degree: 'Juris Doctor (JD)',
    graduationYear: 2019,
  },
];

// --- Mock Join Table Data (Many-to-Many) ---

export const lawyerPracticeAreas = [
  // Lawyer 1 (Corporate) also does Real Estate
  { lawyerProfileId: 'profile-lawyer-1', practiceAreaId: 'area-2' }, // Corporate (matches specialization)
  { lawyerProfileId: 'profile-lawyer-1', practiceAreaId: 'area-4' }, // Real Estate

  // Lawyer 2 (Criminal) also does Family Law
  { lawyerProfileId: 'profile-lawyer-2', practiceAreaId: 'area-3' }, // Criminal (matches specialization)
  { lawyerProfileId: 'profile-lawyer-2', practiceAreaId: 'area-1' }, // Family Law
];

export const lawyerPracticeCourts = [
  // Lawyer 1 (High Court A) also practices in Supreme Court
  { lawyerProfileId: 'profile-lawyer-1', practiceCourtId: 'court-2' }, // High Court A (matches primary)
  { lawyerProfileId: 'profile-lawyer-1', practiceCourtId: 'court-1' }, // Supreme Court

  // Lawyer 2 (District 7G) also practices in Small Claims
  { lawyerProfileId: 'profile-lawyer-2', practiceCourtId: 'court-3' }, // District 7G (matches primary)
  { lawyerProfileId: 'profile-lawyer-2', practiceCourtId: 'court-4' }, // Small Claims
];

export const lawyerServices = [
  // Lawyer 1 offers Consultation, Contract Drafting
  { lawyerProfileId: 'profile-lawyer-1', serviceId: 'service-1' },
  { lawyerProfileId: 'profile-lawyer-1', serviceId: 'service-3' },

  // Lawyer 2 offers Consultation, Document Review, Litigation Support
  { lawyerProfileId: 'profile-lawyer-2', serviceId: 'service-1' },
  { lawyerProfileId: 'profile-lawyer-2', serviceId: 'service-2' },
  { lawyerProfileId: 'profile-lawyer-2', serviceId: 'service-4' },
];

// --- Mock Interaction Data ---

export const savedLawyers = [
  // Client 1 saved Lawyer 1
  { clientProfileId: 'profile-client-1', lawyerProfileId: 'profile-lawyer-1' },
  // Client 1 also saved Lawyer 2
  { clientProfileId: 'profile-client-1', lawyerProfileId: 'profile-lawyer-2' },
];

export const consultationRequests = [
  // Client 1 requested consultation from Lawyer 1 (Pending)
  {
    id: 'req-1',
    clientProfileId: 'profile-client-1',
    lawyerProfileId: 'profile-lawyer-1',
    message: 'Need advice on incorporating a new business.',
    status: RequestStatus.PENDING,
  },
  // Client 1 requested consultation from Lawyer 2 (Viewed)
  {
    id: 'req-2',
    clientProfileId: 'profile-client-1',
    lawyerProfileId: 'profile-lawyer-2',
    message: 'Question about a recent traffic citation.',
    status: RequestStatus.VIEWED,
  },
];