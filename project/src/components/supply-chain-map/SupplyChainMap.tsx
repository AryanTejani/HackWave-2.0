"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Layers, Truck, Factory, AlertTriangle, Clock, CheckCircle, XCircle, MapPin, Globe } from 'lucide-react';

// Extend Window interface for Leaflet
declare global {
  interface Window {
    L: any;
  }
}
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

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

// Demo data with realistic global locations
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
  },
  { 
    id: 'SH007', 
    supplierId: 'SUPP002', 
    status: 'on-time', 
    origin: { lat: 25.0330, lng: 121.5654, city: 'Taipei', country: 'Taiwan' }, 
    destination: { lat: 19.0760, lng: 72.8777, city: 'Mumbai', country: 'India' }, 
    currentLocation: { lat: 13.0827, lng: 80.2707, city: 'Chennai', country: 'India' }, 
    product: 'Memory Chips', 
    estimatedArrival: '2025-01-16' 
  },
  { 
    id: 'SH008', 
    supplierId: 'SUPP003', 
    status: 'in-transit', 
    origin: { lat: 22.3193, lng: 114.1694, city: 'Hong Kong', country: 'Hong Kong' }, 
    destination: { lat: -23.5505, lng: -46.6333, city: 'São Paulo', country: 'Brazil' }, 
    currentLocation: { lat: 25.2048, lng: 55.2708, city: 'Dubai', country: 'UAE' }, 
    product: 'Sensors', 
    estimatedArrival: '2025-01-22' 
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

// Leaflet Map Component using CDN
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
     if (!mapRef.current || typeof window === 'undefined') return;

     // Load Leaflet dynamically
     const loadLeaflet = async () => {
       try {
         // Add Leaflet CSS
         if (!document.querySelector('#leaflet-css')) {
           const link = document.createElement('link');
           link.id = 'leaflet-css';
           link.rel = 'stylesheet';
           link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
           document.head.appendChild(link);
         }

         // Add Leaflet JS
         if (!window.L) {
           const script = document.createElement('script');
           script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
           await new Promise((resolve, reject) => {
             script.onload = resolve;
             script.onerror = reject;
             document.head.appendChild(script);
           });
         }

         // Wait a bit for Leaflet to fully initialize
         await new Promise(resolve => setTimeout(resolve, 100));

         // Initialize map
         if (window.L && !leafletMapRef.current && mapRef.current) {
           try {
             leafletMapRef.current = window.L.map(mapRef.current).setView([20, 0], 2);

             // Add tile layer (OpenStreetMap)
             window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
               attribution: '© OpenStreetMap contributors',
               maxZoom: 18,
             }).addTo(leafletMapRef.current);

             // Set dark style
             const darkStyle = `
               .leaflet-container {
                 background: #1a1a1a;
                 filter: invert(1) hue-rotate(180deg);
               }
               .leaflet-control-container {
                 filter: invert(1) hue-rotate(180deg);
               }
             `;
             
             if (!document.querySelector('#leaflet-dark-style')) {
               const style = document.createElement('style');
               style.id = 'leaflet-dark-style';
               style.textContent = darkStyle;
               document.head.appendChild(style);
             }
             
             setIsLoading(false);
           } catch (mapError) {
             console.error('Failed to initialize map:', mapError);
             setHasError(true);
             setIsLoading(false);
           }
         }
       } catch (error) {
         console.error('Failed to load Leaflet:', error);
         setHasError(true);
         setIsLoading(false);
       }
     };

    loadLeaflet();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !window.L || isLoading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      leafletMapRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add supplier markers
    if (layers.suppliers) {
      suppliers.forEach(supplier => {
        const icon = window.L.divIcon({
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
              transition: transform 0.2s;
            ">
              🏭
            </div>
          `,
          className: 'supplier-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = window.L.marker([supplier.location.lat, supplier.location.lng], { icon })
          .addTo(leafletMapRef.current)
          .bindPopup(`
            <div style="color: black; filter: invert(1) hue-rotate(180deg);">
              <h3>${supplier.name}</h3>
              <p><strong>Location:</strong> ${supplier.location.city}, ${supplier.location.country}</p>
              <p><strong>Rating:</strong> ⭐ ${supplier.rating}/5</p>
              <p><strong>Risk:</strong> ${riskConfig[supplier.riskLevel].label}</p>
              <p><strong>Products:</strong> ${supplier.products.join(', ')}</p>
            </div>
          `);

        marker.on('click', () => onMarkerClick(supplier));
        markersRef.current.push(marker);
      });
    }

    // Add shipment markers and routes
    if (layers.shipments || layers.routes) {
      shipments.forEach(shipment => {
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

           const polyline = window.L.polyline(routePoints, {
            color: statusConfig[shipment.status].color,
            weight: 3,
            opacity: 0.8,
            dashArray: shipment.status === 'delivered' ? '10, 10' : undefined
          }).addTo(leafletMapRef.current);

          markersRef.current.push(polyline);
        }

        if (layers.shipments) {
          // Origin marker
          const originIcon = window.L.divIcon({
            html: `
              <div style="
                width: 16px;
                height: 16px;
                background: ${statusConfig[shipment.status].color};
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                cursor: pointer;
              "></div>
            `,
            className: 'shipment-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const originMarker = window.L.marker([shipment.origin.lat, shipment.origin.lng], { icon: originIcon })
            .addTo(leafletMapRef.current);

          // Destination marker
          const destIcon = window.L.divIcon({
            html: `
              <div style="
                width: 16px;
                height: 16px;
                background: ${statusConfig[shipment.status].color};
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                opacity: 0.6;
              "></div>
            `,
            className: 'shipment-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const destMarker = window.L.marker([shipment.destination.lat, shipment.destination.lng], { icon: destIcon })
            .addTo(leafletMapRef.current);

          // Current location marker (if applicable)
          if (shipment.currentLocation && shipment.status !== 'delivered') {
            const currentIcon = window.L.divIcon({
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: ${statusConfig[shipment.status].color};
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                  cursor: pointer;
                  animation: pulse 2s infinite;
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
                <style>
                  @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 ${statusConfig[shipment.status].color}40; }
                    70% { box-shadow: 0 0 0 10px transparent; }
                    100% { box-shadow: 0 0 0 0 transparent; }
                  }
                </style>
              `,
              className: 'current-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            const currentMarker = window.L.marker([shipment.currentLocation.lat, shipment.currentLocation.lng], { icon: currentIcon })
              .addTo(leafletMapRef.current)
              .bindPopup(`
                <div style="color: black; filter: invert(1) hue-rotate(180deg);">
                  <h3>Shipment ${shipment.id}</h3>
                  <p><strong>Product:</strong> ${shipment.product}</p>
                  <p><strong>Status:</strong> ${statusConfig[shipment.status].label}</p>
                  <p><strong>Current:</strong> ${shipment.currentLocation.city || 'In Transit'}</p>
                  <p><strong>ETA:</strong> ${shipment.estimatedArrival}</p>
                  <p><strong>Origin:</strong> ${shipment.origin.city} → <strong>Destination:</strong> ${shipment.destination.city}</p>
                </div>
              `);

            currentMarker.on('click', () => onMarkerClick(shipment));
            markersRef.current.push(currentMarker);
          }

          originMarker.on('click', () => onMarkerClick(shipment));
          markersRef.current.push(originMarker, destMarker);
        }
      });
    }
  }, [suppliers, shipments, layers, onMarkerClick]);

  if (hasError) {
    return (
      <div className="w-full h-full rounded-lg bg-red-900/20 border border-red-500/30 flex items-center justify-center">
        <div className="text-center text-red-400">
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
          <div className="text-sm">Loading map...</div>
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
    <Card className="absolute top-4 left-4 z-[1000] w-80 bg-black/90 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Layers className="h-5 w-5" />
          Map Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search suppliers, shipments..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onSearch(e.target.value);
              }}
            />
          </div>
        </div>

        <Separator className="bg-white/20" />

        {/* Filters */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-white">Filters</label>
          
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-xs text-gray-300">Shipment Status</label>
            <Select value={filters.status} onValueChange={(value) => onFilter('status', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Risk Level Filter */}
          <div className="space-y-2">
            <label className="text-xs text-gray-300">Risk Level</label>
            <Select value={filters.riskLevel} onValueChange={(value) => onFilter('riskLevel', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All Risk Levels" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="all">All Risk Levels</SelectItem>
                {Object.entries(riskConfig).map(([risk, config]) => (
                  <SelectItem key={risk} value={risk}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-white/20" />

        {/* Layer Toggle */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-white">Map Layers</label>
          <div className="space-y-2">
            {Object.entries(layers).map(([layer, enabled]) => (
              <div key={layer} className="flex items-center space-x-2">
                <Checkbox
                  id={layer}
                  checked={enabled}
                  onCheckedChange={() => onLayerToggle(layer as keyof MapLayers)}
                  className="border-white/20"
                />
                <label 
                  htmlFor={layer} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize text-white"
                >
                  {layer}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Map Legend Component
const MapLegend = () => {
  return (
    <Card className="absolute bottom-4 left-4 z-[1000] w-64 bg-black/90 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-white">Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Legend */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-300">Shipment Status</label>
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(statusConfig).map(([status, config]) => (
              <div key={status} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: config.color }} />
                <span className="text-xs text-white">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-white/20" />

        {/* Risk Legend */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-300">Supplier Risk Level</label>
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(riskConfig).map(([risk, config]) => (
              <div key={risk} className="flex items-center gap-2">
                <div className="w-3 h-3 border border-white shadow-sm" style={{ backgroundColor: config.color, borderRadius: '2px' }} />
                <span className="text-xs text-white">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-white/20" />

        {/* Marker Legend */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-300">Markers</label>
          <div className="grid grid-cols-1 gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 border border-white shadow-sm rounded-full" />
              <span className="text-xs text-white">Current Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 border border-white shadow-sm" style={{ borderRadius: '2px' }} />
              <span className="text-xs text-white">Supplier</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 border border-white shadow-sm" />
              <span className="text-xs text-white">Origin/Destination</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card className="absolute top-4 right-4 z-[1000] w-80 bg-black/90 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-white">
              {isSupplier ? selectedItem.name : `Shipment ${selectedItem.id}`}
            </CardTitle>
            <p className="text-sm text-gray-300">
              {isSupplier ? 'Supplier Details' : 'Shipment Information'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSupplier ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Rating</span>
                <span className="font-medium text-white">⭐ {selectedItem.rating}/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Risk Level</span>
                <Badge 
                  variant="outline"
                  className="border-white/30 text-white"
                  style={{ 
                    borderColor: riskConfig[selectedItem.riskLevel].color,
                    color: riskConfig[selectedItem.riskLevel].color
                  }}
                >
                  {riskConfig[selectedItem.riskLevel].label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Location</span>
                <span className="font-medium text-right text-white">
                  {selectedItem.location.city}, {selectedItem.location.country}
                </span>
              </div>
            </div>
            <Separator className="bg-white/20" />
            <div className="space-y-2">
              <span className="text-sm font-medium text-white">Products</span>
              <div className="flex flex-wrap gap-1">
                {selectedItem.products.map((product: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-white/20 text-white">
                    {product}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Status</span>
                <Badge 
                  variant="outline"
                  className="border-white/30"
                  style={{ 
                    borderColor: statusConfig[selectedItem.status].color,
                    color: statusConfig[selectedItem.status].color
                  }}
                >
                  {statusConfig[selectedItem.status].label}
                </Badge>
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
            <Separator className="bg-white/20" />
            <div className="space-y-2">
              <span className="text-sm font-medium text-white">Route Information</span>
              <div className="text-xs text-gray-300 space-y-1">
                <div><span className="text-blue-400">Origin:</span> {selectedItem.origin.city || 'Unknown'}, {selectedItem.origin.country || 'Unknown'}</div>
                <div><span className="text-green-400">Destination:</span> {selectedItem.destination.city || 'Unknown'}, {selectedItem.destination.country || 'Unknown'}</div>
                {selectedItem.currentLocation && (
                  <div><span className="text-yellow-400">Current:</span> {selectedItem.currentLocation.city || 'At Sea'}, {selectedItem.currentLocation.country || 'International Waters'}</div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilter = (type: keyof MapFilters, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const handleLayerToggle = (layer: keyof MapLayers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleMarkerClick = (item: Supplier | Shipment) => {
    setSelectedItem(item);
  };

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border bg-slate-900">
      {/* Real Leaflet World Map */}
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

      {/* Map Legend */}
     {/* <MapLegend /> */}

      {/* Info Panel */}
      <InfoPanel
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Stats Overlay */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <Card className="bg-black/90 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
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
          </CardContent>
        </Card>
      </div>

    
    </div>
  );
};

export default SupplyChainWorldMap;