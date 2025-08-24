export interface DemoSupplier {
  name: string;
  location: string;
  country: string;
  contactPerson: string;
  email: string;
  phone: string;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  riskLevel: 'low' | 'medium' | 'high';
  certifications: string[];
  leadTime: number;
  paymentTerms: string;
  minimumOrder: number;
  maximumOrder: number;
  specialties: string[];
}

export const demoSuppliers: DemoSupplier[] = [
  {
    name: 'Foxconn Technology Group',
    location: 'Shenzhen',
    country: 'China',
    contactPerson: 'Li Wei',
    email: 'procurement@foxconn.com',
    phone: '+86 755 1234 5678',
    rating: 4.5,
    status: 'active',
    riskLevel: 'low',
    certifications: ['ISO 9001', 'ISO 14001', 'IATF 16949'],
    leadTime: 45,
    paymentTerms: 'Net 60',
    minimumOrder: 1000,
    maximumOrder: 100000,
    specialties: ['Electronics Manufacturing', 'PCB Assembly', 'Final Assembly']
  },
  {
    name: 'Quanta Computer',
    location: 'Taipei',
    country: 'Taiwan',
    contactPerson: 'Chen Ming',
    email: 'sales@quanta.com.tw',
    phone: '+886 2 2345 6789',
    rating: 4.3,
    status: 'active',
    riskLevel: 'low',
    certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
    leadTime: 60,
    paymentTerms: 'Net 45',
    minimumOrder: 500,
    maximumOrder: 50000,
    specialties: ['Laptop Manufacturing', 'Server Assembly', 'Cloud Infrastructure']
  },
  {
    name: 'Luxshare Precision Industry',
    location: 'Dongguan',
    country: 'China',
    contactPerson: 'Wang Fang',
    email: 'info@luxshare.com',
    phone: '+86 769 8765 4321',
    rating: 4.1,
    status: 'active',
    riskLevel: 'medium',
    certifications: ['ISO 9001', 'ISO 14001'],
    leadTime: 30,
    paymentTerms: 'Net 30',
    minimumOrder: 2000,
    maximumOrder: 75000,
    specialties: ['Audio Equipment', 'Cable Assembly', 'Precision Components']
  },
  {
    name: 'Pegatron Corporation',
    location: 'Taipei',
    country: 'Taiwan',
    contactPerson: 'Lin Jie',
    email: 'procurement@pegatron.com',
    phone: '+886 2 3456 7890',
    rating: 4.2,
    status: 'active',
    riskLevel: 'low',
    certifications: ['ISO 9001', 'ISO 14001', 'IATF 16949'],
    leadTime: 50,
    paymentTerms: 'Net 60',
    minimumOrder: 800,
    maximumOrder: 60000,
    specialties: ['Mobile Devices', 'Tablets', 'IoT Products']
  },
  {
    name: 'Wistron Corporation',
    location: 'Hsinchu',
    country: 'Taiwan',
    contactPerson: 'Huang Mei',
    email: 'sales@wistron.com',
    phone: '+886 3 4567 8901',
    rating: 4.0,
    status: 'active',
    riskLevel: 'medium',
    certifications: ['ISO 9001', 'ISO 14001'],
    leadTime: 55,
    paymentTerms: 'Net 45',
    minimumOrder: 1200,
    maximumOrder: 80000,
    specialties: ['Server Manufacturing', 'Storage Solutions', 'Network Equipment']
  }
];
