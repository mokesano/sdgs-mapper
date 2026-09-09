import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/* ─── constants ─────────────────────────────────────────────────────────── */

const TYPE_CFG = {
  academic:   { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  nonprofit:  { bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500'    },
  industry:   { bg: 'bg-violet-50',   text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500'  },
  government: { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
};

const STAT_ICONS = {
  total:      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  academic:   'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  nonprofit:  'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  industry:   'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  government: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
};

/* ─── org initials fallback ──────────────────────────────────────────────── */
const OrgAvatar = ({ name, type }) => {
  const cfg = TYPE_CFG[type] ?? TYPE_CFG.academic;
  const initials = (name ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <span className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
      {initials}
    </span>
  );
};

/* ─── partner card ───────────────────────────────────────────────────────── */
const PartnerCard = ({ partner, t }) => {
  const [imgErr, setImgErr] = useState(false);
  const cfg = TYPE_CFG[partner.type] ?? TYPE_CFG.academic;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
      {/* logo row */}
      <div className="px-5 pt-5 pb-4 flex items-start gap-4">
        {!imgErr && partner.logo ? (
          <img src={partner.logo} alt={partner.name}
            onError={() => setImgErr(true)}
            className="w-14 h-14 rounded-xl object-contain flex-shrink-0 bg-gray-50 p-1" />
        ) : (
          <OrgAvatar name={partner.name} type={partner.type} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-base leading-snug flex-1 min-w-0">{partner.name}</h3>
            <TypeBadge type={partner.type} t={t} />
          </div>
          {partner.since > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{t('card.since', { year: partner.since })}</p>
          )}
        </div>
      </div>

      {/* divider */}
      <div className="mx-5 border-t border-gray-100" />

      {/* body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {partner.description && (
          <p className="text-[15px] text-gray-600 leading-relaxed line-clamp-3 flex-1">
            {partner.description}
          </p>
        )}

        {partner.cooperation_areas?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {t('card.cooperation')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {partner.cooperation_areas.slice(0, 5).map((area, i) => (
                <span key={i}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {partner.website && (
          <a href={partner.website} target="_blank" rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-1.5 text-[15px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors group-hover:underline">
            {t('card.website')}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

/* ─── type badge ─────────────────────────────────────────────────────────── */
const TypeBadge = ({ type, t }) => {
  const cfg = TYPE_CFG[type] ?? TYPE_CFG.academic;
  return (
    <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {t(`type_label.${type}`, { defaultValue: type })}
    </span>
  );
};

/* ─── main ────────────────────────────────────────────────────────────────── */
const Partners = () => {
  const { t } = useTranslation('partners');

  const [partners,   setPartners]   = useState([]);
  const [typeCounts, setTypeCounts] = useState({});
  const [activeType, setActiveType] = useState('all');
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/wrapper/partners.php?limit=200');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'error');
      setPartners(json.partners ?? []);
      setTypeCounts(json.type_counts ?? {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = partners.filter(p => {
    const matchType = activeType === 'all' || p.type === activeType;
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q) ||
      (p.cooperation_areas ?? []).some(a => a.toLowerCase().includes(q));
    return matchType && matchSearch;
  });

  const hasFilter = activeType !== 'all' || search.trim() !== '';
  const totalAll  = partners.length;

  return (
    <>
      <main className="pt-[68px] pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[15px] text-gray-600 mb-8">
          <Link to="/" className="hover:text-indigo-600 transition-colors">{t('breadcrumb.home')}</Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-900 font-medium">{t('breadcrumb.current')}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{t('header.title')}</h1>
          <p className="text-lg text-gray-600 max-w-3xl">{t('header.subtitle')}</p>
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
            {[
              { key: 'total', value: totalAll },
              ...Object.keys(TYPE_CFG).map(k => ({ key: k, value: typeCounts[k] ?? 0 })),
            ].map(({ key, value }) => {
              const cfg = TYPE_CFG[key];
              return (
                <div key={key}
                  className={`rounded-xl border p-4 flex items-center gap-3 ${
                    cfg ? `${cfg.bg} ${cfg.border}` : 'bg-white border-gray-200'
                  }`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    cfg ? `bg-white/60 ${cfg.text}` : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={STAT_ICONS[key] ?? STAT_ICONS.total} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    <p className={`text-sm font-medium ${cfg ? cfg.text : 'text-gray-600'}`}>{t(`stats.${key}`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Search + type filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('filter.search')}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', ...Object.keys(TYPE_CFG)].map(type => {
              const count = type === 'all' ? totalAll : (typeCounts[type] ?? 0);
              const cfg = TYPE_CFG[type];
              return (
                <button key={type} onClick={() => setActiveType(type)}
                  className={`px-3.5 py-2 rounded-xl text-[15px] font-medium transition-colors flex items-center gap-1.5 ${
                    activeType === type
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}>
                  {cfg && activeType === type && (
                    <span className="w-2 h-2 rounded-full bg-white/60 flex-shrink-0" />
                  )}
                  {t(`filter.${type}`)}
                  <span className={`text-sm px-1.5 py-0.5 rounded-full ${
                    activeType === type ? 'bg-white/25' : 'bg-gray-100 text-gray-500'
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-gray-500">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            {t('loading')}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <p className="text-red-600 font-medium">{t('error')}</p>
            <button onClick={fetchData}
              className="px-5 py-2 bg-red-600 text-white rounded-xl text-[15px] font-medium hover:bg-red-700 transition-colors">
              {t('retry')}
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-800">
                {t(`empty.${hasFilter ? 'no_match' : 'no_data'}.title`)}
              </p>
              <p className="text-[15px] text-gray-500 text-center max-w-sm">
                {t(`empty.${hasFilter ? 'no_match' : 'no_data'}.subtitle`)}
              </p>
              {hasFilter && (
                <button onClick={() => { setActiveType('all'); setSearch(''); }}
                  className="mt-1 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[15px] font-medium hover:bg-indigo-700 transition-colors">
                  {t('action.reset')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(p => (
                <PartnerCard key={p.id} partner={p} t={t} />
              ))}
            </div>
          )
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold mb-2">{t('cta.title')}</h3>
              <p className="text-indigo-100">{t('cta.subtitle')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link to="/contact?subject=partnership"
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2 text-[15px] whitespace-nowrap">
                {t('cta.button')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

      </main>
    </>
  );
};

export default Partners;