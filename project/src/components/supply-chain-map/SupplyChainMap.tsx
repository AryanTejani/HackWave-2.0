'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Layers, Truck, Factory, AlertTriangle, Clock, CheckCircle, XCircle, MapPin, Globe, Loader2 } from 'lucide-react';

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
  },
  {
    id: 'SUPP006',
    name: 'European Tech Solutions',
    location: { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany' },
    rating: 4.6,
    riskLevel: 'low',
    products: ['Engineering', 'Design']
  },
  {
    id: 'SUPP007',
    name: 'American Manufacturing Corp',
    location: { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' },
    rating: 4.3,
    riskLevel: 'medium',
    products: ['Assembly', 'Testing']
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
  },
  {
    id: 'SH007',
    supplierId: 'SUPP006',
    status: 'on-time',
    origin: { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany' },
    destination: { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'USA' },
    currentLocation: { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },
    product: 'Engineering Parts',
    estimatedArrival: '2025-01-22'
  },
  {
    id: 'SH008',
    supplierId: 'SUPP007',
    status: 'in-transit',
    origin: { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' },
    destination: { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan' },
    currentLocation: { lat: 21.3099, lng: -157.8581, city: 'Honolulu', country: 'USA' },
    product: 'Tech Components',
    estimatedArrival: '2025-01-16'
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

// Leaflet Map Hook - Bulletproof Implementation
const useLeafletMap = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing map...');

  useEffect(() => {
    let isCancelled = false;
    
    const loadLeaflet = async () => {
      try {
        // Step 1: Check if we're in browser environment
        if (typeof window === 'undefined') {
          throw new Error('Not in browser environment');
        }

        setLoadingMessage('Loading map resources...');

        // Step 2: Load CSS first - this is critical for proper rendering
        if (!document.querySelector('#leaflet-css')) {
          await new Promise<void>((resolve, reject) => {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            
            link.onload = () => {
              console.log('✅ Leaflet CSS loaded successfully');
              resolve();
            };
            link.onerror = () => {
              console.error('❌ Failed to load Leaflet CSS');
              reject(new Error('Failed to load Leaflet CSS'));
            };
            
            document.head.appendChild(link);
            
            // Timeout fallback
            setTimeout(() => {
              console.log('⏰ CSS loading timeout - proceeding anyway');
              resolve();
            }, 5000);
          });
        }

        if (isCancelled) return;
        setLoadingMessage('Loading map library...');

        // Step 3: Load Leaflet JS
        if (!(window as any).L) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            
            script.onload = () => {
              console.log('✅ Leaflet JS loaded successfully');
              resolve();
            };
            script.onerror = () => {
              console.error('❌ Failed to load Leaflet JS');
              reject(new Error('Failed to load Leaflet JS'));
            };
            
            document.head.appendChild(script);
            
            // Timeout fallback
            setTimeout(() => {
              console.log('⏰ JS loading timeout - failing');
              reject(new Error('Leaflet JS loading timeout'));
            }, 10000);
          });
        }

        if (isCancelled) return;
        setLoadingMessage('Preparing map...');

        // Step 4: Verify Leaflet is properly loaded
        if (!(window as any).L || !(window as any).L.map) {
          throw new Error('Leaflet not properly initialized');
        }

        // Step 5: Small delay to ensure everything is stable
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!isCancelled) {
          console.log('✅ Leaflet fully loaded and ready');
          setIsLoaded(true);
          setHasError(false);
        }

      } catch (error) {
        console.error('❌ Leaflet loading failed:', error);
        if (!isCancelled) {
          setHasError(true);
          setIsLoaded(false);
        }
      }
    };

    loadLeaflet();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { isLoaded, hasError, loadingMessage };
};

// Leaflet Map Component - Clean Implementation
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const { isLoaded, hasError, loadingMessage } = useLeafletMap();

  // Initialize map when Leaflet is ready
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const L = (window as any).L;
      
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true,
        worldCopyJump: true
      });

      // Add dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      console.log('✅ Map initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize map:', error);
    }
  }, [isLoaded]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !(window as any).L) return;

    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        map.removeLayer(marker);
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
                width: 30px;
                height: 30px;
                border-radius: 6px;
                background: ${riskConfig[supplier.riskLevel].color};
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
              " class="supplier-marker">
                🏭
              </div>
            `,
            className: 'custom-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          const marker = L.marker([supplier.location.lat, supplier.location.lng], { icon })
            .addTo(map)
            .bindPopup(`
              <div style="color: #333; font-family: system-ui;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937;">${supplier.name}</h3>
                <div style="margin: 4px 0;"><strong>📍 Location:</strong> ${supplier.location.city}, ${supplier.location.country}</div>
                <div style="margin: 4px 0;"><strong>⭐ Rating:</strong> ${supplier.rating}/5</div>
                <div style="margin: 4px 0;"><strong>🎯 Risk:</strong> <span style="color: ${riskConfig[supplier.riskLevel].color};">${riskConfig[supplier.riskLevel].label}</span></div>
                <div style="margin: 4px 0;"><strong>📦 Products:</strong> ${supplier.products.join(', ')}</div>
              </div>
            `, { maxWidth: 300 });

          marker.on('click', () => onMarkerClick(supplier));
          markersRef.current.push(marker);
        } catch (e) {
          console.error('Error adding supplier marker:', e);
        }
      });
    }

    // Add shipment routes and markers
    if (layers.routes || layers.shipments) {
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
              weight: 4,
              opacity: 0.8,
              dashArray: shipment.status === 'delivered' ? '10, 10' : undefined,
              className: 'shipment-route'
            }).addTo(map);

            markersRef.current.push(polyline);
          }

          if (layers.shipments) {
            // Current location marker (if applicable)
            if (shipment.currentLocation && shipment.status !== 'delivered') {
              const currentIcon = L.divIcon({
                html: `
                  <div style="
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: ${statusConfig[shipment.status].color};
                    border: 3px solid white;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.4);
                    cursor: pointer;
                    position: relative;
                    animation: pulse 2s infinite;
                  ">
                    <div style="
                      width: 10px;
                      height: 10px;
                      background: white;
                      border-radius: 50%;
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                    "></div>
                  </div>
                  <style>
                    @keyframes pulse {
                      0% { transform: scale(1); }
                      50% { transform: scale(1.1); }
                      100% { transform: scale(1); }
                    }
                  </style>
                `,
                className: 'current-location-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });

              const currentMarker = L.marker([shipment.currentLocation.lat, shipment.currentLocation.lng], { icon: currentIcon })
                .addTo(map)
                .bindPopup(`
                  <div style="color: #333; font-family: system-ui;">
                    <h3 style="margin: 0 0 8px 0; color: #1f2937;">🚚 Shipment ${shipment.id}</h3>
                    <div style="margin: 4px 0;"><strong>📦 Product:</strong> ${shipment.product}</div>
                    <div style="margin: 4px 0;"><strong>📊 Status:</strong> <span style="color: ${statusConfig[shipment.status].color};">${statusConfig[shipment.status].label}</span></div>
                    <div style="margin: 4px 0;"><strong>📍 Current:</strong> ${shipment.currentLocation.city || 'In Transit'}</div>
                    <div style="margin: 4px 0;"><strong>⏰ ETA:</strong> ${shipment.estimatedArrival}</div>
                    <div style="margin: 4px 0;"><strong>🛣️ Route:</strong> ${shipment.origin.city} → ${shipment.destination.city}</div>
                  </div>
                `, { maxWidth: 300 });

              currentMarker.on('click', () => onMarkerClick(shipment));
              markersRef.current.push(currentMarker);
            }

            // Destination marker
            const destIcon = L.divIcon({
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  border: 3px solid ${statusConfig[shipment.status].color};
                  background: ${shipment.status === 'delivered' ? statusConfig[shipment.status].color : 'white'};
                  transform: rotate(45deg);
                  cursor: pointer;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                "></div>
              `,
              className: 'destination-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            const destMarker = L.marker([shipment.destination.lat, shipment.destination.lng], { icon: destIcon })
              .addTo(map)
              .bindPopup(`
                <div style="color: #333; font-family: system-ui;">
                  <h3 style="margin: 0 0 8px 0; color: #1f2937;">🎯 Destination</h3>
                  <div style="margin: 4px 0;"><strong>📦 Shipment:</strong> ${shipment.id}</div>
                  <div style="margin: 4px 0;"><strong>📍 Location:</strong> ${shipment.destination.city}, ${shipment.destination.country}</div>
                  <div style="margin: 4px 0;"><strong>📊 Status:</strong> <span style="color: ${statusConfig[shipment.status].color};">${statusConfig[shipment.status].label}</span></div>
                </div>
              `, { maxWidth: 300 });

            destMarker.on('click', () => onMarkerClick(shipment));
            markersRef.current.push(destMarker);
          }
        } catch (e) {
          console.error('Error adding shipment marker:', e);
        }
      });
    }

    // Add custom CSS for markers
    if (!document.querySelector('#custom-marker-styles')) {
      const style = document.createElement('style');
      style.id = 'custom-marker-styles';
      style.textContent = `
        .supplier-marker:hover {
          transform: scale(1.1) !important;
          z-index: 1000 !important;
        }
        .current-location-marker:hover {
          transform: scale(1.2) !important;
        }
        .destination-marker:hover {
          transform: rotate(45deg) scale(1.2) !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .leaflet-popup-tip {
          background: white;
        }
      `;
      document.head.appendChild(style);
    }

  }, [suppliers, shipments, layers, onMarkerClick, isLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Error state
  if (hasError) {
    return (
      <div className="w-full h-full rounded-lg bg-red-900/20 border border-red-500/30 flex items-center justify-center">
        <div className="text-center text-red-400">
          <XCircle className="h-12 w-12 mx-auto mb-4" />
          <div className="text-xl font-semibold mb-2">Map Failed to Load</div>
          <div className="text-sm mb-4">Unable to load map resources from CDN</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="w-full h-full rounded-lg bg-slate-800/50 flex items-center justify-center">
        <div className="text-center text-slate-300">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
          <div className="text-xl font-semibold mb-2">Loading Interactive Map</div>
          <div className="text-sm text-slate-400">{loadingMessage}</div>
          <div className="mt-4 w-64 bg-slate-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Map container
  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
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
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute top-4 left-4 z-[1000] w-80 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-lg text-white">
            <Layers className="h-5 w-5 text-blue-400" />
            Map Controls
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white/20 p-1 rounded transition-colors"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Search suppliers, shipments..."
                  className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="all" className="bg-gray-800">All Statuses</option>
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
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="all" className="bg-gray-800">All Risk Levels</option>
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
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
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
        )}
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
    <div className="absolute top-4 right-4 z-[1000] w-80 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg text-white font-semibold">
              {isSupplier ? selectedItem.name : `Shipment ${selectedItem.id}`}
            </h3>
            <p className="text-sm text-gray-300">
              {isSupplier ? 'Supplier Details' : 'Shipment Information'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 p-2 rounded-full text-xl transition-colors ml-2"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          {isSupplier ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">Rating</span>
                  <span className="font-medium text-white">⭐ {selectedItem.rating}/5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">Risk Level</span>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${riskConfig[selectedItem.riskLevel].color}20`,
                      color: riskConfig[selectedItem.riskLevel].color,
                      border: `1px solid ${riskConfig[selectedItem.riskLevel].color}`
                    }}
                  >
                    {riskConfig[selectedItem.riskLevel].label}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">Location</span>
                  <span className="font-medium text-right text-white">
                    📍 {selectedItem.location.city}, {selectedItem.location.country}
                  </span>
                </div>
              </div>
              <div className="border-t border-white/20 pt-4">
                <span className="text-sm font-medium text-white mb-3 block">Products & Services</span>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.products.map((product: string, index: number) => (
                    <span key={index} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/30">
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">Status</span>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2"
                    style={{ 
                      backgroundColor: `${statusConfig[selectedItem.status].color}20`,
                      color: statusConfig[selectedItem.status].color,
                      border: `1px solid ${statusConfig[selectedItem.status].color}`
                    }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: statusConfig[selectedItem.status].color }}
                    ></div>
                    {statusConfig[selectedItem.status].label}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">Product</span>
                  <span className="font-medium text-white">📦 {selectedItem.product}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">ETA</span>
                  <span className="font-medium text-white">⏰ {selectedItem.estimatedArrival}</span>
                </div>
              </div>
              <div className="border-t border-white/20 pt-4">
                <span className="text-sm font-medium text-white mb-3 block">Route Information</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <div className="text-xs">
                      <span className="text-blue-400 font-medium">Origin:</span>
                      <span className="text-white ml-2">{selectedItem.origin.city}, {selectedItem.origin.country}</span>
                    </div>
                  </div>
                  {selectedItem.currentLocation && selectedItem.status !== 'delivered' && (
                    <div className="flex items-center gap-3 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                      <div className="text-xs">
                        <span className="text-yellow-400 font-medium">Current:</span>
                        <span className="text-white ml-2">{selectedItem.currentLocation.city}, {selectedItem.currentLocation.country}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="w-3 h-3 bg-green-400 transform rotate-45"></div>
                    <div className="text-xs">
                      <span className="text-green-400 font-medium">Destination:</span>
                      <span className="text-white ml-2">{selectedItem.destination.city}, {selectedItem.destination.country}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Stats Dashboard Component
const StatsOverlay = ({ suppliers, shipments }: { suppliers: Supplier[]; shipments: Shipment[] }) => {
  const stats = useMemo(() => {
    const inTransit = shipments.filter(s => s.status === 'in-transit' || s.status === 'on-time').length;
    const delayed = shipments.filter(s => s.status === 'delayed' || s.status === 'stuck').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const lowRisk = suppliers.filter(s => s.riskLevel === 'low').length;
    const totalRisk = suppliers.filter(s => s.riskLevel === 'medium' || s.riskLevel === 'high').length;

    return {
      suppliers: suppliers.length,
      shipments: shipments.length,
      inTransit,
      delayed,
      delivered,
      lowRisk,
      totalRisk,
      onTimePercent: shipments.length > 0 ? Math.round(((inTransit + delivered) / shipments.length) * 100) : 0
    };
  }, [suppliers, shipments]);

  return (
    <div className="absolute bottom-4 right-4 z-[1000]">
      <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">{stats.suppliers}</div>
            <div className="text-xs text-green-300">Active Suppliers</div>
            <div className="text-xs text-gray-400 mt-1">{stats.lowRisk} low risk</div>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400">{stats.shipments}</div>
            <div className="text-xs text-blue-300">Total Shipments</div>
            <div className="text-xs text-gray-400 mt-1">{stats.onTimePercent}% on track</div>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400">{stats.inTransit}</div>
            <div className="text-xs text-yellow-300">In Transit</div>
            <div className="text-xs text-gray-400 mt-1">Active routes</div>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">{stats.delayed}</div>
            <div className="text-xs text-red-300">At Risk</div>
            <div className="text-xs text-gray-400 mt-1">Need attention</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Supply Chain Map Component
const SupplyChainMap = () => {
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
        shipment.destination.city?.toLowerCase().includes(term) ||
        shipment.currentLocation?.city?.toLowerCase().includes(term)
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
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
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
      <StatsOverlay 
        suppliers={filteredData.suppliers}
        shipments={filteredData.shipments}
      />

      {/* Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[999] bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-3">
        <div className="flex items-center gap-3 text-white">
          <Globe className="h-6 w-6 text-blue-400" />
          <div>
            <h1 className="text-lg font-semibold">Global Supply Chain Dashboard</h1>
            <p className="text-xs text-gray-300">Real-time tracking and monitoring</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainMap;