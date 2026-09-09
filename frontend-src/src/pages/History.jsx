import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/* ─── event-type styling ─────────────────────────────────────────────────── */

const TYPE_CFG = {
  milestone:   { color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: 'M5 13l4 4L19 7' },
  feature:     { color: 'bg-indigo-100 text-indigo-700 border-indigo-300',    icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  partnership: { color: 'bg-purple-100 text-purple-700 border-purple-300',    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  award:       { color: 'bg-amber-100 text-amber-700 border-amber-300',       icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L4.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' },
  research:    { color: 'bg-blue-100 text-blue-700 border-blue-300',          icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
};

/* ─── component ──────────────────────────────────────────────────────────── */

const History = () => {
  const { t, i18n } = useTranslation('history');

  const [timeline,     setTimeline]      = useState({});
  const [stats,        setStats]         = useState([]);
  const [statsLoading, setStatsLoading]  = useState(true);
  const [loading,      setLoading]       = useState(true);
  const [error,        setError]         = useState(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/platform_timeline.php?limit=100&sort=date');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'error');
      setTimeline(json.timeline ?? {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeline();
    setStatsLoading(true);
    fetch('/api/platform_stats.php')
      .then(r => r.json())
      .then(j => { if (j.status === 'success') setStats(j.data ?? []); })
      .catch(() => setStats([]))
      .finally(() => setStatsLoading(false));
  }, [fetchTimeline]);

  /* sort years descending, filter events */
  const years = Object.keys(timeline).sort((a, b) => Number(b) - Number(a));
  const filtered = years
    .map(year => ({
      year,
      events: (timeline[year] ?? []).filter(e => !showFeaturedOnly || e.is_featured),
    }))
    .filter(g => g.events.length > 0);

  const isEmpty = !loading && !error && filtered.length === 0;
  const localeStr = i18n.language === 'id' ? 'id-ID' : 'en-US';

  return (
      <main className="pt-[68px] pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[15px] text-gray-600 mb-8">
          <Link to="/"      className="hover:text-indigo-600 transition-colors">{t('breadcrumb.home')}</Link>
          <span className="text-gray-400">›</span>
          <Link to="/about" className="hover:text-indigo-600 transition-colors">{t('breadcrumb.about')}</Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-900 font-medium">{t('breadcrumb.current')}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 text-orange-500 mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{t('header.title')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('header.subtitle')}</p>
        </div>

        {/* Filter pills */}
        <div className="flex justify-center mb-10 gap-2">
          <button onClick={() => setShowFeaturedOnly(false)}
            className={`px-4 py-2 rounded-full text-[15px] font-medium transition-colors ${
              !showFeaturedOnly
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}>
            {t('filter.all')}
          </button>
          <button onClick={() => setShowFeaturedOnly(true)}
            className={`px-4 py-2 rounded-full text-[15px] font-medium transition-colors flex items-center gap-1.5 ${
              showFeaturedOnly
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {t('filter.featured')}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            {t('loading')}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <p className="text-red-600 font-medium">{t('error')}</p>
            <button onClick={fetchTimeline}
              className="px-5 py-2 bg-red-600 text-white rounded-xl text-[15px] font-medium hover:bg-red-700 transition-colors">
              {t('retry')}
            </button>
          </div>
        )}

        {/* Empty */}
        {isEmpty && (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-800">{t('empty.title')}</p>
            <p className="text-[15px] text-gray-500 text-center max-w-sm">{t('empty.subtitle')}</p>
          </div>
        )}

        {/* Timeline */}
        {!loading && !error && filtered.length > 0 && (
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-300 via-orange-400 to-orange-300 transform md:-translate-x-1/2" />

            <div className="space-y-12">
              {filtered.map(({ year, events }) => (
                <div key={year} className="relative">
                  <div className="text-center mb-8 relative z-10">
                    <h2 className="text-3xl font-bold text-orange-500 bg-white inline-block px-6 py-2 rounded-2xl">{year}</h2>
                  </div>
                  <div className="space-y-4">
                    {events.map((event, idx) => {
                      const cfg  = TYPE_CFG[event.type] ?? TYPE_CFG.milestone;
                      const side = idx % 2 === 0 ? 'right' : 'left';
                      const monthLabel = event.date
                        ? new Date(event.date).toLocaleDateString(localeStr, { month: 'long' })
                        : '';
                      return (
                        <div key={event.id ?? idx}
                          className={`relative flex items-center gap-8 ${side === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                          <div className={`ml-12 md:ml-0 md:w-1/2 ${side === 'left' ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                            <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                {monthLabel && (
                                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                                    {monthLabel}
                                  </span>
                                )}
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${cfg.color}`}>
                                  {t(`type_label.${event.type}`, { defaultValue: event.type })}
                                </span>
                                {event.is_featured && (
                                  <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                )}
                              </div>
                              <h4 className="font-bold text-gray-900 text-lg mb-2">{event.title}</h4>
                              {event.description && (
                                <p className="text-[15px] text-gray-600 leading-relaxed">{event.description}</p>
                              )}
                              {event.impact_area && (
                                <p className={`text-sm text-gray-400 mt-3 ${side === 'left' ? 'md:text-right' : 'md:text-left'}`}>
                                  {event.impact_area}
                                </p>
                              )}
                              {event.link && (
                                <a href={event.link} target="_blank" rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-1 text-sm mt-3 text-orange-600 hover:text-orange-700 font-medium ${side === 'left' ? 'md:float-right md:clear-both' : ''}`}>
                                  {t('action.learn_more')}
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 z-10">
                            <div className={`w-12 h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center ${cfg.color}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cfg.icon} />
                              </svg>
                            </div>
                          </div>

                          <div className="hidden md:block md:w-1/2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform-today summary from DB */}
        <section className="mt-20">
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">{t('summary.title')}</h2>
          {statsLoading ? (
            <p className="text-center text-gray-500 py-6">{t('summary.loading')}</p>
          ) : stats.length === 0 ? (
            <p className="text-center text-gray-500 py-6">{t('summary.empty')}</p>
          ) : (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.slice(0, 4).map((s, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm text-center">
                  <p className="text-2xl font-bold text-orange-500">{s.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-3">{t('cta.title')}</h3>
            <p className="text-indigo-100 mb-6">{t('cta.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/become-sponsor" className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
                {t('cta.sponsor')}
              </Link>
              <Link to="/contact" className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-400 transition-colors">
                {t('cta.contact')}
              </Link>
            </div>
          </div>
        </div>

      </main>
  );
};

export default History;