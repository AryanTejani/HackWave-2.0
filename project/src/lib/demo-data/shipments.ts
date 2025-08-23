import { demoProducts } from './products';

export interface DemoShipment {
  _id: string;
  productId: {
    _id: string;
    name: string;
    category: string;
    supplier: string;
  };
  origin: string;
  destination: string;
  status: 'On-Time' | 'Delayed' | 'Stuck' | 'Delivered';
  expectedDelivery: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  quantity: number;
  totalValue: number;
  shippingMethod: 'Air' | 'Sea' | 'Land' | 'Express';
  carrier: string;
  createdAt: Date;
  updatedAt: Date;
  currentLocation?: string;
  estimatedArrival?: Date;
  riskFactors: string[];
}

export const demoShipments: DemoShipment[] = [
  {
    _id: 'ship_001',
    productId: {
      _id: 'prod_001',
      name: 'iPhone 15 Pro Max',
      category: 'Consumer Electronics',
      supplier: 'Foxconn Technology Group'
    },
    origin: 'Shenzhen, China',
    destination: 'Rotterdam, Netherlands',
    status: 'Delayed',
    expectedDelivery: new Date('2024-02-15'),
    quantity: 500,
    totalValue: 449500,
    shippingMethod: 'Sea',
    carrier: 'Maersk Line',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-28'),
    currentLocation: 'Red Sea - Port Said',
    estimatedArrival: new Date('2024-02-22'),
    riskFactors: ['Red Sea tensions', 'Port congestion', 'Weather delays']
  },
  {
    _id: 'ship_002',
    productId: {
      _id: 'prod_002',
      name: 'MacBook Air M3',
      category: 'Computers & Laptops',
      supplier: 'Quanta Computer'
    },
    origin: 'Taipei, Taiwan',
    destination: 'Los Angeles, USA',
    status: 'On-Time',
    expectedDelivery: new Date('2024-02-10'),
    quantity: 200,
    totalValue: 239800,
    shippingMethod: 'Air',
    carrier: 'FedEx Express',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-30'),
    currentLocation: 'In Transit - Pacific Ocean',
    estimatedArrival: new Date('2024-02-10'),
    riskFactors: []
  },
  {
    _id: 'ship_003',
    productId: {
      _id: 'prod_003',
      name: 'AirPods Pro 3rd Gen',
      category: 'Audio Equipment',
      supplier: 'Luxshare Precision Industry'
    },
    origin: 'Dongguan, China',
    destination: 'Hamburg, Germany',
    status: 'Stuck',
    expectedDelivery: new Date('2024-02-05'),
    quantity: 1000,
    totalValue: 249000,
    shippingMethod: 'Sea',
    carrier: 'Hapag-Lloyd',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-29'),
    currentLocation: 'Customs Hold - Hamburg Port',
    estimatedArrival: new Date('2024-02-12'),
    riskFactors: ['Customs clearance issues', 'Documentation problems', 'Import restrictions']
  },
  {
    _id: 'ship_004',
    productId: {
      _id: 'prod_004',
      name: 'iPad Air 6th Gen',
      category: 'Tablets',
      supplier: 'Pegatron Corporation'
    },
    origin: 'Shanghai, China',
    destination: 'New York, USA',
    status: 'Delivered',
    expectedDelivery: new Date('2024-01-30'),
    actualDelivery: new Date('2024-01-28'),
    quantity: 300,
    totalValue: 179700,
    shippingMethod: 'Air',
    carrier: 'DHL Express',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-28'),
    riskFactors: []
  },
  {
    _id: 'ship_005',
    productId: {
      _id: 'prod_005',
      name: 'Apple Watch Series 9',
      category: 'Wearables',
      supplier: 'Compal Electronics'
    },
    origin: 'Chongqing, China',
    destination: 'London, UK',
    status: 'On-Time',
    expectedDelivery: new Date('2024-02-12'),
    quantity: 400,
    totalValue: 159600,
    shippingMethod: 'Sea',
    carrier: 'CMA CGM',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-30'),
    currentLocation: 'In Transit - Indian Ocean',
    estimatedArrival: new Date('2024-02-12'),
    riskFactors: []
  },
  {
    _id: 'ship_006',
    productId: {
      _id: 'prod_006',
      name: 'Samsung Galaxy S24 Ultra',
      category: 'Consumer Electronics',
      supplier: 'Samsung Electronics'
    },
    origin: 'Gumi, South Korea',
    destination: 'Toronto, Canada',
    status: 'Delayed',
    expectedDelivery: new Date('2024-02-08'),
    quantity: 150,
    totalValue: 194850,
    shippingMethod: 'Air',
    carrier: 'UPS Airlines',
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-29'),
    currentLocation: 'Weather Delay - Anchorage',
    estimatedArrival: new Date('2024-02-15'),
    riskFactors: ['Weather conditions', 'Flight cancellations', 'Airport congestion']
  },
  {
    _id: 'ship_007',
    productId: {
      _id: 'prod_007',
      name: 'Sony WH-1000XM5 Headphones',
      category: 'Audio Equipment',
      supplier: 'Sony Corporation'
    },
    origin: 'Tokyo, Japan',
    destination: 'Sydney, Australia',
    status: 'On-Time',
    expectedDelivery: new Date('2024-02-14'),
    quantity: 250,
    totalValue: 87250,
    shippingMethod: 'Sea',
    carrier: 'Mitsui O.S.K. Lines',
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-30'),
    currentLocation: 'In Transit - Pacific Ocean',
    estimatedArrival: new Date('2024-02-14'),
    riskFactors: []
  },
  {
    _id: 'ship_008',
    productId: {
      _id: 'prod_008',
      name: 'DJI Mini 4 Pro Drone',
      category: 'Drones & UAVs',
      supplier: 'DJI Technology'
    },
    origin: 'Shenzhen, China',
    destination: 'Dubai, UAE',
    status: 'Stuck',
    expectedDelivery: new Date('2024-02-03'),
    quantity: 100,
    totalValue: 75900,
    shippingMethod: 'Air',
    carrier: 'Emirates SkyCargo',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-29'),
    currentLocation: 'Security Hold - Dubai Airport',
    estimatedArrival: new Date('2024-02-18'),
    riskFactors: ['Security screening', 'Regulatory compliance', 'Documentation review']
  },
  {
    _id: 'ship_009',
    productId: {
      _id: 'prod_009',
      name: 'Nintendo Switch OLED',
      category: 'Gaming Consoles',
      supplier: 'Nintendo Co., Ltd.'
    },
    origin: 'Kyoto, Japan',
    destination: 'São Paulo, Brazil',
    status: 'Delayed',
    expectedDelivery: new Date('2024-02-06'),
    quantity: 180,
    totalValue: 62820,
    shippingMethod: 'Sea',
    carrier: 'NYK Line',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-28'),
    currentLocation: 'Port Congestion - Santos',
    estimatedArrival: new Date('2024-02-20'),
    riskFactors: ['Port congestion', 'Labor strikes', 'Infrastructure issues']
  },
  {
    _id: 'ship_010',
    productId: {
      _id: 'prod_010',
      name: 'GoPro Hero 12 Black',
      category: 'Cameras & Video',
      supplier: 'GoPro Inc.'
    },
    origin: 'San Mateo, USA',
    destination: 'Singapore',
    status: 'On-Time',
    expectedDelivery: new Date('2024-02-16'),
    quantity: 120,
    totalValue: 47880,
    shippingMethod: 'Express',
    carrier: 'FedEx Express',
    createdAt: new Date('2024-01-27'),
    updatedAt: new Date('2024-01-30'),
    currentLocation: 'In Transit - Pacific Ocean',
    estimatedArrival: new Date('2024-02-16'),
    riskFactors: []
  }
];
