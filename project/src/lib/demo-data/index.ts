export * from './products';
export * from './shipments';
export * from './risk-alerts';
export * from './what-if-scenarios';

// Demo data utilities
export const getRandomDemoData = () => {
  return {
    products: Math.floor(Math.random() * 50) + 10,
    shipments: Math.floor(Math.random() * 100) + 20,
    alerts: Math.floor(Math.random() * 15) + 3,
    totalValue: Math.floor(Math.random() * 5000000) + 1000000
  };
};

export const getDemoStats = () => {
  return {
    totalShipments: 156,
    onTimeDeliveries: 89,
    delayedShipments: 45,
    stuckShipments: 12,
    deliveredShipments: 10,
    totalValue: 2845000,
    averageDeliveryTime: 18.5,
    riskScore: 7.2
  };
};
