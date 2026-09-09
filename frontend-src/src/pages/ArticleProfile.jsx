import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from 'recharts';

// UN official SDG palette
const SDG_COLORS = {
  1: '#e5243b',  2: '#dda63a',  3: '#4c9f38',  4: '#c5192d',
  5: '#ff3a21',  6: '#26bde2',  7: '#fcc30b',  8: '#a21942',
  9: '#fd6925', 10: '#dd1367', 11: '#fd9d24', 12: '#bf8b2e',
  13: '#3f7e44', 14: '#0a97d9', 15: '#56c02b', 16: '#00689d',
  17: '#19486a',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="text-[15px] font-semibold text-gray-900">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-[15px]" style={{ color: entry.color }}>
          {entry.name}: {entry.value?.toLocaleString?.() ?? entry.value}
        </p>
      ))}
    </div>
  );
};

const ArticleProfile = () => {
  const { t } = useTranslation('article_profile');
  const location = useLocation();
  const doiCode = location.pathname.replace('/doi/', '');
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('ringkasan');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const decoded = decodeURIComponent(doiCode);
      const res = await fetch(`/api/article_profile.php?doi=${encodeURIComponent(decoded)}`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setArticle(data);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('[ArticleProfile] fetch failed:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [doiCode]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  if (loading) {
    return (
      <main className="pt-[76px] pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="pt-[76px] pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('not_found.title')}</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{t('not_found.message', { doi: decodeURIComponent(doiCode) })}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchProfile}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              {t('not_found.retry')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              {t('not_found.home')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Safe references
  const a = article;
  const journal = a.journal || {};
  const authors             = Array.isArray(a.authors) ? a.authors : [];
  const sdgDistribution     = Array.isArray(a.sdgDistribution) ? a.sdgDistribution : [];
  const citationTrend       = Array.isArray(a.citationTrend) ? a.citationTrend : [];
  const performanceMetrics  = Array.isArray(a.performanceMetrics) ? a.performanceMetrics : [];
  const topCitations        = Array.isArray(a.topCitations) ? a.topCitations : [];
  const relatedArticles     = Array.isArray(a.relatedArticles) ? a.relatedArticles : [];
  const keywords            = Array.isArray(a.keywords) ? a.keywords : [];
  const preprintLinks       = Array.isArray(a.preprintLinks) ? a.preprintLinks : [];

  const TABS = [
    { id: 'ringkasan',    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'teks-kutipan', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'sdgs',         icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'metrik',       icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'kolaborasi',   icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'versi',        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'informasi',    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const sdgPalette = (sdgEntry) => SDG_COLORS[sdgEntry.sdg] || sdgEntry.color || '#6b7280';

  const EmptySection = ({ icon, message }) => (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={icon} />
      </svg>
      <p className="text-[15px]">{message}</p>
    </div>
  );

  const ICON_EMPTY_DOC = 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
  const ICON_EMPTY_CHART = 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z';
  const ICON_EMPTY_USERS = 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z';
  const ICON_EMPTY_SDG = 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z';

  return (
    <main className="pt-[76px] pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="shrink-0">
              <img
                src={a.coverImage || '/assets/img/article-default.svg'}
                alt={a.title || 'Article'}
                className="w-full sm:w-48 h-64 object-cover rounded-xl shadow-lg"
                onError={(e) => { e.target.src = '/assets/img/article-default.svg'; }}
              />
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded font-medium">{t('header.open_access')}</span>
              </div>
            </div>

            <div className="flex-grow">
              <div className="mb-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold uppercase tracking-wide">
                  {t('header.badge_classified')}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{a.title || ''}</h1>

              <div className="mb-4">
                {authors.length > 0 ? (
                  <>
                    {authors.map((author, idx) => (
                      <div key={author.id ?? idx} className="flex items-start gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-[15px]">{author.name}</span>
                        <span className="text-sm text-gray-500">{idx + 1}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-gray-500 text-[15px]">{t('header.no_authors')}</p>
                )}
              </div>

              <div className="flex gap-3 mb-6 flex-wrap">
                {a.pdf_url && (
                  <a href={a.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('header.actions.download')}
                  </a>
                )}
                <button
                  onClick={() => navigator.clipboard?.writeText(a.doi || '')}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {t('header.actions.cite')}
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {t('header.actions.share')}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[15px]">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{t('header.meta.type')}</p>
                  <p className="font-semibold text-gray-900">{a.articleType || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">{t('header.meta.language')}</p>
                  <p className="font-semibold text-gray-900">{a.language || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">{t('header.meta.published')}</p>
                  <p className="font-semibold text-gray-900">{a.publishedDate || a.year || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">{t('header.meta.publisher')}</p>
                  <p className="font-semibold text-gray-900 text-sm">{a.publisher || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'citations', value: a.citations ?? 0, color: 'text-indigo-600',
                icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
              { key: 'h_index',   value: a.hIndex ?? 0, color: 'text-purple-600',
                icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { key: 'views',     value: (a.views ?? 0).toLocaleString(), color: 'text-blue-600',
                icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
              { key: 'downloads', value: (a.downloads ?? 0).toLocaleString(), color: 'text-green-600',
                icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
            ].map((s) => (
              <div key={s.key} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <svg className={`w-5 h-5 ${s.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} />
                  </svg>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                </div>
                <p className="text-sm text-gray-600">{t(`stats.${s.key}`)}</p>
              </div>
            ))}
          </div>

          {a.altmetricScore !== undefined && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('stats.altmetric')}</p>
                  <p className="text-2xl font-bold text-gray-900">{a.altmetricScore ?? 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 transform rotate-45"></div>
              </div>
            </div>
          )}
          {a.impactScore !== undefined && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{t('stats.impact')}</p>
              <p className="text-2xl font-bold text-gray-900">{a.impactScore}</p>
            </div>
          )}
        </div>
      </div>

      {/* Primary actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => navigate(`/insights?doi=${encodeURIComponent(a.doi || '')}`)}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {t('primary_actions.analyze')}
        </button>
        <button className="w-full py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {t('primary_actions.collection')}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 border-b-2 font-medium text-[15px] whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
              </svg>
              {t(`tabs.${tab.id}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Ringkasan */}
      {activeTab === 'ringkasan' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('ringkasan.abstract')}</h3>
              {a.abstract ? (
                <p className="text-gray-600 text-[15px] leading-relaxed mb-4">{a.abstract}</p>
              ) : (
                <p className="text-[15px] text-gray-400 italic mb-4">{t('ringkasan.no_abstract')}</p>
              )}
              {keywords.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3 text-[15px]">{t('ringkasan.keywords')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((kw, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">{t('ringkasan.sdg_title')}</h3>
                {sdgDistribution.length > 0 && (
                  <button onClick={() => setActiveTab('sdgs')} className="text-[15px] text-indigo-600 font-medium hover:text-indigo-700">
                    {t('ringkasan.sdg_details')}
                  </button>
                )}
              </div>
              {sdgDistribution.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={sdgDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {sdgDistribution.map((entry, i) => <Cell key={i} fill={sdgPalette(entry)} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-grow space-y-2">
                    {sdgDistribution.slice(0, 6).map((sdg, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[15px]">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ backgroundColor: sdgPalette(sdg) }}>{sdg.sdg}</div>
                        <span className="text-gray-600 flex-grow truncate">{sdg.name}</span>
                        <span className="font-semibold text-gray-900">{sdg.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptySection icon={ICON_EMPTY_SDG} message={t('ringkasan.no_sdg')} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('ringkasan.journal_title')}</h3>
              <div className="flex gap-4 mb-4">
                <img
                  src={a.coverImage || '/assets/img/journal-default.svg'}
                  alt={journal.name || ''}
                  className="w-20 h-24 object-cover rounded-lg"
                  onError={(e) => { e.target.src = '/assets/img/journal-default.svg'; }}
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-[15px] mb-1">{journal.name || '—'}</h4>
                  {journal.issn && <p className="text-sm text-gray-600 mb-1">{t('ringkasan.issn', { value: journal.issn })}</p>}
                  {a.publisher && <p className="text-sm text-gray-600">{t('ringkasan.publisher_label', { value: a.publisher })}</p>}
                </div>
              </div>
              {journal.quartile && (
                <p className="text-sm text-gray-600 pt-4 border-t border-gray-100">
                  {t('ringkasan.quartile', { value: journal.quartile })}
                </p>
              )}
              {journal.issn && (
                <Link
                  to={`/journals/${journal.issn}`}
                  className="mt-4 w-full py-2.5 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-[15px] text-center block"
                >
                  {t('ringkasan.view_journal')}
                </Link>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('ringkasan.article_info')}</h3>
              <div className="space-y-3 text-[15px]">
                {[
                  { label: 'doi',       value: a.doi },
                  { label: 'eissn',     value: journal.eissn },
                  { label: 'pissn',     value: journal.pissn },
                  { label: t('meta.volume'),    value: journal.volume },
                  { label: t('meta.issue'),     value: journal.issue },
                  { label: t('meta.pages'),     value: journal.pages },
                  { label: t('meta.published'), value: a.publishedDate },
                  { label: t('meta.type'),      value: a.articleType },
                ].filter((f) => f.value).map((f) => (
                  <div key={f.label} className="flex justify-between">
                    <span className="text-gray-600">{t(`fields.${f.label}`)}</span>
                    <span className="font-semibold text-gray-900 text-sm ml-2 text-right">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">{t('ringkasan.preprint')}</h3>
                {preprintLinks.length > 0 && (
                  <button onClick={() => setActiveTab('versi')} className="text-[15px] text-indigo-600 font-medium hover:text-indigo-700">
                    {t('ringkasan.view_all')}
                  </button>
                )}
              </div>
              {preprintLinks.length > 0 ? (
                <div className="space-y-4">
                  {preprintLinks.slice(0, 3).map((pp, idx) => (
                    <a key={idx} href={pp.preprint_url} target="_blank" rel="noopener noreferrer"
                      className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors block">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">
                        {(pp.preprint_server || '').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-[15px] font-medium text-gray-900 line-clamp-1">{pp.preprint_server}</p>
                        <p className="text-sm text-gray-500">{pp.publication_date}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <EmptySection icon={ICON_EMPTY_DOC} message={t('ringkasan.no_preprint')} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Teks & Kutipan */}
      {activeTab === 'teks-kutipan' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('teks_kutipan.abstract_full')}</h3>
            {a.abstract ? (
              <p className="text-gray-700 leading-relaxed text-[15px]">{a.abstract}</p>
            ) : (
              <p className="text-[15px] text-gray-400 italic">{t('ringkasan.no_abstract')}</p>
            )}
            {keywords.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">{t('ringkasan.keywords')}</h4>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-[15px]">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">{t('teks_kutipan.top_citations')}</h3>
              <span className="text-[15px] text-gray-500">{t('teks_kutipan.total_citations', { count: a.citations ?? 0 })}</span>
            </div>
            {topCitations.length > 0 ? (
              <div className="space-y-4">
                {topCitations.map((c, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-indigo-700 font-bold text-[15px]">#{idx + 1}</span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-900 text-[15px] mb-1">{c.title}</h4>
                      <p className="text-sm text-gray-500 mb-2">{c.journal}</p>
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded text-sm font-semibold">
                        {t('teks_kutipan.citations_label', { count: c.citations })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptySection icon={ICON_EMPTY_DOC} message={t('teks_kutipan.no_top_citations')} />
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">{t('teks_kutipan.citation_trend')}</h3>
            {citationTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={citationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="citations" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} name={t('stats.citations')} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptySection icon={ICON_EMPTY_CHART} message={t('metrik.no_metrics')} />
            )}
          </div>
        </div>
      )}

      {/* Tab: SDGs */}
      {activeTab === 'sdgs' && (
        <div className="space-y-6">
          {sdgDistribution.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">{t('sdgs_tab.title')}</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={sdgDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                        {sdgDistribution.map((entry, i) => <Cell key={i} fill={sdgPalette(entry)} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">{t('sdgs_tab.details')}</h3>
                  <div className="space-y-4">
                    {sdgDistribution.map((sdg, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: sdgPalette(sdg) }} />
                            <span className="text-[15px] font-medium text-gray-800">SDG {sdg.sdg} — {sdg.name}</span>
                          </div>
                          <span className="text-[15px] font-bold text-gray-700">{sdg.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full">
                          <div className="h-2 rounded-full transition-all" style={{ width: `${sdg.value}%`, background: sdgPalette(sdg) }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                <h3 className="font-bold text-indigo-900 mb-2">{t('sdgs_tab.about_title')}</h3>
                <p className="text-[15px] text-indigo-700 leading-relaxed">{t('sdgs_tab.about_text')}</p>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm">
              <EmptySection icon={ICON_EMPTY_SDG} message={t('sdgs_tab.no_sdg')} />
            </div>
          )}
        </div>
      )}

      {/* Tab: Metrik */}
      {activeTab === 'metrik' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { key: 'total_views',     value: (a.views ?? 0).toLocaleString(),     bgColor: 'bg-blue-50',   textColor: 'text-blue-600',
                icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
              { key: 'total_downloads', value: (a.downloads ?? 0).toLocaleString(), bgColor: 'bg-green-50',  textColor: 'text-green-600',
                icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
              { key: 'total_citations', value: (a.citations ?? 0).toLocaleString(), bgColor: 'bg-indigo-50', textColor: 'text-indigo-600',
                icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
              { key: 'altmetric',       value: a.altmetricScore ?? 0,                bgColor: 'bg-orange-50', textColor: 'text-orange-600',
                icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
            ].map((m) => (
              <div key={m.key} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${m.bgColor}`}>
                  <svg className={`w-6 h-6 ${m.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={m.icon} />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{m.value}</p>
                <p className="text-[15px] text-gray-600">{t(`metrik.${m.key}`)}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">{t('metrik.performance_year')}</h3>
            {performanceMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="citations" fill="#6366f1" name={t('stats.citations')} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="downloads" fill="#10b981" name={t('stats.downloads')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptySection icon={ICON_EMPTY_CHART} message={t('metrik.no_metrics')} />
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">{t('metrik.views_trend')}</h3>
            {performanceMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="views" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name={t('stats.views')} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptySection icon={ICON_EMPTY_CHART} message={t('metrik.no_metrics')} />
            )}
          </div>
        </div>
      )}

      {/* Tab: Kolaborasi */}
      {activeTab === 'kolaborasi' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">{t('kolaborasi.authors')}</h3>
            {authors.length > 0 ? (
              <div className="space-y-4">
                {authors.map((author, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-indigo-700 font-bold text-[15px]">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{author.name}</p>
                      {author.affiliation && <p className="text-[15px] text-gray-500 mt-0.5">{author.affiliation}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptySection icon={ICON_EMPTY_USERS} message={t('kolaborasi.no_authors')} />
            )}
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">{t('kolaborasi.related')}</h3>
            {relatedArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedArticles.map((r, idx) => (
                  <Link key={idx} to={`/doi/${encodeURIComponent(r.doi)}`}
                    className="block p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {(r.sdgs || []).map((s) => (
                        <span key={s} className="px-2 py-0.5 text-sm font-bold rounded text-white"
                          style={{ backgroundColor: SDG_COLORS[s] || '#6b7280' }}>SDG {s}</span>
                      ))}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-[15px] group-hover:text-indigo-600 transition-colors line-clamp-2">{r.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{r.journal}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptySection icon={ICON_EMPTY_DOC} message={t('kolaborasi.no_related')} />
            )}
          </div>
        </div>
      )}

      {/* Tab: Versi */}
      {activeTab === 'versi' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">{t('versi.title')}</h3>
          {preprintLinks.length > 0 ? (
            <div className="space-y-4">
              {preprintLinks.map((pp, idx) => (
                <a key={idx} href={pp.preprint_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {(pp.preprint_server || '').charAt(0).toUpperCase() + (pp.preprint_server || '').slice(1)}
                      </h4>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-sm font-medium">{t('versi.preprint')}</span>
                    </div>
                    <p className="text-[15px] text-gray-600 line-clamp-1">{pp.preprint_doi || pp.preprint_url}</p>
                    <p className="text-sm text-gray-500 mt-1">{t('versi.source', { source: pp.source || 'CrossRef', date: pp.publication_date || '—' })}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ICON_EMPTY_DOC} />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">{t('versi.no_title')}</p>
              <p className="text-[15px] text-gray-400 mt-1 max-w-md mx-auto">{t('versi.no_subtitle')}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Informasi */}
      {activeTab === 'informasi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5">{t('informasi.article_info')}</h3>
            <dl className="space-y-3 text-[15px]">
              {[
                { label: 'doi',       value: a.doi },
                { label: 'eissn',     value: journal.eissn },
                { label: 'pissn',     value: journal.pissn },
                { label: t('meta.volume'),    value: journal.volume },
                { label: t('meta.issue'),     value: journal.issue },
                { label: t('meta.pages'),     value: journal.pages },
                { label: t('meta.type'),      value: a.articleType },
                { label: t('meta.language'),  value: a.language },
                { label: t('meta.published'), value: a.publishedDate },
                { label: t('meta.publisher'), value: a.publisher },
              ].filter((f) => f.value).map((f) => (
                <div key={f.label} className="flex gap-4 py-2 border-b border-gray-50 last:border-0">
                  <dt className="w-28 shrink-0 text-gray-500">{t(`fields.${f.label}`)}</dt>
                  <dd className="font-medium text-gray-800 break-all">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-6">
            {journal.name && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-5">{t('informasi.journal')}</h3>
                <Link
                  to={journal.issn ? `/journals/${journal.issn}` : '/journals'}
                  className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-600 text-[15px]">{journal.name}</p>
                    {(journal.eissn || journal.pissn) && (
                      <p className="text-sm text-gray-500 mt-1">
                        {journal.eissn && `EISSN: ${journal.eissn}`}
                        {journal.eissn && journal.pissn && ' | '}
                        {journal.pissn && `PISSN: ${journal.pissn}`}
                      </p>
                    )}
                    {(a.publisher || journal.country) && (
                      <p className="text-sm text-gray-500">{a.publisher || ''}{a.publisher && journal.country ? ' · ' : ''}{journal.country || ''}</p>
                    )}
                    {journal.quartile && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-sm font-medium">{journal.quartile}</span>
                    )}
                  </div>
                </Link>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('informasi.copyright')}</h3>
              <div className="space-y-2 text-[15px]">
                <div className="flex gap-3">
                  <span className="text-gray-500 w-24 shrink-0">{t('informasi.copyright_label')}</span>
                  <span className="font-medium text-gray-800">{t('informasi.copyright_value', { year: new Date().getFullYear() })}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 w-24 shrink-0">{t('informasi.license_label')}</span>
                  <a href="https://creativecommons.org/licenses/by/4.0/" className="font-medium text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
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

export default ArticleProfile;