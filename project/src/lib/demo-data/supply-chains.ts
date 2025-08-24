export interface DemoSupplyChain {
  productName: string;
  supplier: {
    name: string;
    country: string;
    region: string;
  };
  shipment: {
    origin: string;
    destination: string;
    status: 'In Transit' | 'Delivered' | 'Delayed';
  };
  riskFactors: {
    politicalRisk: number;
    supplierReliability: number;
    transportRisk: number;
  };
}

export const demoSupplyChains: DemoSupplyChain[] = [
  {
    productName: 'iPhone 15 Pro Max',
    supplier: {
      name: 'Foxconn Technology Group',
      country: 'China',
      region: 'Asia Pacific'
    },
    shipment: {
      origin: 'Shenzhen, China',
      destination: 'Rotterdam, Netherlands',
      status: 'In Transit'
    },
    riskFactors: {
      politicalRisk: 35,
      supplierReliability: 85,
      transportRisk: 45
    }
  },
  {
    productName: 'MacBook Air M3',
    supplier: {
      name: 'Quanta Computer',
      country: 'Taiwan',
      region: 'Asia Pacific'
    },
    shipment: {
      origin: 'Taipei, Taiwan',
      destination: 'Los Angeles, USA',
      status: 'In Transit'
    },
    riskFactors: {
      politicalRisk: 25,
      supplierReliability: 90,
      transportRisk: 30
    }
  },
  {
    productName: 'AirPods Pro 3rd Gen',
    supplier: {
      name: 'Luxshare Precision Industry',
      country: 'China',
      region: 'Asia Pacific'
    },
    shipment: {
      origin: 'Dongguan, China',
      destination: 'Hamburg, Germany',
      status: 'Delayed'
    },
    riskFactors: {
      politicalRisk: 40,
      supplierReliability: 75,
      transportRisk: 60
    }
  },
  {
    productName: 'iPad Air 6th Gen',
    supplier: {
      name: 'Pegatron Corporation',
      country: 'Taiwan',
      region: 'Asia Pacific'
    },
    shipment: {
      origin: 'Taipei, Taiwan',
      destination: 'New York, USA',
      status: 'In Transit'
    },
    riskFactors: {
      politicalRisk: 20,
      supplierReliability: 88,
      transportRisk: 25
    }
  },
  {
    productName: 'Apple Watch Series 9',
    supplier: {
      name: 'Wistron Corporation',
      country: 'Taiwan',
      region: 'Asia Pacific'
    },
    shipment: {
      origin: 'Hsinchu, Taiwan',
      destination: 'London, UK',
      status: 'Delivered'
    },
    riskFactors: {
      politicalRisk: 15,
      supplierReliability: 92,
      transportRisk: 20
    }
  }
];
