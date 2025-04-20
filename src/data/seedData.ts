// Types
export type LawyerProfile = {
  id: string;
  name: string;
  photo: string;
  practiceAreas: string[];
  location: string;
  experience: number;
  email: string;
  phone: string;
  bio: string;
  consultFee: number;
  education: {
    degree: string;
    institution: string;
    year: string;
  };
  barId: string;
  practiceCourts: {
    primary: string;
    secondary?: string;
  };
};

export type Lawyer = {
  id: string;
  name: string;
  photo: string;
  practiceAreas: string[];
  practiceCourts: {
    primary: string;
    secondary?: string;
  };
  location: string;
  consultFee: number;
  experience: number;
};

// Mock data for lawyer profiles
const mockLawyerProfile: LawyerProfile = {
  id: '1',
  name: 'Sarah Johnson',
  photo:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop',
  practiceAreas: ['Civil Law'],
  location: 'New York, NY',
  experience: 12,
  email: 'sarah.johnson@advonex.com',
  phone: '(555) 123-4567',
  consultFee: 300,
  bio: 'Sarah Johnson is a highly experienced attorney specializing in civil and family law. With over 12 years of practice, she has successfully handled numerous complex cases and is known for her dedication to client advocacy and thorough approach to legal matters.',
  education: {
    degree: 'Juris Doctor',
    institution: 'Harvard Law School',
    year: '2011',
  },
  barId: 'NY12345678',
  practiceCourts: {
    primary: 'New York Supreme Court',
    secondary: 'New York Family Court',
  },
};

// Mock data for all lawyer profiles
export const mockLawyers: Record<string, LawyerProfile> = {
  '1': mockLawyerProfile,
  '2': {
    id: '2',
    name: 'Michael Chen',
    photo:
      'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1000&auto=format&fit=crop',
    practiceAreas: ['Corporate Law'],
    location: 'San Francisco, CA',
    experience: 15,
    email: 'michael.chen@advonex.com',
    phone: '(555) 234-5678',
    consultFee: 350,
    bio: 'Michael Chen is a corporate law specialist with 15 years of experience advising businesses from startups to Fortune 500 companies. He provides strategic legal counsel on tax matters, mergers and acquisitions, and corporate governance.',
    education: {
      degree: 'Juris Doctor',
      institution: 'Stanford Law School',
      year: '2008',
    },
    barId: 'CA87654321',
    practiceCourts: {
      primary: 'California Superior Court',
      secondary: 'U.S. District Court, Northern District of California',
    },
  },
  '3': {
    id: '3',
    name: 'David Rodriguez',
    photo:
      'https://images.unsplash.com/photo-1615109398623-88346a601842?q=80&w=1000&auto=format&fit=crop',
    practiceAreas: ['Criminal Law'],
    location: 'Chicago, IL',
    experience: 8,
    email: 'david.rodriguez@advonex.com',
    phone: '(555) 345-6789',
    consultFee: 275,
    bio: 'David Rodriguez specializes in criminal defense and civil rights cases. With 8 years of experience, he is committed to protecting the rights of his clients and ensuring fair treatment under the law.',
    education: {
      degree: 'Juris Doctor',
      institution: 'University of Chicago Law School',
      year: '2015',
    },
    barId: 'IL98765432',
    practiceCourts: {
      primary: 'Illinois Circuit Court',
      secondary: 'U.S. District Court, Northern District of Illinois',
    },
  },
  '4': {
    id: '4',
    name: 'Emily Parker',
    photo:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop',
    practiceAreas: ['Employment Law'],
    location: 'Boston, MA',
    experience: 10,
    email: 'emily.parker@advonex.com',
    phone: '(555) 456-7890',
    consultFee: 325,
    bio: 'Emily Parker is an employment law specialist with 10 years of experience representing both employers and employees. She handles cases involving workplace discrimination, harassment, wrongful termination, and wage disputes.',
    education: {
      degree: 'Juris Doctor',
      institution: 'Boston University School of Law',
      year: '2013',
    },
    barId: 'MA98765432',
    practiceCourts: {
      primary: 'Massachusetts Superior Court',
      secondary: 'Massachusetts District Court',
    },
  },
  '5': {
    id: '5',
    name: 'James Wilson',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
    practiceAreas: ['Contract Law'],
    location: 'Los Angeles, CA',
    experience: 14,
    email: 'james.wilson@advonex.com',
    phone: '(555) 567-8901',
    consultFee: 400,
    bio: 'James Wilson specializes in real estate and contract law with 14 years of experience. He assists clients with property transactions, lease agreements, contract negotiations, and dispute resolution.',
    education: {
      degree: 'Juris Doctor',
      institution: 'UCLA School of Law',
      year: '2009',
    },
    barId: 'CA98765432',
    practiceCourts: {
      primary: 'California Superior Court',
      secondary: 'California Court of Appeal',
    },
  },
  '6': {
    id: '6',
    name: 'Maria Garcia',
    photo:
      'https://images.unsplash.com/photo-1589386417686-0d34b5903d23?q=80&w=1000&auto=format&fit=crop',
    practiceAreas: ['Immigration Law'],
    location: 'Miami, FL',
    experience: 9,
    email: 'maria.garcia@advonex.com',
    phone: '(555) 678-9012',
    consultFee: 290,
    bio: 'Maria Garcia is an immigration law attorney with 9 years of experience helping clients navigate the complex U.S. immigration system. She handles visa applications, green card processes, citizenship applications, and deportation defense.',
    education: {
      degree: 'Juris Doctor',
      institution: 'University of Miami School of Law',
      year: '2014',
    },
    barId: 'FL12345678',
    practiceCourts: {
      primary: 'Florida Circuit Court',
      secondary: 'U.S. Immigration Court',
    },
  },
};

// For the lawyers listing page
export const mockLawyersList = Object.values(mockLawyers);
