export interface DemoProduct {
  _id: string;
  name: string;
  category: string;
  supplier: string;
  origin: string;
  description: string;
  unitCost: number;
  leadTime: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  riskLevel: 'low' | 'medium' | 'high';
  certifications: string[];
  lastUpdated: Date;
}

export const demoProducts: DemoProduct[] = [
  {
    _id: 'prod_001',
    name: 'iPhone 15 Pro Max',
    category: 'Consumer Electronics',
    supplier: 'Foxconn Technology Group',
    origin: 'Shenzhen, China',
    description: 'Latest flagship smartphone with advanced camera system and titanium design',
    unitCost: 899,
    leadTime: 21,
    minOrderQuantity: 100,
    maxOrderQuantity: 10000,
    riskLevel: 'medium',
    certifications: ['CE', 'FCC', 'RoHS', 'REACH'],
    lastUpdated: new Date('2024-01-15')
  },
  {
    _id: 'prod_002',
    name: 'MacBook Air M3',
    category: 'Computers & Laptops',
    supplier: 'Quanta Computer',
    origin: 'Taipei, Taiwan',
    description: 'Ultra-thin laptop with Apple M3 chip and all-day battery life',
    unitCost: 1199,
    leadTime: 28,
    minOrderQuantity: 50,
    maxOrderQuantity: 5000,
    riskLevel: 'low',
    certifications: ['CE', 'FCC', 'Energy Star', 'EPEAT'],
    lastUpdated: new Date('2024-01-10')
  },
  {
    _id: 'prod_003',
    name: 'AirPods Pro 3rd Gen',
    category: 'Audio Equipment',
    supplier: 'Luxshare Precision Industry',
    origin: 'Dongguan, China',
    description: 'Wireless earbuds with active noise cancellation and spatial audio',
    unitCost: 249,
    leadTime: 14,
    minOrderQuantity: 200,
    maxOrderQuantity: 15000,
    riskLevel: 'low',
    certifications: ['CE', 'FCC', 'Bluetooth SIG'],
    lastUpdated: new Date('2024-01-12')
  },
  {
    _id: 'prod_004',
    name: 'iPad Air 6th Gen',
    category: 'Tablets',
    supplier: 'Pegatron Corporation',
    origin: 'Shanghai, China',
    description: 'Versatile tablet with M2 chip and Apple Pencil support',
    unitCost: 599,
    leadTime: 18,
    minOrderQuantity: 75,
    maxOrderQuantity: 8000,
    riskLevel: 'medium',
    certifications: ['CE', 'FCC', 'RoHS'],
    lastUpdated: new Date('2024-01-08')
  },
  {
    _id: 'prod_005',
    name: 'Apple Watch Series 9',
    category: 'Wearables',
    supplier: 'Compal Electronics',
    origin: 'Chongqing, China',
    description: 'Advanced smartwatch with health monitoring and fitness tracking',
    unitCost: 399,
    leadTime: 25,
    minOrderQuantity: 150,
    maxOrderQuantity: 12000,
    riskLevel: 'medium',
    certifications: ['CE', 'FCC', 'FDA', 'ISO 13485'],
    lastUpdated: new Date('2024-01-14')
  },
  {
    _id: 'prod_006',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Consumer Electronics',
    supplier: 'Samsung Electronics',
    origin: 'Gumi, South Korea',
    description: 'Premium Android smartphone with S Pen and advanced AI features',
    unitCost: 1299,
    leadTime: 22,
    minOrderQuantity: 80,
    maxOrderQuantity: 6000,
    riskLevel: 'low',
    certifications: ['CE', 'FCC', 'RoHS', 'REACH'],
    lastUpdated: new Date('2024-01-16')
  },
  {
    _id: 'prod_007',
    name: 'Sony WH-1000XM5 Headphones',
    category: 'Audio Equipment',
    supplier: 'Sony Corporation',
    origin: 'Tokyo, Japan',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery',
    unitCost: 349,
    leadTime: 16,
    minOrderQuantity: 100,
    maxOrderQuantity: 10000,
    riskLevel: 'low',
    certifications: ['CE', 'FCC', 'Bluetooth SIG'],
    lastUpdated: new Date('2024-01-11')
  },
  {
    _id: 'prod_008',
    name: 'DJI Mini 4 Pro Drone',
    category: 'Drones & UAVs',
    supplier: 'DJI Technology',
    origin: 'Shenzhen, China',
    description: 'Ultra-lightweight drone with 4K camera and obstacle avoidance',
    unitCost: 759,
    leadTime: 30,
    minOrderQuantity: 25,
    maxOrderQuantity: 2000,
    riskLevel: 'high',
    certifications: ['CE', 'FCC', 'FAA Part 107'],
    lastUpdated: new Date('2024-01-13')
  },
  {
    _id: 'prod_009',
    name: 'Nintendo Switch OLED',
    category: 'Gaming Consoles',
    supplier: 'Nintendo Co., Ltd.',
    origin: 'Kyoto, Japan',
    description: 'Handheld gaming console with 7-inch OLED screen',
    unitCost: 349,
    leadTime: 20,
    minOrderQuantity: 60,
    maxOrderQuantity: 5000,
    riskLevel: 'medium',
    certifications: ['CE', 'FCC', 'RoHS'],
    lastUpdated: new Date('2024-01-09')
  },
  {
    _id: 'prod_010',
    name: 'GoPro Hero 12 Black',
    category: 'Cameras & Video',
    supplier: 'GoPro Inc.',
    origin: 'San Mateo, USA',
    description: 'Action camera with 5.3K video and HyperSmooth 6.0 stabilization',
    unitCost: 399,
    leadTime: 12,
    minOrderQuantity: 40,
    maxOrderQuantity: 3000,
    riskLevel: 'low',
    certifications: ['CE', 'FCC', 'IP68'],
    lastUpdated: new Date('2024-01-17')
  }
];
