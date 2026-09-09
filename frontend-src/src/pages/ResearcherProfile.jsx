import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

// UN official SDG colour palette
const SDG_COLORS = {
  1: '#e5243b', 2: '#dda63a', 3: '#4c9f38', 4: '#c5192d',
  5: '#ff3a21', 6: '#26bde2', 7: '#fcc30b', 8: '#a21942',
  9: '#fd6925', 10: '#dd1367', 11: '#fd9d24', 12: '#bf8b2e',
  13: '#3f7e44', 14: '#0a97d9', 15: '#56c02b', 16: '#00689d',
  17: '#19486a',
};

// ── Sub-components ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="text-[15px] font-semibold text-gray-900">{label}</p>
      <p className="text-[15px] text-indigo-600">{payload[0].name}: {payload[0].value}</p>
    </div>
  );
};

const LoadingState = () => {
  const { t } = useTranslation('researcher');
  return (
    <main className="pt-[76px] pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">{t('loading.title')}</p>
        <p className="text-[15px] text-gray-400">{t('loading.subtitle')}</p>
      </div>
    </main>
  );
};

const ErrorState = ({ orcid, message, onRetry }) => {
  const { t } = useTranslation('researcher');
  return (
    <main className="pt-[76px] pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('error.title')}</h2>
        <p className="text-gray-600 mb-2">{t('error.message', { orcid })}</p>
        {message && <p className="text-[15px] text-red-500 mb-6">{message}</p>}
        <div className="flex gap-3 justify-center">
          <button onClick={onRetry} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">
            {t('error.retry')}
          </button>
          <Link to="/researchers" className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
            {t('error.back')}
          </Link>
        </div>
      </div>
    </main>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

const ResearcherProfile = ({ sourceType = 'orcid' }) => {
  const params = useParams();
  // Route may expose the id under different names: orcidCode (legacy /orcid/:orcidCode)
  // or a generic `id` for /scopus/:id, /sinta/:id, /researcherid/:id.
  const idValue = params.orcidCode ?? params.id ?? '';
  const { t } = useTranslation('researcher');
  const [activeTab, setActiveTab]   = useState('ringkasan');
  const [researcher, setResearcher] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [unsupported, setUnsupported] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnsupported(null);
    try {
      const url = `/api/profile_lookup.php?type=${encodeURIComponent(sourceType)}&id=${encodeURIComponent(idValue)}`;
      const res  = await fetch(url);
      const json = await res.json();
      if (json.status === 'success' && json.profile) {
        setResearcher(json.profile);
      } else if (json.status === 'unsupported') {
        setUnsupported(json);
      } else {
        setError(json.message || 'Profil tidak ditemukan');
      }
    } catch (err) {
      setError('Gagal menghubungi server: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [sourceType, idValue]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  if (loading) return <LoadingState />;

  if (unsupported) {
    return (
      <main className="pt-[76px] pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.73-3L13.73 4.5a2 2 0 00-3.46 0L3.2 16a2 2 0 001.73 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Lookup {sourceType.toUpperCase()} belum aktif
        </h2>
        <p className="text-gray-600 mb-6">{unsupported.message}</p>
        <p className="text-[15px] text-gray-500 font-mono mb-6">{sourceType}: {idValue}</p>
        <div className="flex gap-3 justify-center">
          <Link to="/researchers" className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
            {t('error.back')}
          </Link>
          <Link to="/" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">
            {t('action.try_orcid')}
          </Link>
        </div>
      </main>
    );
  }

  if (error || !researcher) return <ErrorState orcid={idValue} message={error} onRetry={fetchProfile} />;

  // Safe defaults
  const r = {
    ...researcher,
    avatar:             researcher.avatar            ?? null,
    verified:           researcher.verified          ?? false,
    email:              researcher.email             ?? null,
    bio:                researcher.bio               ?? t('bio_fallback'),
    scopusId:           researcher.scopusId          ?? null,
    researcherId:       researcher.researcherId      ?? null,
    views:              researcher.views             ?? 0,
    downloads:          researcher.downloads         ?? 0,
    citations:          researcher.citations         ?? 0,
    hIndex:             researcher.hIndex            ?? 0,
    i10Index:           researcher.i10Index          ?? 0,
    sdgsInvolved:       researcher.sdgsInvolved      ?? 0,
    firstPublication:   researcher.firstPublication  ?? new Date().getFullYear(),
    researchInterests:  researcher.researchInterests ?? [],
    sdgFocus:           researcher.sdgFocus          ?? [],
    topKeywords:        researcher.topKeywords       ?? [],
    publicationTrend:   researcher.publicationTrend  ?? [],
    citationTrend:      researcher.citationTrend     ?? [],
    recentPublications: researcher.recentPublications ?? [],
    collaborators:      researcher.collaborators     ?? [],
    affiliations:       researcher.affiliations      ?? [],
    socialLinks:        researcher.socialLinks       ?? {},
  };

  const TABS = [
    { id: 'ringkasan',  icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'publikasi',  icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
    { id: 'kolaborasi', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'dampak',     icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'tentang',    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const HEADER_STATS = [
    { key: 'total_articles',  value: r.publications },
    { key: 'total_citations', value: r.citations.toLocaleString() },
    { key: 'h_index',         value: r.hIndex },
    { key: 'i10_index',       value: r.i10Index },
    { key: 'sdgs_involved',   value: r.sdgsInvolved },
    { key: 'years_active',    value: r.yearsActive, small: true },
    { key: 'collaborators',   value: r.collaboratorsCount },
    { key: 'country',         value: r.country, small: true },
    { key: 'total_views',     value: r.views.toLocaleString() },
  ];

  return (
    <main className="pt-[76px] pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

      {/* ── Header ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img
                  src={r.avatar ?? '/assets/img/researcher-default.svg'}
                  alt={r.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => { e.target.src = '/assets/img/researcher-default.svg'; }}
                />
                {r.verified && (
                  <div className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full p-1.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">{r.name}</h1>
              {r.title && <p className="text-indigo-600 font-medium mb-4">{r.title}</p>}

              <div className="w-full space-y-2 text-[15px]">
                {r.univ && (
                  <div className="flex items-center gap-2 text-gray-600 justify-center">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="truncate">{r.univ}</span>
                  </div>
                )}
                {r.department && (
                  <div className="flex items-center gap-2 text-gray-600 justify-center">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{r.department}</span>
                  </div>
                )}
                {r.location && (
                  <div className="flex items-center gap-2 text-gray-600 justify-center">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{r.location}</span>
                  </div>
                )}
                {r.email && (
                  <div className="flex items-center gap-2 text-gray-600 justify-center">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${r.email}`} className="text-indigo-600 hover:underline truncate">{r.email}</a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600 justify-center">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <span className="font-mono text-sm">{r.orcid}</span>
                </div>
                {r.scopusId    && <div className="text-sm text-gray-500">Scopus ID: {r.scopusId}</div>}
                {r.researcherId && <div className="text-sm text-gray-500">Researcher ID: {r.researcherId}</div>}
              </div>

              {/* Social links */}
              <div className="flex gap-3 mt-4 flex-wrap justify-center">
                {r.socialLinks.orcid && (
                  <a href={r.socialLinks.orcid} target="_blank" rel="noopener noreferrer" title="ORCID"
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                  </a>
                )}
                {r.socialLinks.scopus && (
                  <a href={r.socialLinks.scopus} target="_blank" rel="noopener noreferrer" title="Scopus"
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-orange-500 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </a>
                )}
                {r.socialLinks.googleScholar && (
                  <a href={r.socialLinks.googleScholar} target="_blank" rel="noopener noreferrer" title="Google Scholar"
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-600 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats + actions */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {HEADER_STATS.map((stat) => (
              <div key={stat.key} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-[15px] text-gray-600 mb-1">{t(`stats.${stat.key}`)}</p>
                <p className={`font-bold text-gray-900 ${stat.small ? 'text-[15px]' : 'text-2xl'}`}>{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <a href={`https://orcid.org/${r.orcid}`} target="_blank" rel="noopener noreferrer"
              className="py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {t('profile.view_orcid')}
            </a>
            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {t('profile.share')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex gap-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-[15px] whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
              </svg>
              {t(`tabs.${tab.id}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab: Ringkasan ── */}
      {activeTab === 'ringkasan' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { key: 'total_articles', value: r.publications,       icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { key: 'total_citations',value: r.citations,          icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
              { key: 'h_index',        value: r.hIndex,             icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { key: 'i10_index',      value: r.i10Index,           icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
              { key: 'sdgs_involved',  value: r.sdgsInvolved,       icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { key: 'collaborators',  value: r.collaboratorsCount, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            ].map((stat) => (
              <div key={stat.key} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : (stat.value ?? '—')}
                  </p>
                  <p className="text-sm text-gray-600">{t(`stats.${stat.key}`)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Publication Trend */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('ringkasan.publication_trend')}</h3>
              {r.publicationTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={r.publicationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name={t('tabs.publikasi')} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-[15px]">
                  {t('ringkasan.no_trend')}
                </div>
              )}
            </div>

            {/* SDG Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('ringkasan.sdg_distribution')}</h3>
              {r.sdgFocus.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={r.sdgFocus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="percentage">
                        {r.sdgFocus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-grow space-y-2">
                    {r.sdgFocus.slice(0, 6).map((sdg, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[15px]">
                        <div className="w-6 h-6 rounded flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ backgroundColor: sdg.color }}>{sdg.sdg}</div>
                        <span className="text-gray-600 truncate">{sdg.name}</span>
                        <span className="font-semibold text-gray-900 ml-auto">{sdg.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-[15px]">
                  <div className="text-center">
                    <p>{t('ringkasan.sdg_unclassified')}</p>
                    <p className="text-sm mt-1">{t('ringkasan.sdg_run_analysis')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Publications */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('ringkasan.recent_publications')}</h3>
              <div className="space-y-4">
                {r.recentPublications.slice(0, 3).map((pub) => (
                  <div key={pub.id} className="p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    {pub.doi ? (
                      <Link to={`/doi/${encodeURIComponent(pub.doi)}`}
                        className="font-semibold text-gray-900 text-[15px] mb-1 line-clamp-2 hover:text-indigo-600 block">
                        {pub.title}
                      </Link>
                    ) : (
                      <p className="font-semibold text-gray-900 text-[15px] mb-1 line-clamp-2">{pub.title}</p>
                    )}
                    <p className="text-sm text-gray-500 mb-2">{pub.journal}{pub.year ? ` • ${pub.year}` : ''}</p>
                    <div className="flex gap-1 flex-wrap">
                      {pub.sdgs.slice(0, 4).map(sdg => (
                        <span key={sdg} className="px-1.5 py-0.5 rounded text-xs font-bold text-white"
                          style={{ backgroundColor: SDG_COLORS[sdg] || '#6b7280' }}>SDG {sdg}</span>
                      ))}
                      {pub.sdgs.length === 0 && (
                        <span className="text-sm text-gray-400">{t('ringkasan.sdg_not_analyzed')}</span>
                      )}
                    </div>
                  </div>
                ))}
                {r.recentPublications.length === 0 && (
                  <p className="text-[15px] text-gray-400 text-center py-8">{t('ringkasan.no_publications')}</p>
                )}
              </div>
              <button onClick={() => setActiveTab('publikasi')}
                className="text-[15px] text-indigo-600 font-medium mt-4 inline-flex items-center gap-1 hover:text-indigo-700">
                {t('ringkasan.view_all')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Collaborators preview */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('ringkasan.collaborators')}</h3>
              <div className="space-y-4">
                {r.collaborators.slice(0, 4).map((collab) => (
                  <div key={collab.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <img src={collab.avatar ?? '/assets/img/researcher-default.svg'} alt={collab.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      onError={(e) => { e.target.src = '/assets/img/researcher-default.svg'; }} />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-semibold text-gray-900 text-[15px] mb-0.5">{collab.name}</h4>
                      {collab.univ && <p className="text-sm text-gray-500 truncate">{collab.univ}</p>}
                    </div>
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm font-semibold shrink-0">
                      {collab.collaborations} {t('ringkasan.collaborations_unit')}
                    </span>
                  </div>
                ))}
                {r.collaborators.length === 0 && (
                  <p className="text-[15px] text-gray-400 text-center py-8">{t('ringkasan.no_collaborators')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Publikasi ── */}
      {activeTab === 'publikasi' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {t('publikasi.title')} ({r.publications})
          </h2>
          <div className="space-y-4">
            {r.recentPublications.map((pub) => (
              <div key={pub.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                {pub.doi ? (
                  <Link to={`/doi/${encodeURIComponent(pub.doi)}`}
                    className="font-bold text-gray-900 text-base leading-snug hover:text-indigo-700 transition-colors block mb-2">
                    {pub.title}
                  </Link>
                ) : (
                  <p className="font-bold text-gray-900 text-base leading-snug mb-2">{pub.title}</p>
                )}
                <p className="text-[15px] text-gray-600 mb-2">{pub.journal}{pub.year ? ` • ${pub.year}` : ''}</p>
                {pub.authors?.length > 0 && (
                  <p className="text-sm text-gray-500 mb-3">{pub.authors.join(', ')}</p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex gap-1 flex-wrap">
                    {pub.sdgs.slice(0, 5).map(sdg => (
                      <span key={sdg} className="px-2 py-0.5 rounded text-sm font-bold text-white"
                        style={{ backgroundColor: SDG_COLORS[sdg] || '#6b7280' }}>SDG {sdg}</span>
                    ))}
                    {pub.sdgs.length === 0 && (
                      <span className="text-sm text-gray-400 italic">{t('publikasi.sdg_not_analyzed')}</span>
                    )}
                  </div>
                  {pub.doi && <span className="text-sm text-gray-400 font-mono ml-auto">{pub.doi}</span>}
                </div>
              </div>
            ))}
            {r.recentPublications.length === 0 && (
              <div className="text-center py-16 text-gray-400">{t('publikasi.empty')}</div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Kolaborasi ── */}
      {activeTab === 'kolaborasi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              {t('kolaborasi.title')} ({r.collaborators.length})
            </h3>
            <div className="space-y-4">
              {r.collaborators.map((collab) => (
                <div key={collab.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <img src={collab.avatar ?? '/assets/img/researcher-default.svg'} alt={collab.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                    onError={(e) => { e.target.src = '/assets/img/researcher-default.svg'; }} />
                  <div className="flex-grow min-w-0">
                    {collab.orcid ? (
                      <Link to={`/orcid/${collab.orcid}`}
                        className="font-semibold text-gray-900 text-[15px] hover:text-indigo-600 block">{collab.name}</Link>
                    ) : (
                      <h4 className="font-semibold text-gray-900 text-[15px]">{collab.name}</h4>
                    )}
                    {collab.univ && <p className="text-sm text-gray-500 truncate">{collab.univ}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-indigo-600">{collab.collaborations}</p>
                    <p className="text-sm text-gray-400">{t('kolaborasi.collaborations_unit')}</p>
                  </div>
                </div>
              ))}
              {r.collaborators.length === 0 && (
                <p className="text-[15px] text-gray-400 text-center py-8">{t('kolaborasi.empty')}</p>
              )}
            </div>
          </div>

          <div>
            {r.affiliations.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">{t('kolaborasi.affiliations')}</h3>
                <div className="space-y-4">
                  {r.affiliations.map((aff, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <img src={aff.logo ?? '/assets/img/institution-default.svg'} alt={aff.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                        onError={(e) => { e.target.src = '/assets/img/institution-default.svg'; }} />
                      <div className="flex-grow">
                        <h4 className="font-semibold text-gray-900 text-[15px] mb-0.5">{aff.name}</h4>
                        {aff.department && <p className="text-sm text-gray-500">{aff.department}</p>}
                        {aff.role       && <p className="text-sm text-indigo-600">{aff.role}</p>}
                        {aff.is_current && (
                          <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {t('kolaborasi.active')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('kolaborasi.map_title')}</h3>
              <div className="bg-gray-50 rounded-xl p-8 text-center h-48 flex items-center justify-center">
                <div className="text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[15px]">{t('kolaborasi.map_placeholder')}</p>
                  <p className="text-sm mt-1">{t('kolaborasi.active_collaborators', { count: r.collaborators.length })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Dampak ── */}
      {activeTab === 'dampak' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
              <p className="text-4xl font-bold text-indigo-600 mb-2">{r.hIndex}</p>
              <p className="text-lg font-semibold text-gray-900 mb-1">{t('dampak.h_index_label')}</p>
              <p className="text-[15px] text-gray-500">{t('dampak.h_index_desc')}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
              <p className="text-4xl font-bold text-purple-600 mb-2">{r.i10Index}</p>
              <p className="text-lg font-semibold text-gray-900 mb-1">{t('dampak.i10_label')}</p>
              <p className="text-[15px] text-gray-500">{t('dampak.i10_desc')}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
              <p className="text-4xl font-bold text-green-600 mb-2">{r.citations.toLocaleString()}</p>
              <p className="text-lg font-semibold text-gray-900 mb-1">{t('dampak.citations_label')}</p>
              <p className="text-[15px] text-gray-500">{t('dampak.citations_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('dampak.citation_trend')}</h3>
              {r.citationTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={r.citationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="citations" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name={t('dampak.citations_label')} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-[15px]">
                  <div className="text-center">
                    <p>{t('dampak.no_citation_trend')}</p>
                    <p className="text-sm mt-1">{t('dampak.citation_trend_note')}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('dampak.publication_trend')}</h3>
              {r.publicationTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={r.publicationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name={t('tabs.publikasi')} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-[15px]">
                  {t('dampak.no_data')}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('dampak.impact_summary')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'total_articles',     value: r.publications },
                { key: 'sdgs_involved',      value: r.sdgsInvolved },
                { key: 'total_collaborators',value: r.collaboratorsCount },
                { key: 'years_active',       value: r.firstPublication ? (new Date().getFullYear() - r.firstPublication) : 'N/A' },
              ].map((item) => (
                <div key={item.key} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 mb-1">{item.value}</p>
                  <p className="text-[15px] text-gray-600">{t(`dampak.${item.key}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Tentang ── */}
      {activeTab === 'tentang' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('tentang.biography')}</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed">{r.bio}</p>
            </div>

            {r.researchInterests.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('tentang.research_interests')}</h3>
                <div className="flex flex-wrap gap-3">
                  {r.researchInterests.map((interest, idx) => (
                    <span key={idx} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[15px] font-medium border border-indigo-100">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {r.topKeywords.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('tentang.keywords')}</h3>
                <div className="flex flex-wrap justify-center items-center gap-3 py-4">
                  {r.topKeywords.map((kw, idx) => (
                    <span key={idx} className="text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors font-medium"
                      style={{ fontSize: `${(kw.size / 40) * 1.5}rem` }}>
                      {kw.text}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('tentang.academic_info')}</h3>
              <div className="space-y-3 text-[15px]">
                {[
                  { label: 'ORCID',                       value: r.orcid,         mono: true },
                  r.scopusId     && { label: 'Scopus ID', value: r.scopusId },
                  r.researcherId && { label: 'Researcher ID', value: r.researcherId },
                  r.department   && { label: t('tentang.department'),  value: r.department },
                  { label: t('tentang.institution'), value: r.univ },
                  { label: t('tentang.years_active'),value: r.yearsActive },
                  { label: t('stats.country'),       value: r.country },
                ].filter(Boolean).map((item, idx) => (
                  <div key={idx}>
                    <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                    <p className={`font-semibold text-gray-900 ${item.mono ? 'font-mono text-sm' : ''}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {r.sdgFocus.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('tentang.sdg_focus')}</h3>
                <div className="space-y-3">
                  {r.sdgFocus.slice(0, 7).map((sdg, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ backgroundColor: sdg.color }}>{sdg.sdg}</div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 truncate">{sdg.name}</span>
                          <span className="font-semibold ml-2">{sdg.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${sdg.percentage}%`, backgroundColor: sdg.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg mt-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">{t('cta.title')}</h3>
            <p className="text-indigo-100">{t('cta.subtitle')}</p>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <input type="text" placeholder={t('cta.placeholder')}
              className="flex-grow lg:w-80 px-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-white focus:outline-none" />
            <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap flex items-center gap-2">
              {t('cta.button')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResearcherProfile;