import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Layers, Truck, Factory, AlertTriangle, Clock, CheckCircle, XCircle, MapPin, Globe } from 'lucide-react';

// Types
interface Location {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

interface Supplier {
  id: string;
  name: string;
  location: Location;
  rating: number;
  riskLevel: 'low' | 'medium' | 'high';
  products: string[];
}

interface Shipment {
  id: string;
  supplierId: string;
  status: 'in-transit' | 'delayed' | 'delivered' | 'on-time' | 'stuck';
  origin: Location;
  destination: Location;
  currentLocation?: Location;
  product: string;
  estimatedArrival: string;
}

interface MapFilters {
  status: string;
  riskLevel: string;
  supplier: string;
}

interface MapLayers {
  suppliers: boolean;
  shipments: boolean;
  routes: boolean;
}

// Demo data
const demoSuppliers: Supplier[] = [
  { 
    id: 'SUPP001', 
    name: 'TechFlow Manufacturing Ltd.', 
    location: { lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'China' }, 
    rating: 4.8, 
    riskLevel: 'low', 
    products: ['Electronics', 'Components'] 
  },
  { 
    id: 'SUPP002', 
    name: 'Global Components Inc.', 
    location: { lat: 25.0330, lng: 121.5654, city: 'Taipei', country: 'Taiwan' }, 
    rating: 4.5, 
    riskLevel: 'medium', 
    products: ['Semiconductors', 'Hardware'] 
  },
  { 
    id: 'SUPP003', 
    name: 'Precision Parts Co.', 
    location: { lat: 22.3193, lng: 114.1694, city: 'Hong Kong', country: 'Hong Kong' }, 
    rating: 4.7, 
    riskLevel: 'low', 
    products: ['Precision Components'] 
  },
  { 
    id: 'SUPP004', 
    name: 'Assembly Masters', 
    location: { lat: 23.1291, lng: 113.2644, city: 'Guangzhou', country: 'China' }, 
    rating: 4.2, 
    riskLevel: 'medium', 
    products: ['Final Assembly'] 
  },
  { 
    id: 'SUPP005', 
    name: 'Quality First Ltd.', 
    location: { lat: 22.5431, lng: 114.0579, city: 'Shenzhen', country: 'China' }, 
    rating: 4.9, 
    riskLevel: 'low', 
    products: ['Quality Control', 'Testing'] 
  }
];

const demoShipments: Shipment[] = [
  { 
    id: 'SH001', 
    supplierId: 'SUPP001', 
    status: 'in-transit', 
    origin: { lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'China' }, 
    destination: { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' }, 
    currentLocation: { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan' }, 
    product: 'iPhone Components', 
    estimatedArrival: '2025-01-15' 
  },
  { 
    id: 'SH002', 
    supplierId: 'SUPP002', 
    status: 'delayed', 
    origin: { lat: 25.0330, lng: 121.5654, city: 'Taipei', country: 'Taiwan' }, 
    destination: { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' }, 
    currentLocation: { lat: 37.5665, lng: 126.9780, city: 'Seoul', country: 'South Korea' }, 
    product: 'Semiconductors', 
    estimatedArrival: '2025-01-18' 
  },
  { 
    id: 'SH003', 
    supplierId: 'SUPP003', 
    status: 'delivered', 
    origin: { lat: 22.3193, lng: 114.1694, city: 'Hong Kong', country: 'Hong Kong' }, 
    destination: { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' }, 
    currentLocation: { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' }, 
    product: 'Precision Parts', 
    estimatedArrival: '2025-01-10' 
  },
  { 
    id: 'SH004', 
    supplierId: 'SUPP004', 
    status: 'on-time', 
    origin: { lat: 23.1291, lng: 113.2644, city: 'Guangzhou', country: 'China' }, 
    destination: { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany' }, 
    currentLocation: { lat: 55.7558, lng: 37.6173, city: 'Moscow', country: 'Russia' }, 
    product: 'MacBook Assembly', 
    estimatedArrival: '2025-01-20' 
  },
  { 
    id: 'SH005', 
    supplierId: 'SUPP005', 
    status: 'stuck', 
    origin: { lat: 22.5431, lng: 114.0579, city: 'Shenzhen', country: 'China' }, 
    destination: { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France' }, 
    currentLocation: { lat: 26.0667, lng: 50.5577, city: 'Manama', country: 'Bahrain' }, 
    product: 'AirPods', 
    estimatedArrival: '2025-01-25' 
  },
  { 
    id: 'SH006', 
    supplierId: 'SUPP001', 
    status: 'in-transit', 
    origin: { lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'China' }, 
    destination: { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia' }, 
    currentLocation: { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore' }, 
    product: 'Display Panels', 
    estimatedArrival: '2025-01-12' 
  }
];

// Status configuration
const statusConfig = {
  'in-transit': { color: '#3B82F6', icon: Truck, label: 'In Transit' },
  'delayed': { color: '#F59E0B', icon: AlertTriangle, label: 'Delayed' },
  'delivered': { color: '#10B981', icon: CheckCircle, label: 'Delivered' },
  'on-time': { color: '#22C55E', icon: Clock, label: 'On Time' },
  'stuck': { color: '#EF4444', icon: XCircle, label: 'Stuck' }
};

const riskConfig = {
  'low': { color: '#10B981', label: 'Low Risk' },
  'medium': { color: '#F59E0B', label: 'Medium Risk' },
  'high': { color: '#EF4444', label: 'High Risk' }
};

// Leaflet Map Component - FIXED VERSION
const LeafletMap = ({ 
  suppliers, 
  shipments, 
  layers, 
  onMarkerClick 
}: {
  suppliers: Supplier[];
  shipments: Shipment[];
  layers: MapLayers;
  onMarkerClick: (item: Supplier | Shipment) => void;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadLeaflet = async () => {
      try {
        // Ensure we're in browser environment
        if (typeof window === 'undefined' || !mapRef.current) {
          return;
        }

        // Add CSS if not already present
        if (!document.querySelector('#leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
          
          // Wait for CSS to load
          await new Promise((resolve) => {
            link.onload = resolve;
            setTimeout(resolve, 1000); // Fallback timeout
          });
        }

        // Load Leaflet JS if not already loaded
        if (!(window as any).L) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Leaflet'));
            document.head.appendChild(script);
          });
        }

        // Small delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize map if everything is ready and component is still mounted
        if ((window as any).L && !leafletMapRef.current && mapRef.current && isMounted) {
          const L = (window as any).L;
          
          leafletMapRef.current = L.map(mapRef.current, {
            preferCanvas: true,
            zoomControl: true,
            attributionControl: true
          }).setView([20, 0], 2);

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
          }).addTo(leafletMapRef.current);

          // Apply dark theme
          const darkStyle = `
            .leaflet-container {
              background: #1a1a1a;
              filter: invert(1) hue-rotate(180deg);
            }
            .leaflet-control-container {
              filter: invert(1) hue-rotate(180deg);
            }
            .leaflet-popup-content-wrapper {
              filter: invert(1) hue-rotate(180deg);
            }
          `;
          
          if (!document.querySelector('#leaflet-dark-style')) {
            const style = document.createElement('style');
            style.id = 'leaflet-dark-style';
            style.textContent = darkStyle;
            document.head.appendChild(style);
          }

          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    // Add a small delay before loading to ensure DOM is ready
    const timeoutId = setTimeout(loadLeaflet, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!leafletMapRef.current || !(window as any).L || isLoading) return;

    const L = (window as any).L;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        if (leafletMapRef.current && marker) {
          leafletMapRef.current.removeLayer(marker);
        }
      } catch (e) {
        // Ignore removal errors
      }
    });
    markersRef.current = [];

    // Add supplier markers
    if (layers.suppliers) {
      suppliers.forEach(supplier => {
        try {
          const icon = L.divIcon({
            html: `
              <div style="
                width: 24px;
                height: 24px;
                border-radius: 4px;
                background: ${riskConfig[supplier.riskLevel].color};
                border: 2px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: white;
                font-weight: bold;
                cursor: pointer;
              ">
                🏭
              </div>
            `,
            className: 'supplier-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([supplier.location.lat, supplier.location.lng], { icon })
            .addTo(leafletMapRef.current)
            .bindPopup(`
              <div style="color: black;">
                <h3>${supplier.name}</h3>
                <p><strong>Location:</strong> ${supplier.location.city}, ${supplier.location.country}</p>
                <p><strong>Rating:</strong> ⭐ ${supplier.rating}/5</p>
                <p><strong>Risk:</strong> ${riskConfig[supplier.riskLevel].label}</p>
                <p><strong>Products:</strong> ${supplier.products.join(', ')}</p>
              </div>
            `);

          marker.on('click', () => onMarkerClick(supplier));
          markersRef.current.push(marker);
        } catch (e) {
          console.error('Error adding supplier marker:', e);
        }
      });
    }

    // Add shipment markers and routes
    if (layers.shipments || layers.routes) {
      shipments.forEach(shipment => {
        try {
          // Add route line
          if (layers.routes) {
            const routePoints: [number, number][] = [
              [shipment.origin.lat, shipment.origin.lng],
              ...(shipment.currentLocation && shipment.status !== 'delivered' 
                ? [[shipment.currentLocation.lat, shipment.currentLocation.lng] as [number, number]] 
                : []
              ),
              [shipment.destination.lat, shipment.destination.lng]
            ];

            const polyline = L.polyline(routePoints, {
              color: statusConfig[shipment.status].color,
              weight: 3,
              opacity: 0.8,
              dashArray: shipment.status === 'delivered' ? '10, 10' : undefined
            }).addTo(leafletMapRef.current);

            markersRef.current.push(polyline);
          }

          if (layers.shipments) {
            // Current location marker (if applicable)
            if (shipment.currentLocation && shipment.status !== 'delivered') {
              const currentIcon = L.divIcon({
                html: `
                  <div style="
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: ${statusConfig[shipment.status].color};
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    cursor: pointer;
                  ">
                    <div style="
                      width: 8px;
                      height: 8px;
                      background: white;
                      border-radius: 50%;
                      margin: 3px auto;
                      margin-top: 3px;
                    "></div>
                  </div>
                `,
                className: 'current-location-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              });

              const currentMarker = L.marker([shipment.currentLocation.lat, shipment.currentLocation.lng], { icon: currentIcon })
                .addTo(leafletMapRef.current)
                .bindPopup(`
                  <div style="color: black;">
                    <h3>Shipment ${shipment.id}</h3>
                    <p><strong>Product:</strong> ${shipment.product}</p>
                    <p><strong>Status:</strong> ${statusConfig[shipment.status].label}</p>
                    <p><strong>Current:</strong> ${shipment.currentLocation.city || 'In Transit'}</p>
                    <p><strong>ETA:</strong> ${shipment.estimatedArrival}</p>
                    <p><strong>Route:</strong> ${shipment.origin.city} → ${shipment.destination.city}</p>
                  </div>
                `);

              currentMarker.on('click', () => onMarkerClick(shipment));
              markersRef.current.push(currentMarker);
            }
          }
        } catch (e) {
          console.error('Error adding shipment marker:', e);
        }
      });
    }
  }, [suppliers, shipments, layers, onMarkerClick, isLoading]);

  if (hasError) {
    return (
      <div className="w-full h-full rounded-lg bg-red-900/20 border border-red-500/30 flex items-center justify-center">
        <div className="text-center text-red-400">
          <XCircle className="h-8 w-8 mx-auto mb-2" />
          <div className="text-lg font-semibold mb-2">Map Failed to Load</div>
          <div className="text-sm">Please refresh the page to try again</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full rounded-lg bg-slate-800/50 flex items-center justify-center">
        <div className="text-center text-slate-300">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-sm">Loading interactive map...</div>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
};

// Map Controls Component
const MapControls = ({ 
  onSearch, 
  onFilter, 
  onLayerToggle, 
  filters, 
  layers,
  suppliers 
}: {
  onSearch: (term: string) => void;
  onFilter: (type: keyof MapFilters, value: string) => void;
  onLayerToggle: (layer: keyof MapLayers) => void;
  filters: MapFilters;
  layers: MapLayers;
  suppliers: Supplier[];
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="absolute top-4 left-4 z-[1000] w-80 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg">
      <div className="p-4">
        <div className="flex items-center gap-2 text-lg text-white mb-4">
          <Layers className="h-5 w-5" />
          Map Controls
        </div>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search suppliers, shipments..."
                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  onSearch(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            {/* Filters */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white">Filters</label>
              
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300">Shipment Status</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => onFilter('status', e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <option key={status} value={status} className="bg-gray-800">
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Risk Level Filter */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300">Risk Level</label>
                <select 
                  value={filters.riskLevel} 
                  onChange={(e) => onFilter('riskLevel', e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Risk Levels</option>
                  {Object.entries(riskConfig).map(([risk, config]) => (
                    <option key={risk} value={risk} className="bg-gray-800">
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            {/* Layer Toggle */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white">Map Layers</label>
              <div className="space-y-2">
                {Object.entries(layers).map(([layer, enabled]) => (
                  <div key={layer} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={layer}
                      checked={enabled}
                      onChange={() => onLayerToggle(layer as keyof MapLayers)}
                      className="rounded border-white/20"
                    />
                    <label htmlFor={layer} className="text-sm font-medium text-white capitalize">
                      {layer}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Info Panel Component
const InfoPanel = ({ 
  selectedItem, 
  onClose 
}: { 
  selectedItem: Supplier | Shipment | null; 
  onClose: () => void; 
}) => {
  if (!selectedItem) return null;

  const isSupplier = 'rating' in selectedItem;

  return (
    <div className="absolute top-4 right-4 z-[1000] w-80 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg text-white font-semibold">
              {isSupplier ? selectedItem.name : `Shipment ${selectedItem.id}`}
            </h3>
            <p className="text-sm text-gray-300">
              {isSupplier ? 'Supplier Details' : 'Shipment Information'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 p-1 rounded"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          {isSupplier ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Rating</span>
                  <span className="font-medium text-white">⭐ {selectedItem.rating}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Risk Level</span>
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      borderColor: riskConfig[selectedItem.riskLevel].color,
                      color: riskConfig[selectedItem.riskLevel].color,
                      border: `1px solid ${riskConfig[selectedItem.riskLevel].color}`
                    }}
                  >
                    {riskConfig[selectedItem.riskLevel].label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Location</span>
                  <span className="font-medium text-right text-white">
                    {selectedItem.location.city}, {selectedItem.location.country}
                  </span>
                </div>
              </div>
              <div className="border-t border-white/20 pt-4">
                <span className="text-sm font-medium text-white">Products</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedItem.products.map((product: string, index: number) => (
                    <span key={index} className="bg-white/20 text-white px-2 py-1 rounded text-xs">
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Status</span>
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      borderColor: statusConfig[selectedItem.status].color,
                      color: statusConfig[selectedItem.status].color,
                      border: `1px solid ${statusConfig[selectedItem.status].color}`
                    }}
                  >
                    {statusConfig[selectedItem.status].label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Product</span>
                  <span className="font-medium text-white">{selectedItem.product}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">ETA</span>
                  <span className="font-medium text-white">{selectedItem.estimatedArrival}</span>
                </div>
              </div>
              <div className="border-t border-white/20 pt-4">
                <span className="text-sm font-medium text-white">Route Information</span>
                <div className="text-xs text-gray-300 space-y-1 mt-2">
                  <div><span className="text-blue-400">Origin:</span> {selectedItem.origin.city}, {selectedItem.origin.country}</div>
                  <div><span className="text-green-400">Destination:</span> {selectedItem.destination.city}, {selectedItem.destination.country}</div>
                  {selectedItem.currentLocation && (
                    <div><span className="text-yellow-400">Current:</span> {selectedItem.currentLocation.city}, {selectedItem.currentLocation.country}</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Supply Chain Map Component
const SupplyChainWorldMap = () => {
  const [filters, setFilters] = useState<MapFilters>({
    status: 'all',
    riskLevel: 'all',
    supplier: 'all'
  });

  const [layers, setLayers] = useState<MapLayers>({
    suppliers: true,
    shipments: true,
    routes: true
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Supplier | Shipment | null>(null);

  // Filter data based on current filters and search
  const filteredData = useMemo(() => {
    let filteredSuppliers = demoSuppliers;
    let filteredShipments = demoShipments;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredSuppliers = filteredSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(term) ||
        supplier.location.city?.toLowerCase().includes(term) ||
        supplier.location.country?.toLowerCase().includes(term) ||
        supplier.products.some(product => product.toLowerCase().includes(term))
      );
      filteredShipments = filteredShipments.filter(shipment =>
        shipment.id.toLowerCase().includes(term) ||
        shipment.product.toLowerCase().includes(term) ||
        shipment.origin.city?.toLowerCase().includes(term) ||
        shipment.destination.city?.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filters.riskLevel !== 'all') {
      filteredSuppliers = filteredSuppliers.filter(supplier => supplier.riskLevel === filters.riskLevel);
    }

    if (filters.status !== 'all') {
      filteredShipments = filteredShipments.filter(shipment => shipment.status === filters.status);
    }

    if (filters.supplier !== 'all') {
      filteredShipments = filteredShipments.filter(shipment => shipment.supplierId === filters.supplier);
    }

    return { suppliers: filteredSuppliers, shipments: filteredShipments };
  }, [filters, searchTerm]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFilter = useCallback((type: keyof MapFilters, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  }, []);

  const handleLayerToggle = useCallback((layer: keyof MapLayers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const handleMarkerClick = useCallback((item: Supplier | Shipment) => {
    setSelectedItem(item);
  }, []);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border bg-slate-900">
      {/* Leaflet World Map */}
      <LeafletMap
        suppliers={filteredData.suppliers}
        shipments={filteredData.shipments}
        layers={layers}
        onMarkerClick={handleMarkerClick}
      />

      {/* Map Controls */}
      <MapControls
        onSearch={handleSearch}
        onFilter={handleFilter}
        onLayerToggle={handleLayerToggle}
        filters={filters}
        layers={layers}
        suppliers={demoSuppliers}
      />

      {/* Info Panel */}
      <InfoPanel
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Stats Overlay */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{filteredData.suppliers.length}</div>
              <div className="text-xs text-gray-300">Active Suppliers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{filteredData.shipments.length}</div>
              <div className="text-xs text-gray-300">Total Shipments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {filteredData.shipments.filter(s => s.status === 'in-transit' || s.status === 'on-time').length}
              </div>
              <div className="text-xs text-gray-300">In Transit</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {filteredData.shipments.filter(s => s.status === 'delayed' || s.status === 'stuck').length}
              </div>
              <div className="text-xs text-gray-300">Delayed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainWorldMap;