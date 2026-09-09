import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { LoadingSpinner } from '../components/shared';

const SDG_COLORS = {
  1:'#E5243B',2:'#DDA63A',3:'#4C9F38',4:'#C5192D',5:'#FF3A21',
  6:'#26BDE2',7:'#FCC30B',8:'#A21942',9:'#FD6925',10:'#DD1367',
  11:'#FD9D24',12:'#BF8B2E',13:'#3F7E44',14:'#0A97D9',15:'#56C02B',
  16:'#00689D',17:'#19486A',
};

const STAT_COLORS = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  green:  { bg: 'bg-green-50',  text: 'text-green-600'  },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-600'  },
  pink:   { bg: 'bg-pink-50',   text: 'text-pink-600'   },
};

const EmptySection = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={icon} />
      </svg>
    </div>
    <p className="text-[15px] text-gray-400 max-w-xs">{message}</p>
  </div>
);

const InstitutionProfile = () => {
  const { id } = useParams();
  const { t } = useTranslation('institution_profile');
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(`/api/institution_profile.php?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.status === 'success' && data.institution) {
        const inst = data.institution;
        const stats = data.statistics || {};

        // API returns publication_trend as [{year, publications, citations, average_citation}].
        // Derive citation_trend from the same rows so the area chart has data.
        const pubTrend = Array.isArray(data.publication_trend) ? data.publication_trend : [];
        const citationTrend = Array.isArray(data.citation_trend) && data.citation_trend.length
          ? data.citation_trend
          : pubTrend.map((row) => ({ year: row.year, citations: row.citations || 0 }));

        // API returns sdg_focus as a numeric array [4, 7, 9, 11, 13] OR already-shaped objects.
        // Normalize to {sdg, count, name} so Pie/Bar/labels render correctly.
        const rawSdg = Array.isArray(stats.sdg_focus) ? stats.sdg_focus : [];
        const sdgList = rawSdg.map((entry) => {
          if (typeof entry === 'number') {
            return { sdg: entry, count: 1, name: `SDG ${entry}` };
          }
          const num = entry?.sdg ?? entry?.number ?? entry?.id;
          return {
            sdg:   typeof num === 'number' ? num : parseInt(num, 10),
            count: entry?.count ?? entry?.publications ?? 1,
            name:  entry?.name ?? (num != null ? `SDG ${num}` : ''),
          };
        }).filter((e) => Number.isFinite(e.sdg));

        // API researchers use h_index (snake_case); normalize to hIndex for the UI.
        const topResearchers = (data.top_researchers || []).map((r) => ({
          ...r,
          hIndex: r.hIndex ?? r.h_index ?? 0,
        }));

        setProfileData({
          institution: {
            ...inst,
            publications:   stats.publications   || 0,
            researchers:    stats.researchers    || 0,
            citations:      stats.citations      || 0,
            hIndex:         stats.hIndex         || 0,
            i10Index:       stats.i10Index       || 0,
            journals:       stats.journals       || 0,
            collaborations: stats.collaborations || 0,
            sdgs:           sdgList.length,
            location:       [inst.city, inst.country].filter(Boolean).join(', '),
          },
          publication_trend:   pubTrend,
          citation_trend:      citationTrend,
          top_researchers:     topResearchers,
          top_publications:    data.top_publications     || [],
          news:                data.news                 || [],
          sdg_list:            sdgList,
          collaborators:       data.collaborators        || data.top_collaborators || [],
          affiliated_journals: data.affiliated_journals  || data.journals || [],
          research_topics:     data.research_topics      || [],
        });
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Institution fetch error:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const inst = profileData?.institution || null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-[15px]">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-indigo-600">{payload[0].name}: {payload[0].value?.toLocaleString()}</p>
      </div>
    );
  };

  const tabs = [
    { id: 'ringkasan',  icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'publikasi',  icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'peneliti',   icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'sdgs',       icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'kolaborasi', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { id: 'jurnal',     icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
    { id: 'berita',     icon: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z' },
    { id: 'informasi',  icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const statsConfig = [
    { key: 'publications',   field: 'publications',   icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'indigo' },
    { key: 'researchers',    field: 'researchers',    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'blue' },
    { key: 'journals',       field: 'journals',       icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', color: 'purple' },
    { key: 'collaborations', field: 'collaborations', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', color: 'green' },
    { key: 'citations',      field: 'citations',      icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', color: 'amber' },
    { key: 'sdgs',           field: 'sdgs',           icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'pink' },
  ];

  return (
    <main className="pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[15px] text-gray-600 mb-6" aria-label={t('aria.breadcrumb')}>
        <Link to="/" className="hover:text-indigo-600 transition-colors">{t('breadcrumb.home')}</Link>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        <Link to="/institutions" className="hover:text-indigo-600 transition-colors">{t('breadcrumb.institutions')}</Link>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        <span className="text-gray-900 font-medium">{t('breadcrumb.current')}</span>
      </nav>

      {loading && <div className="flex justify-center py-20"><LoadingSpinner /></div>}

      {/* Not found */}
      {!loading && notFound && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('not_found.title')}</h3>
          <p className="text-[15px] text-gray-500 mb-4">{t('not_found.subtitle')}</p>
          <Link to="/institutions" className="inline-flex items-center gap-1 text-[15px] text-indigo-600 font-medium hover:text-indigo-700">
            {t('not_found.back')}
          </Link>
        </div>
      )}

      {/* Profile */}
      {!loading && !notFound && profileData && inst && (
        <>
          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Logo + details */}
            <div className="lg:col-span-2 flex flex-col sm:flex-row gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm self-start shrink-0">
                <img
                  src={inst.logo}
                  alt={inst.name}
                  className="w-32 h-32 object-contain mx-auto mb-4"
                  onError={(e) => { e.target.src = '/assets/img/institution-default.svg'; }}
                />
                <h1 className="text-lg font-bold text-gray-900 text-center mb-2">{inst.name}</h1>
                <div className="flex flex-wrap gap-2 justify-center">
                  {inst.type && <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium">{inst.type}</span>}
                  {inst.country && <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">{inst.country}</span>}
                </div>
              </div>

              <div className="flex-grow min-w-0 p-2">
                <p className="text-[15px] text-gray-600 mb-5 leading-relaxed">
                  {inst.description || inst.motto || t('header.no_description')}
                </p>
                <div className="space-y-3 text-[15px]">
                  {inst.website && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                      <a href={inst.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
                        {t('header.fields.website')}: {inst.website}
                      </a>
                    </div>
                  )}
                  {inst.location && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      <span>{t('header.fields.location')}: {inst.location}</span>
                    </div>
                  )}
                  {inst.established_year && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <span>{t('header.fields.established', { value: inst.established_year })}</span>
                    </div>
                  )}
                  {(inst.institution_type || inst.type) && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      <span>{t('header.fields.type', { value: inst.institution_type || inst.type })}</span>
                    </div>
                  )}
                  {inst.rector && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      <span className="truncate">{t('header.fields.rector', { value: inst.rector })}</span>
                    </div>
                  )}
                  {inst.faculties != null && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      <span>{t('header.fields.faculties', { value: inst.faculties })}</span>
                    </div>
                  )}
                  {inst.students != null && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                      <span>{t('header.fields.students', { value: inst.students })}</span>
                    </div>
                  )}
                  {inst.lecturers != null && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      <span>{t('header.fields.lecturers', { value: inst.lecturers })}</span>
                    </div>
                  )}
                </div>

                {/* Social links */}
                <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
                  {inst.website && (
                    <a href={inst.website} target="_blank" rel="noopener noreferrer" aria-label={t('header.social.globe')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-600 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                    </a>
                  )}
                  {inst.linkedin_url && (
                    <a href={inst.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label={t('header.social.linkedin')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-600 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
                    </a>
                  )}
                  {inst.youtube_url && (
                    <a href={inst.youtube_url} target="_blank" rel="noopener noreferrer" aria-label={t('header.social.youtube')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-600 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                  )}
                  {inst.instagram_url && (
                    <a href={inst.instagram_url} target="_blank" rel="noopener noreferrer" aria-label={t('header.social.instagram')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-600 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="lg:col-span-1">
              <div className="grid grid-cols-2 gap-2">
                {statsConfig.map(({ key, field, icon, color }) => {
                  const c = STAT_COLORS[color];
                  return (
                    <div key={key} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center shrink-0`}>
                          <svg className={`w-4 h-4 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}/>
                          </svg>
                        </div>
                        <span className="text-sm text-gray-500">{t(`stats.${key}`)}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{(inst[field] || 0).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                  <span className="text-[15px] text-gray-500">{t('stats.hindex')}</span>
                  <span className="text-xl font-bold text-gray-900">{inst.hIndex || 0}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                  <span className="text-[15px] text-gray-500">{t('stats.i10')}</span>
                  <span className="text-xl font-bold text-gray-900">{inst.i10Index || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs nav */}
          <div className="border-b border-gray-200 mb-8 overflow-x-auto">
            <nav className="flex gap-1 min-w-max" aria-label={t('aria.tabs')}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-[15px] whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}/>
                  </svg>
                  {t(`tabs.${tab.id}`)}
                </button>
              ))}
            </nav>
          </div>

          {/* ── Ringkasan ── */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Publication trend */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">{t('ringkasan.publication_trend')}</h3>
                  {profileData.publication_trend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={profileData.publication_trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                        <XAxis dataKey="year" stroke="#6b7280" fontSize={12}/>
                        <YAxis stroke="#6b7280" fontSize={12}/>
                        <Tooltip content={<CustomTooltip />}/>
                        <Bar dataKey="publications" fill="#6366f1" radius={[4,4,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptySection
                      icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      message={t('ringkasan.empty.trend')}
                    />
                  )}
                </div>

                {/* SDG distribution */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">{t('ringkasan.sdg_distribution')}</h3>
                  {profileData.sdg_list.length > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={profileData.sdg_list} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="count">
                            {profileData.sdg_list.map((entry) => (
                              <Cell key={entry.sdg} fill={SDG_COLORS[entry.sdg] || '#6366f1'}/>
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1.5 shrink-0">
                        {profileData.sdg_list.slice(0, 6).map((entry) => (
                          <div key={entry.sdg} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: SDG_COLORS[entry.sdg] || '#6366f1' }}/>
                            <span className="text-gray-600">SDG {entry.sdg}</span>
                            <span className="font-semibold text-gray-900">{entry.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptySection
                      icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      message={t('ringkasan.empty.sdg')}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Research topics */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">{t('ringkasan.research_topics')}</h3>
                  {profileData.research_topics.length > 0 ? (
                    <div className="flex flex-wrap justify-center items-center gap-3 py-6 bg-gray-50 rounded-xl">
                      {profileData.research_topics.map((topic, idx) => (
                        <span key={idx} className="text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors font-medium"
                          style={{ fontSize: `${Math.max(0.7, Math.min(1.5, (topic.size || topic.count || 12) / 32))}rem` }}>
                          {topic.text || topic.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <EmptySection
                      icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                      message={t('ringkasan.empty.topics')}
                    />
                  )}
                </div>

                {/* Citation trend */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">{t('ringkasan.citation_trend')}</h3>
                  {profileData.citation_trend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={profileData.citation_trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                        <XAxis dataKey="year" stroke="#6b7280" fontSize={12}/>
                        <YAxis stroke="#6b7280" fontSize={12}/>
                        <Tooltip content={<CustomTooltip />}/>
                        <Area type="monotone" dataKey="citations" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptySection
                      icon="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      message={t('ringkasan.empty.citation')}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Collaboration map */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">{t('ringkasan.collaboration_map')}</h3>
                  <div className="bg-gray-50 rounded-xl p-8 h-52 flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-14 h-14 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-[15px]">{t('ringkasan.map_placeholder')}</p>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-indigo-200 rounded"/><span className="text-gray-500">{t('ringkasan.map_legend_high')}</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-indigo-50 rounded border border-indigo-100"/><span className="text-gray-500">{t('ringkasan.map_legend_low')}</span></div>
                  </div>
                </div>

                {/* Top collaborators */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-bold text-gray-900">{t('ringkasan.top_collaborators')}</h3>
                    <button onClick={() => setActiveTab('kolaborasi')} className="text-[15px] text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                      {t('ringkasan.view_all_collab')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                  {profileData.collaborators.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.collaborators.slice(0, 5).map((c, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <img src={c.logo} alt={c.name} className="w-10 h-10 rounded-lg object-cover shrink-0"
                            onError={(e) => { e.target.src = '/assets/img/institution-default.svg'; }}/>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-semibold text-gray-900 text-[15px] truncate">{c.name}</h4>
                            <p className="text-sm text-gray-500 truncate">{c.country}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[15px] font-bold text-gray-900">{c.publications}</p>
                            <p className="text-sm text-gray-500">{t('ringkasan.publications_unit')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptySection
                      icon="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      message={t('ringkasan.empty.collaborators')}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Affiliated journals */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-bold text-gray-900">{t('ringkasan.journals_title')}</h3>
                    <button onClick={() => setActiveTab('jurnal')} className="text-[15px] text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                      {t('ringkasan.view_all_journals')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                  {profileData.affiliated_journals.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.affiliated_journals.slice(0, 5).map((j, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">JR</div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-gray-900 text-[15px] truncate">{j.name || j.title}</h4>
                              {j.eissn && <p className="text-sm text-gray-500">E-ISSN: {j.eissn}</p>}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <p className="text-[15px] font-bold text-indigo-600">{j.total_articles || j.publications || 0}</p>
                            <p className="text-sm text-gray-500">{t('ringkasan.articles_unit')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptySection
                      icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      message={t('ringkasan.empty.journals')}
                    />
                  )}
                </div>

                {/* News */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-bold text-gray-900">{t('ringkasan.news_title')}</h3>
                    <button onClick={() => setActiveTab('berita')} className="text-[15px] text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                      {t('ringkasan.view_all_news')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                  {profileData.news.length > 0 ? (
                    <div className="space-y-4">
                      {profileData.news.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <img src={item.image} alt={item.title} className="w-20 h-16 object-cover rounded-lg shrink-0"
                            onError={(e) => { e.target.src = '/assets/img/article-default.svg'; }}/>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-semibold text-gray-900 text-[15px] mb-1 line-clamp-2">{item.title}</h4>
                            <p className="text-sm text-gray-500">{item.date || item.published_at}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptySection
                      icon="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
                      message={t('ringkasan.empty.news')}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Publikasi ── */}
          {activeTab === 'publikasi' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('publikasi.title')}</h2>
              {profileData.top_publications.length > 0 ? (
                <div className="space-y-4">
                  {profileData.top_publications.map((pub, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-bold text-[15px] shrink-0">{idx + 1}</div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-semibold text-gray-900 text-[15px] mb-1 line-clamp-2">
                          {pub.doi ? (
                            <Link to={`/doi/${encodeURIComponent(pub.doi)}`} className="hover:text-indigo-600 transition-colors">{pub.title}</Link>
                          ) : pub.title}
                        </h4>
                        {pub.authors && <p className="text-sm text-gray-500 mb-2">{pub.authors}</p>}
                        <div className="flex gap-3 text-sm text-gray-500">
                          {pub.year && <span>{t('publikasi.year')}: {pub.year}</span>}
                          {pub.citations != null && <span>{t('publikasi.citations')}: {pub.citations.toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection
                  icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  message={t('publikasi.empty')}
                />
              )}
            </div>
          )}

          {/* ── Peneliti ── */}
          {activeTab === 'peneliti' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('peneliti.title')}</h2>
              {profileData.top_researchers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profileData.top_researchers.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                      <img src={r.photo || r.avatar} alt={r.name} className="w-12 h-12 rounded-full object-cover shrink-0"
                        onError={(e) => { e.target.src = '/assets/img/researcher-default.svg'; }}/>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 text-[15px] truncate">
                          {r.orcid ? (
                            <Link to={`/orcid/${r.orcid}`} className="hover:text-indigo-600">{r.name}</Link>
                          ) : r.name}
                        </h4>
                        {r.department && <p className="text-sm text-gray-500 truncate">{r.department}</p>}
                        <div className="flex gap-3 text-sm text-gray-500 mt-1">
                          {r.hIndex != null && <span>{t('peneliti.hindex')}: {r.hIndex}</span>}
                          {r.citations != null && <span>{t('peneliti.citations')}: {r.citations.toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection
                  icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  message={t('peneliti.empty')}
                />
              )}
            </div>
          )}

          {/* ── SDGs ── */}
          {activeTab === 'sdgs' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('sdgs_tab.title')}</h2>
              {profileData.sdg_list.length > 0 ? (() => {
                const total = profileData.sdg_list.reduce((s, x) => s + (x.count || 0), 0);
                return (
                  <div className="space-y-4">
                    {profileData.sdg_list.map((sdg) => {
                      const pct = total > 0 ? Math.round(((sdg.count || 0) / total) * 100) : 0;
                      return (
                        <div key={sdg.sdg} className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                            style={{ backgroundColor: SDG_COLORS[sdg.sdg] || '#6366f1' }}>
                            {sdg.sdg}
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between text-[15px] mb-1">
                              <span className="font-medium text-gray-700">{sdg.name || `SDG ${sdg.sdg}`}</span>
                              <span className="text-gray-500 shrink-0 ml-2">{sdg.count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: SDG_COLORS[sdg.sdg] || '#6366f1' }}/>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })() : (
                <EmptySection
                  icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  message={t('sdgs_tab.empty')}
                />
              )}
            </div>
          )}

          {/* ── Kolaborasi ── */}
          {activeTab === 'kolaborasi' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('kolaborasi_tab.title')}</h2>
              {profileData.collaborators.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profileData.collaborators.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                      <img src={c.logo} alt={c.name} className="w-12 h-12 rounded-lg object-cover shrink-0"
                        onError={(e) => { e.target.src = '/assets/img/institution-default.svg'; }}/>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-semibold text-gray-900 text-[15px] truncate">{c.name}</h4>
                        <p className="text-sm text-gray-500">{c.country}</p>
                        <p className="text-sm text-indigo-600 font-medium mt-1">{c.publications} {t('ringkasan.publications_unit')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection
                  icon="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  message={t('kolaborasi_tab.empty')}
                />
              )}
            </div>
          )}

          {/* ── Jurnal ── */}
          {activeTab === 'jurnal' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('jurnal_tab.title')}</h2>
              {profileData.affiliated_journals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profileData.affiliated_journals.map((j, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">JR</div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 text-[15px] truncate">
                            {j.slug ? (
                              <Link to={`/journals/${j.slug}`} className="hover:text-indigo-600">{j.name || j.title}</Link>
                            ) : (j.name || j.title)}
                          </h4>
                          {j.eissn && <p className="text-sm text-gray-500">E-ISSN: {j.eissn}</p>}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-[15px] font-bold text-indigo-600">{j.total_articles || j.publications || 0}</p>
                        <p className="text-sm text-gray-500">{t('ringkasan.articles_unit')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection
                  icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  message={t('jurnal_tab.empty')}
                />
              )}
            </div>
          )}

          {/* ── Berita ── */}
          {activeTab === 'berita' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('berita.title')}</h2>
              {profileData.news.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profileData.news.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                      <img src={item.image} alt={item.title} className="w-24 h-20 object-cover rounded-lg shrink-0"
                        onError={(e) => { e.target.src = '/assets/img/article-default.svg'; }}/>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-semibold text-gray-900 text-[15px] mb-1 line-clamp-2">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.date || item.published_at}</p>
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline mt-1 inline-block">{t('action.read_more')}</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection
                  icon="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
                  message={t('berita.empty')}
                />
              )}
            </div>
          )}

          {/* ── Informasi ── */}
          {activeTab === 'informasi' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('informasi_tab.title')}</h2>
              {inst ? (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ['name', inst.name],
                    ['type', inst.type || inst.institution_type],
                    ['country', inst.country],
                    ['city', inst.city],
                    ['location', inst.location],
                    ['website', inst.website],
                    ['established', inst.established_year],
                    ['rector', inst.rector],
                    ['faculties', inst.faculties],
                    ['students', inst.students],
                    ['lecturers', inst.lecturers],
                    ['motto', inst.motto],
                    ['description', inst.description],
                  ].filter(([, v]) => v != null && v !== '').map(([key, val]) => (
                    <div key={key} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">{key}</dt>
                      <dd className="text-[15px] text-gray-900 font-medium break-words">
                        {key === 'website' ? (
                          <a href={val} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{val}</a>
                        ) : String(val)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-[15px] text-gray-500">{t('informasi_tab.no_data')}</p>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{t('cta.title', { name: inst.name })}</h3>
                <p className="text-indigo-100">{t('cta.subtitle')}</p>
              </div>
              <div className="flex gap-3 w-full lg:w-auto">
                <input type="text" placeholder={t('cta.placeholder')}
                  className="flex-grow lg:w-80 px-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-white focus:outline-none text-[15px]"/>
                <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap flex items-center gap-2 text-[15px]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  {t('cta.button')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default InstitutionProfile;