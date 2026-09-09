import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/* ─── constants ─────────────────────────────────────────────────────────── */

const TIER_CFG = {
  platinum: {
    ring:    'ring-2 ring-slate-300',
    header:  'bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200',
    badge:   'bg-gradient-to-r from-slate-200 to-slate-100 text-slate-700 border border-slate-300',
    label:   'text-slate-600',
    accent:  '#94a3b8',
  },
  gold: {
    ring:    'ring-2 ring-yellow-200',
    header:  'bg-gradient-to-r from-yellow-50 via-white to-yellow-50 border-b border-yellow-100',
    badge:   'bg-gradient-to-r from-yellow-200 to-yellow-100 text-yellow-800 border border-yellow-300',
    label:   'text-yellow-700',
    accent:  '#f59e0b',
  },
  silver: {
    ring:    'ring-1 ring-gray-200',
    header:  'bg-gray-50 border-b border-gray-100',
    badge:   'bg-gray-100 text-gray-600 border border-gray-200',
    label:   'text-gray-500',
    accent:  '#9ca3af',
  },
  bronze: {
    ring:    'ring-1 ring-amber-100',
    header:  'bg-amber-50 border-b border-amber-100',
    badge:   'bg-amber-100 text-amber-700 border border-amber-200',
    label:   'text-amber-600',
    accent:  '#d97706',
  },
};

const TIER_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

/* ─── OrgInitials fallback ───────────────────────────────────────────────── */
const OrgAvatar = ({ name, tier }) => {
  const accent = TIER_CFG[tier]?.accent ?? '#6366f1';
  const initials = (name ?? '').split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <span className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
      style={{ backgroundColor: accent }}>
      {initials}
    </span>
  );
};

/* ─── sponsor card ───────────────────────────────────────────────────────── */
const SponsorCard = ({ sponsor, t, large = false }) => {
  const [imgErr, setImgErr] = useState(false);
  const cfg = TIER_CFG[sponsor.tier] ?? TIER_CFG.bronze;

  return (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col ${cfg.ring}`}>
      {/* tier strip */}
      <div className={`px-5 py-2.5 flex items-center justify-between ${cfg.header}`}>
        <span className={`text-xs font-bold uppercase tracking-widest ${cfg.label}`}>
          {t('tier_label', { tier: sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1) })}
        </span>
        {sponsor.since > 0 && (
          <span className="text-xs text-gray-400">{t('card.since', { year: sponsor.since })}</span>
        )}
      </div>

      {/* body */}
      <div className={`p-5 flex flex-col flex-1 ${large ? 'gap-4' : 'gap-3'}`}>
        <div className="flex items-start gap-4">
          {!imgErr && sponsor.logo ? (
            <img src={sponsor.logo} alt={sponsor.name}
              onError={() => setImgErr(true)}
              className="w-16 h-16 rounded-xl object-contain flex-shrink-0 bg-gray-50 p-1" />
          ) : (
            <OrgAvatar name={sponsor.name} tier={sponsor.tier} />
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-gray-900 leading-snug ${large ? 'text-lg' : 'text-base'}`}>
              {sponsor.name}
            </h3>
          </div>
        </div>

        {sponsor.description && (
          <p className="text-[15px] text-gray-600 leading-relaxed flex-1 line-clamp-3">
            {sponsor.description}
          </p>
        )}

        {sponsor.focus_areas?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sponsor.focus_areas.slice(0, 4).map((area, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                {area}
              </span>
            ))}
          </div>
        )}

        {sponsor.website && (
          <a href={sponsor.website} target="_blank" rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-1.5 text-[15px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
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

/* ─── main ────────────────────────────────────────────────────────────────── */
const Sponsors = () => {
  const { t } = useTranslation('sponsors');

  const [sponsors,    setSponsors]    = useState([]);
  const [tierCounts,  setTierCounts]  = useState({});
  const [activeTier,  setActiveTier]  = useState('all');
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '200' });
      const res  = await fetch(`/api/wrapper/sponsors.php?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'error');
      setSponsors(json.sponsors ?? []);
      setTierCounts(json.tier_counts ?? {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* filter client-side so tabs respond instantly */
  const filtered = sponsors.filter(s => {
    const matchTier   = activeTier === 'all' || s.tier === activeTier;
    const matchSearch = !search.trim() ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description ?? '').toLowerCase().includes(search.toLowerCase());
    return matchTier && matchSearch;
  });

  const totalActive = sponsors.length;
  const hasFilter = activeTier !== 'all' || search.trim() !== '';

  /* group by tier for section headers */
  const byTier = TIER_ORDER.reduce((acc, t) => {
    acc[t] = filtered.filter(s => s.tier === t);
    return acc;
  }, {});

  const showSection = (tier) => byTier[tier].length > 0;

  return (
      <main className="pt-[68px] pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[15px] text-gray-600 mb-8">
          <Link to="/" className="hover:text-indigo-600 transition-colors">{t('breadcrumb.home')}</Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-900 font-medium">{t('breadcrumb.current')}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{t('header.title')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('header.subtitle')}</p>
        </div>

        {/* Stats row */}
        {!loading && !error && (
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <StatChip icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              value={totalActive} label={t('stats.total')} color="indigo" />
            {TIER_ORDER.map(tier => (
              <StatChip key={tier}
                value={tierCounts[tier] ?? 0}
                label={t(`stats.${tier}`)}
                color={tier === 'platinum' ? 'slate' : tier === 'gold' ? 'amber' : tier === 'silver' ? 'gray' : 'orange'}
                accent={TIER_CFG[tier].accent} />
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('filter.search')}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', ...TIER_ORDER].map(tier => {
              const count = tier === 'all'
                ? sponsors.length
                : (tierCounts[tier] ?? 0);
              return (
                <button key={tier} onClick={() => setActiveTier(tier)}
                  className={`px-4 py-2 rounded-xl text-[15px] font-medium transition-colors flex items-center gap-1.5 ${
                    activeTier === tier
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}>
                  {t(`filter.${tier}`)}
                  <span className={`text-sm px-1.5 py-0.5 rounded-full ${activeTier === tier ? 'bg-white/25' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
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

        {/* Content */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <EmptyState hasFilter={hasFilter} t={t}
                onReset={() => { setActiveTier('all'); setSearch(''); }} />
            ) : (
              <div className="space-y-12">
                {/* Platinum — hero layout */}
                {showSection('platinum') && (
                  <TierSection tier="platinum" sponsors={byTier.platinum} t={t}
                    gridCols="grid-cols-1 md:grid-cols-2" large />
                )}
                {/* Gold */}
                {showSection('gold') && (
                  <TierSection tier="gold" sponsors={byTier.gold} t={t}
                    gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
                )}
                {/* Silver */}
                {showSection('silver') && (
                  <TierSection tier="silver" sponsors={byTier.silver} t={t}
                    gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
                )}
                {/* Bronze */}
                {showSection('bronze') && (
                  <TierSection tier="bronze" sponsors={byTier.bronze} t={t}
                    gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
                )}
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{t('cta.title')}</h3>
              <p className="text-indigo-100 max-w-xl">{t('cta.subtitle')}</p>
            </div>
            <Link to="/become-sponsor"
              className="px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap flex items-center gap-2 text-[15px]">
              {t('cta.button')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

      </main>
  );
};

/* ─── tier section ───────────────────────────────────────────────────────── */
const TierSection = ({ tier, sponsors, t, gridCols, large = false }) => {
  const cfg = TIER_CFG[tier];
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 rounded-full" style={{ backgroundColor: cfg.accent }} />
        <h2 className="text-lg font-bold text-gray-900 capitalize">
          {tier.charAt(0).toUpperCase() + tier.slice(1)} Sponsors
        </h2>
        <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${cfg.badge}`}>
          {sponsors.length}
        </span>
      </div>
      <div className={`grid ${gridCols} gap-5`}>
        {sponsors.map(s => (
          <SponsorCard key={s.id} sponsor={s} t={t} large={large} />
        ))}
      </div>
    </section>
  );
};

/* ─── stat chip ──────────────────────────────────────────────────────────── */
const StatChip = ({ icon, value, label, color, accent }) => (
  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
    {icon ? (
      <svg className={`w-4 h-4 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
      </svg>
    ) : (
      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
    )}
    <span className="text-lg font-bold text-gray-900">{value}</span>
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

/* ─── empty state ────────────────────────────────────────────────────────── */
const EmptyState = ({ hasFilter, onReset, t }) => {
  const variant = hasFilter ? 'no_match' : 'no_data';
  return (
    <div className="flex flex-col items-center py-20 gap-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <p className="font-semibold text-gray-800">{t(`empty.${variant}.title`)}</p>
      <p className="text-[15px] text-gray-500 text-center max-w-sm">{t(`empty.${variant}.subtitle`)}</p>
      {hasFilter && (
        <button onClick={onReset}
          className="mt-1 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[15px] font-medium hover:bg-indigo-700 transition-colors">
          {t('action.reset')}
        </button>
      )}
      {!hasFilter && (
        <Link to="/become-sponsor"
          className="mt-1 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[15px] font-medium hover:bg-indigo-700 transition-colors">
          {t('cta.button')}
        </Link>
      )}
    </div>
  );
};

export default Sponsors;