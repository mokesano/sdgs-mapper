import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import { MapContainer, Marker, Tooltip as MapTooltip, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SDG_META } from '../components/shared/icons';

// UN official SDG hex palette
const SDG_COLORS = {
  1:'#e5243b', 2:'#dda63a', 3:'#4c9f38', 4:'#c5192d', 5:'#ff3a21',
  6:'#26bde2', 7:'#fcc30b', 8:'#a21942', 9:'#fd6925', 10:'#dd1367',
  11:'#fd9d24', 12:'#bf8b2e', 13:'#3f7e44', 14:'#0a97d9', 15:'#56c02b',
  16:'#00689d', 17:'#19486a',
};

// SDG category groupings
const SDG_CATEGORIES = {
  People:      [1,2,3,4,5],
  Planet:      [6,12,13,14,15],
  Prosperity:  [7,8,9,10,11],
  Peace:       [16],
  Partnership: [17],
};
const CATEGORY_COLORS = {
  People:'#6366f1', Planet:'#10b981', Prosperity:'#fbbf24', Peace:'#3b82f6', Partnership:'#8b5cf6',
};

const STAT_COLOR = {
  indigo: { bg:'bg-indigo-50', text:'text-indigo-600' },
  blue:   { bg:'bg-blue-50',   text:'text-blue-600'   },
  purple: { bg:'bg-purple-50', text:'text-purple-600' },
  yellow: { bg:'bg-yellow-50', text:'text-yellow-600' },
  green:  { bg:'bg-green-50',  text:'text-green-600'  },
};

const MAP_GEO_FALLBACK = [
  { id:1,  lat:-6.21,  lng:106.85, city:'Jakarta',       pubs: 247 },
  { id:2,  lat:-6.89,  lng:107.61, city:'Bandung',       pubs: 156 },
  { id:3,  lat:-7.26,  lng:112.75, city:'Surabaya',      pubs:1856 },
  { id:4,  lat:-7.80,  lng:110.36, city:'Yogyakarta',    pubs:1634 },
  { id:5,  lat:-6.97,  lng:110.42, city:'Semarang',      pubs: 745 },
  { id:6,  lat:3.59,   lng:98.68,  city:'Medan',         pubs: 987 },
  { id:7,  lat:-5.13,  lng:119.42, city:'Makassar',      pubs:4876 },
  { id:8,  lat:-8.65,  lng:115.22, city:'Denpasar',      pubs: 743 },
  { id:9,  lat:1.35,   lng:103.82, city:'Singapore',     pubs: 698 },
  { id:10, lat:3.14,   lng:101.69, city:'Kuala Lumpur',  pubs:1534 },
  { id:11, lat:35.68,  lng:139.69, city:'Tokyo',         pubs:3423 },
  { id:12, lat:51.51,  lng:-0.13,  city:'London',        pubs: 312 },
  { id:13, lat:40.71,  lng:-74.01, city:'New York',      pubs:4289 },
  { id:14, lat:39.91,  lng:116.39, city:'Beijing',       pubs:3267 },
  { id:15, lat:-33.87, lng:151.21, city:'Sydney',        pubs:2198 },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

const MapSizeFixer = () => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
};

const StatCard = ({ label, value, color }) => {
  const c = STAT_COLOR[color] || STAT_COLOR.indigo;
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.bg}`}>
        <svg className={`w-5 h-5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-[15px] text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const EmptyChartState = ({ label }) => (
  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
    <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
    <p className="text-[15px] text-center max-w-xs">{label}</p>
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────

const SdgsCluster = () => {
  const { t } = useTranslation('sdgs_cluster');

  const [activeTab,      setActiveTab]      = useState('semua');
  const [selectedYear,   setSelectedYear]   = useState(String(new Date().getFullYear()));
  const [selectedSdg,    setSelectedSdg]    = useState(null);
  const [sdgData,        setSdgData]        = useState([]);
  const [platformStats,  setPlatformStats]  = useState(null);
  const [trendsData,     setTrendsData]     = useState(null);
  const [sdgArticlesMap, setSdgArticlesMap] = useState({});
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  const articlesPanelRef = useRef(null);
  const requestedSdgs    = useRef(new Set());

  // Inject Leaflet pulse CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes sdg-pulse{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.5);opacity:0}}
      .sdg-pw{position:relative;width:100%;height:100%}
      .sdg-pc{position:absolute;top:0;left:0;right:0;bottom:0;border-radius:50%}
      .sdg-pr{position:absolute;top:0;left:0;right:0;bottom:0;border-radius:50%;animation:sdg-pulse 2.5s ease-out infinite}
      .leaflet-div-icon-sdg{background:transparent!important;border:none!important}
      .sdg-tip{background:rgba(255,255,255,.92)!important;border:1px solid rgba(0,0,0,.08)!important;
        border-radius:.75rem;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);padding:.5rem .75rem}
      .sdg-tip::before{display:none}
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sdgRes, statsRes, trendsRes] = await Promise.all([
        fetch('/api/sdg_distribution.php?limit=17&sort=id').then(r => r.json()),
        fetch('/api/platform_stats.php').then(r => r.json()),
        fetch('/api/sdgs_cluster.php?years=5').then(r => r.json()),
      ]);
      if (sdgRes.status === 'success')    setSdgData(sdgRes.data || []);
      if (statsRes.status === 'success')  setPlatformStats(statsRes.data || []);
      if (trendsRes.status === 'success') setTrendsData(trendsRes.data || null);
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchSdgArticles = useCallback(async (sdgNum) => {
    if (requestedSdgs.current.has(sdgNum)) return;
    requestedSdgs.current.add(sdgNum);
    setSdgArticlesMap(prev => ({ ...prev, [sdgNum]: { loading: true, error: null, items: [] } }));
    try {
      const r   = await fetch(`/api/articles.php?sdg=${sdgNum}&limit=8&sort=citations`);
      const res = await r.json();
      setSdgArticlesMap(prev => ({
        ...prev,
        [sdgNum]: { loading: false, error: null, items: res.status === 'success' ? (res.data ?? []) : [] },
      }));
    } catch {
      requestedSdgs.current.delete(sdgNum);
      setSdgArticlesMap(prev => ({ ...prev, [sdgNum]: { loading: false, error: 'error', items: [] } }));
    }
  }, []);

  const handleSdgSelect = (sdgNum) => {
    const next = selectedSdg === sdgNum ? null : sdgNum;
    setSelectedSdg(next);
    if (next) {
      fetchSdgArticles(next);
      setTimeout(() => articlesPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  };

  // Build all 17 SDG entries (always visible regardless of DB data)
  const allSdgs = useMemo(() => {
    const dataMap = {};
    sdgData.forEach(s => { dataMap[s.sdg] = s; });
    return Array.from({ length: 17 }, (_, i) => {
      const n = i + 1;
      const d = dataMap[n] || {};
      return {
        sdg:        n,
        name:       d.name       || SDG_META[n]?.label || `SDG ${n}`,
        color:      d.color      || SDG_COLORS[n]      || '#6b7280',
        count:      d.count      ?? 0,
        percentage: d.percentage ?? 0,
      };
    });
  }, [sdgData]);

  // Bar chart data
  const pubPerSdg = useMemo(() =>
    allSdgs.map(s => ({ id: s.sdg, name: s.name, value: s.count, color: s.color }))
  , [allSdgs]);

  // Pie chart: category breakdown
  const categoryPie = useMemo(() => {
    const countMap = {};
    sdgData.forEach(s => { countMap[s.sdg] = s.count; });
    return Object.entries(SDG_CATEGORIES).map(([cat, nums]) => ({
      name:  cat,
      value: nums.reduce((acc, n) => acc + (countMap[n] || 0), 0),
      color: CATEGORY_COLORS[cat],
    })).filter(c => c.value > 0);
  }, [sdgData]);

  // Top 5 SDGs by publication count
  const topSdgs = useMemo(() =>
    [...allSdgs].sort((a, b) => b.count - a.count).slice(0, 5).map((s, i) => ({ ...s, rank: i + 1 }))
  , [allSdgs]);

  // Platform stats row
  const statsRow = useMemo(() => {
    if (!platformStats) return null;
    const v = (i) => platformStats[i]?.value ?? '—';
    return [
      { key:'publications', value:v(0), color:'indigo' },
      { key:'researchers',  value:v(1), color:'blue'   },
      { key:'journals',     value:v(2), color:'purple' },
      { key:'sdgs',         value:v(3), color:'yellow' },
      { key:'citations',    value:v(4), color:'green'  },
    ];
  }, [platformStats]);

  const totalPubs = useMemo(() => allSdgs.reduce((a, s) => a + s.count, 0), [allSdgs]);
  const hasData   = sdgData.length > 0 && totalPubs > 0;

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return [y, y-1, y-2, y-3].map(String);
  }, []);

  const TABS = ['semua', 'perbandingan', 'peta', 'tren'];

  // Recharts custom tick: SDG icon
  const CustomXAxisTick = ({ x, y, payload }) => (
    <g transform={`translate(${x},${y})`}>
      <image href={`/assets/sdgs/icons/sdg-${payload.value}.svg`} x={-12} y={4} width={24} height={24} />
    </g>
  );

  const CustomBarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-[15px]">
        <p className="font-semibold text-gray-900">SDG {payload[0].payload.id}: {payload[0].payload.name}</p>
        <p className="text-indigo-600">{payload[0].value?.toLocaleString()} {t('charts.publications_label')}</p>
      </div>
    );
  };

  // Leaflet pulse marker
  const PulseMarker = ({ position, city, pubs }) => {
    const radius = Math.max(6, Math.min(16, Math.floor(pubs / 200)));
    const size   = radius * 2;
    const icon   = L.divIcon({
      className:   'leaflet-div-icon-sdg',
      html:        `<div className="sdg-pw"><div className="sdg-pr" style="background:#3f7e44"></div><div className="sdg-pc" style="background:#3f7e44"></div></div>`,
      iconSize:    [size, size],
      iconAnchor:  [size / 2, size / 2],
      tooltipAnchor: [0, -size / 2],
    });
    return (
      <Marker position={position} icon={icon}>
        <MapTooltip direction="auto" opacity={1} className="sdg-tip">
          <div className="min-w-[120px]">
            <p className="font-bold text-gray-900 text-[15px] mb-0.5">{city}</p>
            <p className="text-sm text-gray-600">{pubs.toLocaleString()} {t('map.publications')}</p>
          </div>
        </MapTooltip>
      </Marker>
    );
  };

  return (
    <main className="pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[15px] text-gray-600 mb-12">
        <Link to="/" className="hover:text-indigo-600">{t('breadcrumb.home')}</Link>
        <span>›</span>
        <span className="text-gray-900">{t('breadcrumb.current')}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{t('header.title')}</h1>
        <p className="text-lg font-semibold text-gray-600 mt-1 max-w-2xl">{t('header.subtitle')}</p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
          <span>{t('loading')}</span>
        </div>
      )}

      {/* Error banner */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span className="text-red-700 text-[15px] flex-grow">{error}</span>
          <button onClick={fetchAll} className="text-[15px] text-red-600 underline shrink-0">{t('retry')}</button>
        </div>
      )}

      {!loading && (
        <>
          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-8">
            {statsRow
              ? statsRow.map(s => <StatCard key={s.key} label={t(`stats.${s.key}`)} value={s.value} color={s.color} />)
              : Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 h-28 animate-pulse" />
                ))
            }
          </div>

          {/* Tabs + Year filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium text-[15px] whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {t(`tabs.${tab}`)}
                </button>
              ))}
            </div>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[15px] font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {years.map(y => (
                <option key={y} value={y}>{t('year_label', { year: y })}</option>
              ))}
            </select>
          </div>

          {/* ═══ Tab: Semua ═══ */}
          {activeTab === 'semua' && (
            <>
              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">

                {/* Bar chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">{t('charts.bar_title')}</h3>
                  {hasData ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={pubPerSdg} margin={{ top:20, right:20, left:0, bottom:20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="id" tick={<CustomXAxisTick />} height={36} stroke="#e5e7eb" />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Bar dataKey="value" radius={[4,4,0,0]}>
                          {pubPerSdg.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChartState label={t('charts.no_data')} />
                  )}
                </div>

                {/* Pie chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{t('charts.pie_title')}</h3>
                  {categoryPie.length > 0 ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-full" style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryPie}
                              cx="50%" cy="50%"
                              innerRadius={75} outerRadius={105}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {categoryPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip formatter={v => [v.toLocaleString(), t('charts.publications_label')]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <p className="text-2xl font-bold text-gray-900">{totalPubs.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{t('charts.publications_label')}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                        {categoryPie.map(e => (
                          <div key={e.name} className="flex items-center gap-1.5 text-sm text-gray-600">
                            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: e.color }} />
                            {t(`categories.${e.name}`)} ({e.value.toLocaleString()})
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyChartState label={t('charts.no_data')} />
                  )}
                </div>
              </div>

              {/* Top SDGs Ranking */}
              {hasData && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">{t('ranking.title')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {topSdgs.map(sdg => (
                      <div
                        key={sdg.sdg}
                        className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleSdgSelect(sdg.sdg)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[15px] font-bold text-gray-700">
                              {sdg.rank}
                            </span>
                            <img src={`/assets/sdgs/logos/Arthboard_SDG${sdg.sdg}.svg`} alt={`SDG ${sdg.sdg}`} className="w-8 h-8 rounded" />
                          </div>
                          <span className="text-sm font-bold text-gray-400">SDG {sdg.sdg}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-[15px] mb-3 line-clamp-2">{sdg.name}</h4>
                        <p className="text-2xl font-bold text-gray-900">{sdg.count.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{t('sdg_cards.publications')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All 17 SDG Cards */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">{t('sdg_cards.title')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3">
                  {allSdgs.map(sdg => (
                    <button
                      key={sdg.sdg}
                      onClick={() => handleSdgSelect(sdg.sdg)}
                      title={`${t('sdg_cards.click_hint')} — SDG ${sdg.sdg}: ${sdg.name}`}
                      className={`group relative rounded-xl overflow-hidden border-2 transition-all text-left focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 ${
                        selectedSdg === sdg.sdg
                          ? 'shadow-lg scale-[1.03]'
                          : 'border-transparent hover:shadow-md hover:scale-[1.02]'
                      }`}
                      style={{ borderColor: selectedSdg === sdg.sdg ? sdg.color : 'transparent' }}
                    >
                      {/* SDG icon fills the card */}
                      <div className="aspect-square relative">
                        <img
                          src={`/assets/sdgs/logos/Artboard_SDG${sdg.sdg}.svg`}
                          alt={`SDG ${sdg.sdg}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Count overlay */}
                        <div
                          className="absolute bottom-0 inset-x-0 p-1.5 text-center"
                          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}
                        >
                          {sdg.count > 0 ? (
                            <>
                              <p className="text-white text-sm font-bold leading-none">{sdg.count.toLocaleString()}</p>
                              <p className="text-white/75 text-xs">{t('sdg_cards.publications')}</p>
                            </>
                          ) : (
                            <p className="text-white/75 text-xs">{t('sdg_cards.empty.title')}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-3 text-center">{t('sdg_cards.click_hint')}</p>
              </div>

              {/* Selected SDG Articles Panel */}
              {selectedSdg !== null && (
                <div
                  ref={articlesPanelRef}
                  className="mb-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Panel header */}
                  <div
                    className="flex items-center justify-between p-5 border-b border-gray-100"
                    style={{ borderTop: `4px solid ${SDG_COLORS[selectedSdg]}` }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`/assets/sdgs/icons/sdg-${selectedSdg}.svg`}
                        alt={`SDG ${selectedSdg}`}
                        className="w-10 h-10 rounded"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {t('articles.title', { sdg: `SDG ${selectedSdg}` })}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {allSdgs.find(s => s.sdg === selectedSdg)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/articles?sdg=${selectedSdg}`}
                        className="text-[15px] text-indigo-600 font-medium hover:text-indigo-700"
                      >
                        {t('articles.view_all')}
                      </Link>
                      <button
                        onClick={() => setSelectedSdg(null)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label={t('aria.close')}
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Articles body */}
                  {(() => {
                    const st = sdgArticlesMap[selectedSdg];
                    if (!st || st.loading) {
                      return (
                        <div className="flex items-center justify-center gap-3 py-12 text-gray-500">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />
                          <span className="text-[15px]">{t('loading')}</span>
                        </div>
                      );
                    }
                    if (!st.items || st.items.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                          <img
                            src="/assets/img/article-default.svg"
                            alt=""
                            className="w-20 h-20 mb-4 opacity-40"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                          <p className="font-semibold text-gray-700">{t('articles.no_articles.title')}</p>
                          <p className="text-[15px] text-gray-500 mt-1 max-w-md">{t('articles.no_articles.subtitle')}</p>
                        </div>
                      );
                    }
                    return (
                      <div className="divide-y divide-gray-50">
                        {st.items.map((article, i) => (
                          <Link
                            key={article.doi || i}
                            to={`/doi/${encodeURIComponent(article.doi)}`}
                            className="flex gap-4 p-5 hover:bg-gray-50 transition-colors group"
                          >
                            <div
                              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-[15px]"
                              style={{ backgroundColor: SDG_COLORS[selectedSdg] }}
                            >
                              {i + 1}
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="font-semibold text-gray-900 text-[15px] line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                {article.title}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1 truncate">
                                {Array.isArray(article.authors)
                                  ? article.authors.slice(0, 3).join(', ')
                                  : article.authors}
                              </p>
                              <p className="text-sm text-gray-400 mt-0.5">
                                {[article.journal, article.year].filter(Boolean).join(' · ')}
                              </p>
                            </div>
                            <div className="shrink-0 text-right ml-2">
                              <p className="text-[15px] font-bold text-gray-900">{(article.citations || 0).toLocaleString()}</p>
                              <p className="text-xs text-gray-400">{t('articles.citations')}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}

          {/* ═══ Tab: Perbandingan ═══ */}
          {activeTab === 'perbandingan' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('comparison.title')}</h3>
              {hasData ? (
                <div className="space-y-3">
                  {[...allSdgs].sort((a, b) => b.count - a.count).map((sdg, i) => (
                    <div key={sdg.sdg} className="flex items-center gap-3">
                      <span className="w-5 text-sm font-bold text-gray-400 shrink-0 text-right">{i + 1}</span>
                      <img
                        src={`/assets/sdgs/icons/sdg-${sdg.sdg}.svg`}
                        alt={`SDG ${sdg.sdg}`}
                        className="w-7 h-7 rounded shrink-0"
                      />
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-gray-700 truncate">
                            SDG {sdg.sdg}: {sdg.name}
                          </span>
                          <span className="text-sm text-gray-500 shrink-0 ml-2">
                            {sdg.count.toLocaleString()} · {sdg.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-700"
                            style={{ width: `${sdg.percentage}%`, backgroundColor: sdg.color }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="font-semibold text-gray-700">{t('comparison.no_data.title')}</p>
                  <p className="text-[15px] text-gray-500 mt-1 max-w-sm">{t('comparison.no_data.subtitle')}</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ Tab: Peta ═══ */}
          {activeTab === 'peta' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">{t('map.title')}</h3>
              </div>
              <div className="h-[520px] w-full relative" style={{ zIndex: 0 }}>
                <MapContainer
                  center={[20, 0]}
                  zoom={2}
                  minZoom={2}
                  maxZoom={6}
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                  scrollWheelZoom={false}
                  dragging={true}
                  zoomControl={true}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    subdomains="abcd"
                    maxZoom={19}
                  />
                  <MapSizeFixer />
                  {MAP_GEO_FALLBACK.map(loc => (
                    <PulseMarker key={loc.id} position={[loc.lat, loc.lng]} city={loc.city} pubs={loc.pubs} />
                  ))}
                </MapContainer>
              </div>
              <div className="p-4 flex items-center justify-center gap-6 text-sm border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-700 shrink-0" />
                  <span className="text-gray-600">{t('map.legend_high')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-300 shrink-0" />
                  <span className="text-gray-600">{t('map.legend_low')}</span>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Tab: Tren ═══ */}
          {activeTab === 'tren' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{t('trends.title')}</h3>
              <p className="text-[15px] text-gray-500 mb-6">{t('trends.subtitle')}</p>
              {trendsData?.timeline?.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={360}>
                    <AreaChart data={trendsData.timeline} margin={{ top:20, right:20, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      {(trendsData.top_sdgs || []).map(sdgNum => (
                        <Area
                          key={sdgNum}
                          type="monotone"
                          dataKey={`sdg${sdgNum}`}
                          name={`SDG ${sdgNum}`}
                          stroke={SDG_COLORS[sdgNum] || '#6b7280'}
                          fill={`${SDG_COLORS[sdgNum] || '#6b7280'}33`}
                          strokeWidth={2}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {(trendsData.top_sdgs || []).map(n => (
                      <div key={n} className="flex items-center gap-1.5 text-sm text-gray-600">
                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: SDG_COLORS[n] }} />
                        SDG {n}: {allSdgs.find(s => s.sdg === n)?.name}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                  <p className="font-semibold text-gray-700">{t('trends.no_data.title')}</p>
                  <p className="text-[15px] text-gray-500 mt-1 max-w-sm">{t('trends.no_data.subtitle')}</p>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{t('cta.title')}</h3>
              <p className="text-indigo-100">{t('cta.subtitle')}</p>
            </div>
            <Link
              to="/articles"
              className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              {t('cta.button')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
          </div>
        </>
      )}
    </main>
  );
};

export default SdgsCluster;