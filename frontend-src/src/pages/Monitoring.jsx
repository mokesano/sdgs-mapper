import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Tooltip, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Monitoring = () => {
  const { t } = useTranslation('monitoring');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monitoringData, setMonitoringData] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchMonitoringData(selectedTimeRange);
  }, [selectedTimeRange]);

  const fetchMonitoringData = async (range) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/monitoring.php?range=${range}`);
      if (!response.ok) throw new Error('Failed to fetch monitoring data');
      const result = await response.json();
      if (result.status === 'ok' && result.data) {
        setMonitoringData(result.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Monitoring data fetch error:', err);
      setError(err.message);
      // Keep using default mock data on error
    } finally {
      setLoading(false);
    }
  };

  // Animasi pulse halus (subtle)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes subtle-pulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      .pulse-wrapper { position: relative; width: 100%; height: 100%; }
      .pulse-core { position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 50%; }
      .pulse-ring { position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 50%; animation: subtle-pulse 2.5s ease-out infinite; }
      .leaflet-div-icon-transparent { background: transparent !important; border: none !important; }
      
      .leaflet-tooltip.custom-map-tooltip {
        background-color: rgba(255, 255, 255, 0.4) !important;
        backdrop-filter: blur(6px); /* Efek blur pada peta di belakangnya */
        -webkit-backdrop-filter: blur(6px); /* Dukungan untuk Safari */
        border: 1px solid rgba(255, 255, 255, 0.4) !important;
        border-radius: 0.75rem; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
        padding: 0.5rem 0.75rem;
      }
      .leaflet-tooltip.custom-map-tooltip::before { display: none; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const MapSizeFixer = () => {
    const map = useMap();
    useEffect(() => {
      const timeout = setTimeout(() => {
        map.invalidateSize();
      }, 250);
      return () => clearTimeout(timeout);
    }, [map]);
    return null;
  };

  // Default mock geo data for development/fallback
  const DEFAULT_GEO_DATA = [
    { id: 1,  lat: -6.21,  lng: 106.85, city: 'Jakarta',        visitors: 247  },
    { id: 2,  lat: -7.26,  lng: 112.75, city: 'Surabaya',       visitors: 856  },
    { id: 3,  lat: 1.35,   lng: 103.82, city: 'Singapore',      visitors: 743  },
    { id: 4,  lat: 3.14,   lng: 101.69, city: 'Kuala Lumpur',   visitors: 698  },
    { id: 5,  lat: 13.76,  lng: 100.50, city: 'Bangkok',        visitors: 612  },
    { id: 6,  lat: 14.60,  lng: 121.00, city: 'Manila',         visitors: 534  },
    { id: 7,  lat: 22.30,  lng: 114.18, city: 'Hong Kong',      visitors: 489  },
    { id: 8,  lat: 35.68,  lng: 139.69, city: 'Tokyo',          visitors: 456  },
    { id: 9,  lat: 37.57,  lng: 126.98, city: 'Seoul',          visitors: 421  },
    { id: 10, lat: 39.91,  lng: 116.39, city: 'Beijing',        visitors: 398  },
    { id: 11, lat: 31.23,  lng: 121.47, city: 'Shanghai',       visitors: 376  },
    { id: 12, lat: 28.61,  lng: 77.21,  city: 'New Delhi',      visitors: 345  },
    { id: 13, lat: 19.08,  lng: 72.88,  city: 'Mumbai',         visitors: 312  },
    { id: 14, lat: 51.51,  lng: -0.13,  city: 'London',         visitors: 1289 },
    { id: 15, lat: 48.86,  lng: 2.35,   city: 'Paris',          visitors: 267  },
    { id: 16, lat: 52.52,  lng: 13.40,  city: 'Berlin',         visitors: 245  },
    { id: 17, lat: 40.71,  lng: -74.01, city: 'New York',       visitors: 1523 },
    { id: 18, lat: 34.05,  lng: -118.24,city: 'Los Angeles',    visitors: 412  },
    { id: 19, lat: -33.87, lng: 151.21, city: 'Sydney',         visitors: 98   },
    { id: 20, lat: -23.55, lng: -46.63, city: 'São Paulo',      visitors: 187  },
    { id: 21, lat: -34.60, lng: -58.38, city: 'Buenos Aires',   visitors: 156  },
    { id: 22, lat: 30.05,  lng: 31.25,  city: 'Cairo',          visitors: 143  },
    { id: 23, lat: 6.52,   lng: 3.38,   city: 'Lagos',          visitors: 132  },
    { id: 24, lat: -26.20, lng: 28.04,  city: 'Johannesburg',   visitors: 121  },
    { id: 25, lat: 55.75,  lng: 37.62,  city: 'Moscow',         visitors: 118  },
  ];

  const geoData = monitoringData?.geoData || DEFAULT_GEO_DATA;

  const DEFAULT_TRAFFIC_SOURCES = {
    sources: [
      { name: 'Direct', value: 4523, percentage: 35, color: 'bg-indigo-500' },
      { name: 'Organic Search', value: 3845, percentage: 30, color: 'bg-purple-500' },
      { name: 'Social Media', value: 2156, percentage: 17, color: 'bg-pink-500' },
      { name: 'Referral', value: 1234, percentage: 10, color: 'bg-blue-500' },
      { name: 'Email', value: 987, percentage: 8, color: 'bg-green-500' },
    ],
    utm: [
      { campaign: 'SDG_Campaign_2024', value: 1567, percentage: 45 },
      { campaign: 'Research_Promo', value: 1023, percentage: 29 },
      { campaign: 'Webinar_March', value: 678, percentage: 19 },
      { campaign: 'Newsletter_Q1', value: 245, percentage: 7 },
    ],
    referrers: [
      { domain: 'google.com', value: 2345, percentage: 42 },
      { domain: 'linkedin.com', value: 1234, percentage: 22 },
      { domain: 'twitter.com', value: 987, percentage: 18 },
      { domain: 'facebook.com', value: 567, percentage: 10 },
      { domain: 'others', value: 456, percentage: 8 },
    ],
    keywords: [
      { keyword: 'SDG analysis', value: 1234, percentage: 28 },
      { keyword: 'research analytics', value: 987, percentage: 22 },
      { keyword: 'wizdam platform', value: 756, percentage: 17 },
      { keyword: 'academic tools', value: 534, percentage: 12 },
      { keyword: 'others', value: 923, percentage: 21 },
    ]
  };

  const trafficSources = monitoringData?.trafficSources || DEFAULT_TRAFFIC_SOURCES;

  const DEFAULT_PAGES_DATA = {
    entryPages: [
      { path: '/dashboard', views: 3456, percentage: 32, bounceRate: '24%' },
      { path: '/researchers', views: 2345, percentage: 22, bounceRate: '31%' },
      { path: '/sdgs', views: 1876, percentage: 17, bounceRate: '28%' },
      { path: '/journals', views: 1234, percentage: 11, bounceRate: '35%' },
      { path: '/about', views: 987, percentage: 9, bounceRate: '42%' },
    ],
    topPages: [
      { path: '/dashboard/analytics', views: 5678, avgTime: '4m 32s', exits: 234 },
      { path: '/researchers/profile', views: 4321, avgTime: '3m 18s', exits: 187 },
      { path: '/sdgs/explorer', views: 3456, avgTime: '5m 12s', exits: 156 },
      { path: '/journals/list', views: 2345, avgTime: '2m 45s', exits: 123 },
      { path: '/api/docs', views: 1876, avgTime: '6m 05s', exits: 89 },
    ],
    exitPages: [
      { path: '/dashboard', views: 1234, percentage: 28 },
      { path: '/researchers', views: 987, percentage: 22 },
      { path: '/logout', views: 756, percentage: 17 },
      { path: '/sdgs', views: 534, percentage: 12 },
      { path: '/contact', views: 423, percentage: 9 },
    ]
  };

  const pagesData = monitoringData?.pagesData || DEFAULT_PAGES_DATA;

  const DEFAULT_SYSTEM_DATA = {
    browsers: [
      { name: 'Chrome',  value: 6789, percentage: 58 },
      { name: 'Firefox', value: 2345, percentage: 20 },
      { name: 'Safari',  value: 1567, percentage: 13 },
      { name: 'Edge',    value: 987,  percentage: 8  },
      { name: 'Others',  value: 123,  percentage: 1  },
    ],
    platforms: [
      { name: 'Desktop', value: 7654, percentage: 65 },
      { name: 'Mobile',  value: 3456, percentage: 29 },
      { name: 'Tablet',  value: 701,  percentage: 6  },
    ],
    os: [
      { name: 'Windows', value: 6789, percentage: 58 },
      { name: 'macOS', value: 2345, percentage: 20 },
      { name: 'Android', value: 1567, percentage: 13 },
      { name: 'iOS', value: 987, percentage: 8 },
      { name: 'Linux', value: 123, percentage: 1 },
    ]
  };

  const systemData = monitoringData?.systemData || DEFAULT_SYSTEM_DATA;

  const DEFAULT_PAGE_VIEW_ACTIVITY = [
    { id: 1, timestamp: '2024-05-25 14:32:15', page: '/dashboard/analytics', source: 'google.com', location: 'Jakarta', device: 'Chrome/Windows', duration: '4m 32s' },
    { id: 2, timestamp: '2024-05-25 14:31:48', page: '/researchers/profile', source: 'Direct', location: 'Surabaya', device: 'Firefox/macOS', duration: '3m 18s' },
    { id: 3, timestamp: '2024-05-25 14:30:22', page: '/sdgs/explorer', source: 'linkedin.com', location: 'Bandung', device: 'Chrome/Android', duration: '5m 12s' },
    { id: 4, timestamp: '2024-05-25 14:29:55', page: '/journals/list', source: 'twitter.com', location: 'Denpasar', device: 'Safari/iOS', duration: '2m 45s' },
    { id: 5, timestamp: '2024-05-25 14:28:33', page: '/api/docs', source: 'google.com', location: 'Jakarta', device: 'Chrome/Windows', duration: '6m 05s' },
    { id: 6, timestamp: '2024-05-25 14:27:12', page: '/dashboard', source: 'Direct', location: 'Yogyakarta', device: 'Edge/Windows', duration: '1m 23s' },
    { id: 7, timestamp: '2024-05-25 14:26:45', page: '/about', source: 'facebook.com', location: 'Makassar', device: 'Chrome/Android', duration: '0m 45s' },
    { id: 8, timestamp: '2024-05-25 14:25:18', page: '/researchers', source: 'google.com', location: 'Jakarta', device: 'Firefox/Linux', duration: '3m 56s' },
  ];

  const pageViewActivity = monitoringData?.activity || DEFAULT_PAGE_VIEW_ACTIVITY;

  const formatSeconds = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const PulseMarker = ({ position, city, visitors, type = 'normal' }) => {
    // Menggunakan Opsi 1 (Seimbang) untuk visual ukuran pulse
    const radius = Math.max(5, Math.min(14, Math.floor(visitors / 90))); 
    const color = type === 'brute' ? '#ef4444' : '#3b82f6';
    const size = radius * 2;

    const customIcon = L.divIcon({
      className: 'leaflet-div-icon-transparent',
      html: `
        <div className="pulse-wrapper">
          <div className="pulse-ring" style="background-color: ${color};"></div>
          <div className="pulse-core" style="background-color: ${color};"></div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2], 
      tooltipAnchor: [0, -size / 2] // Mengganti popupAnchor menjadi tooltipAnchor
    });

    return (
      <Marker position={position} icon={customIcon}>
        {/* Menggunakan Tooltip: Muncul saat hover, tidak menggeser layar, dan arah auto menyesuaikan batas tepi layar */}
        <Tooltip 
          direction="auto" 
          opacity={1} 
          className="custom-map-tooltip"
        >
          <div className="min-w-[120px]">
            <p className="font-bold text-gray-900 text-[15px] mb-0.5">{city}</p>
            <p className="text-sm text-gray-600 mb-1">{visitors.toLocaleString()} visitors</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
              <p className="text-xs font-medium text-gray-700">
                {type === 'brute' ? 'Brute Force' : type === 'bot' ? 'Bot Visit' : 'Normal Visit'}
              </p>
            </div>
          </div>
        </Tooltip>
      </Marker>
    );
  };

  const ProgressBar = ({ percentage, color }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`${color} h-2 rounded-full transition-all duration-500`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );

  const StatCard = ({ title, value, change, icon, color }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% dari periode sebelumnya
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-[15px] text-gray-600 mt-1">{t('header.subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="1h">{t('range.1h')}</option>
                <option value="24h">{t('range.24h')}</option>
                <option value="7d">{t('range.7d')}</option>
                <option value="30d">{t('range.30d')}</option>
              </select>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[15px] font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('action.refresh')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
              <p className="text-gray-700 font-medium">{t('loading')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{t('error_prefix')} {error}. {t('error_suffix')}</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">{t('geo.title')}</h2>
            <p className="text-[15px] text-gray-600 mt-1">{t('geo.subtitle')}</p>
          </div>
          <div className="h-[580px] w-full z-0 relative">
            <MapContainer
              ref={mapRef}
              center={[20, 0]}
              zoom={2}
              minZoom={2}
              maxZoom={6}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
              scrollWheelZoom={false}
              dragging={true}
              zoomControl={true}
              doubleClickZoom={true}
              touchZoom={true}
              worldCopyJump={true}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                subdomains="abcd"
                maxZoom={19}
                noWrap={false}
              />
              <MapSizeFixer />
              {geoData.map((location) => (
                <PulseMarker
                  key={location.id}
                  position={[location.lat, location.lng]}
                  city={location.city}
                  visitors={location.visitors}
                  type={location.visitors > 1000 ? 'brute' : location.visitors > 500 ? 'bot' : 'normal'}
                />
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('stats.page_views')}
            value={monitoringData?.summary?.totalPageViews?.toLocaleString() || '12,847'}
            change={12.5}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
            color="bg-indigo-500"
          />
          <StatCard
            title={t('stats.visitors')}
            value={monitoringData?.summary?.uniqueVisitors?.toLocaleString() || '3,456'}
            change={8.3}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            color="bg-purple-500"
          />
          <StatCard
            title={t('stats.session')}
            value={formatSeconds(monitoringData?.summary?.avgSessionDuration) || '4m 32s'}
            change={-2.1}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="bg-green-500"
          />
          <StatCard
            title={t('stats.bounce')}
            value={(monitoringData?.summary?.bounceRate || 32.4).toFixed(1) + '%'}
            change={-5.7}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            color="bg-amber-500"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">{t('panel.by_source')}</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-[15px] font-semibold text-gray-700 mb-2">{t('sections.sources')}</h4>
                <div className="space-y-2">
                  {trafficSources.sources.map((source, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between text-[15px] mb-1">
                          <span className="text-gray-700">{source.name}</span>
                          <span className="text-gray-900 font-medium">{source.value.toLocaleString()}</span>
                        </div>
                        <ProgressBar percentage={source.percentage} color={source.color} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-[15px] font-semibold text-gray-700 mb-2">{t('panel.campaigns')}</h4>
                <div className="space-y-2">
                  {trafficSources.utm.map((utm, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[15px]">
                      <span className="text-gray-700">{utm.campaign}</span>
                      <span className="text-gray-900 font-medium">{utm.value} ({utm.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">{t('panel.by_pages')}</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-[15px] font-semibold text-gray-700 mb-2">{t('sections.top_pages')}</h4>
                <div className="space-y-2">
                  {pagesData.topPages.slice(0, 4).map((page, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[15px] p-2 bg-gray-50 rounded">
                      <span className="text-gray-700 truncate flex-1">{page.path}</span>
                      <span className="text-gray-900 font-medium ml-4">{page.views.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm ml-2">{page.avgTime}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-[15px] font-semibold text-gray-700 mb-2">{t('sections.entry_pages')}</h4>
                <div className="space-y-2">
                  {pagesData.entryPages.slice(0, 3).map((page, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[15px]">
                      <span className="text-gray-700">{page.path}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm">Bounce: {page.bounceRate}</span>
                        <span className="text-gray-900 font-medium">{page.views.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">{t('sections.browsers')}</h3>
            <div className="space-y-3">
              {systemData.browsers.map((browser, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] text-gray-700">{browser.name}</span>
                  </div>
                  <span className="text-[15px] font-medium text-gray-900">{browser.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">{t('sections.platforms')}</h3>
            <div className="space-y-3">
              {systemData.platforms.map((platform, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] text-gray-700">{platform.name}</span>
                  </div>
                  <span className="text-[15px] font-medium text-gray-900">{platform.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">{t('sections.os')}</h3>
            <div className="space-y-3">
              {systemData.os.map((os, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] text-gray-700">{os.name}</span>
                  </div>
                  <span className="text-[15px] font-medium text-gray-900">{os.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t('activity.title')}</h2>
              <p className="text-[15px] text-gray-600 mt-1">{t('activity.subtitle')}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-[15px] text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                {t('action.export')}
              </button>
              <button className="px-3 py-1.5 text-[15px] bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors">
                {t('action.view_all')}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-[15px]">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">{t('table.timestamp')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('table.page')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('table.source')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('table.location')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('table.device')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('table.duration')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageViewActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-mono text-[15px]">{activity.timestamp}</td>
                    <td className="px-4 py-3">
                      <span className="text-indigo-600 font-medium">{activity.page}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{activity.source}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-700">{activity.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{activity.device}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[15px] font-medium">
                        {activity.duration}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Monitoring;