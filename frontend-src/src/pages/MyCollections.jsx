import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const MyCollections = () => {
  const { user } = useAuth();
  const { t } = useTranslation('my_collections');

  const [collections, setCollections]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [privacyFilter, setPrivacyFilter] = useState('all');
  const [sortBy, setSortBy]             = useState('updated');
  const [viewMode, setViewMode]         = useState('card');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [toast, setToast]               = useState(null);

  const [draft, setDraft] = useState({ name: '', description: '', privacy: 'private', tags: '' });

  const fetchCollections = useCallback(async () => {
    if (!user?.orcid) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/my_collections.php?orcid=${encodeURIComponent(user.orcid)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setCollections(Array.isArray(data.data) ? data.data : []);
      } else {
        setCollections([]);
      }
    } catch (err) {
      console.error('[MyCollections] fetch failed:', err);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [user?.orcid]);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    let result = [...collections];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (Array.isArray(c.tags) ? c.tags : []).some((tag) => String(tag).toLowerCase().includes(q))
      );
    }
    if (privacyFilter !== 'all') {
      result = result.filter((c) => c.privacy === privacyFilter);
    }
    result.sort((a, b) => {
      if (sortBy === 'name')  return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'items') return (b.itemCount || 0) - (a.itemCount || 0);
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });
    return result;
  }, [collections, searchQuery, privacyFilter, sortBy]);

  const hasActiveFilters = searchQuery.trim() !== '' || privacyFilter !== 'all';
  const resetAll = () => { setSearchQuery(''); setPrivacyFilter('all'); };

  const stats = useMemo(() => ({
    total:      collections.length,
    totalItems: collections.reduce((sum, c) => sum + (c.itemCount || 0), 0),
    public:     collections.filter((c) => c.privacy === 'public').length,
    private:    collections.filter((c) => c.privacy === 'private').length,
  }), [collections]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    try {
      const res = await fetch('/api/my_collections.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orcid:       user.orcid,
          action:      'create',
          name:        draft.name,
          description: draft.description,
          privacy:     draft.privacy,
          tags:        draft.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setDraft({ name: '', description: '', privacy: 'private', tags: '' });
        setIsModalOpen(false);
        showToast(t('toast.created'));
        fetchCollections();
      } else {
        showToast(t('toast.error', { message: data.message || 'Unknown' }));
      }
    } catch (err) {
      showToast(t('toast.error', { message: err.message }));
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch('/api/my_collections.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orcid: user.orcid, action: 'delete', id }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCollections((prev) => prev.filter((c) => c.id !== id));
        showToast(t('toast.deleted'));
      } else {
        showToast(t('toast.error', { message: data.message || 'Unknown' }));
      }
    } catch (err) {
      showToast(t('toast.error', { message: err.message }));
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const diff = Math.floor((Date.now() - date.getTime()) / 86_400_000);
    if (diff === 0) return t('card.time.today');
    if (diff === 1) return t('card.time.yesterday');
    if (diff < 7)   return t('card.time.days_ago', { count: diff });
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (!user?.orcid && !loading) {
    return (
      <main className="pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('auth_required.title')}</h2>
          <p className="text-gray-600 mb-6">{t('auth_required.subtitle')}</p>
          <Link to="/settings" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 inline-flex items-center gap-2">
            {t('auth_required.button')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[15px] text-gray-600 mb-6" aria-label={t('aria.breadcrumb')}>
        <Link to="/" className="hover:text-indigo-600 transition-colors">{t('breadcrumb.home')}</Link>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">{t('breadcrumb.dashboard')}</Link>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        <span className="text-gray-900 font-medium">{t('breadcrumb.current')}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('header.title')}</h1>
          <p className="text-gray-600 mt-1">{t('header.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          {t('header.new')}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3"/>
          <span className="text-gray-600">{t('loading')}</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: t('stats.total'),   value: stats.total,      icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',                                          bg: 'bg-indigo-50', text: 'text-indigo-600' },
              { label: t('stats.items'),   value: stats.totalItems, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', bg: 'bg-purple-50', text: 'text-purple-600' },
              { label: t('stats.public'),  value: stats.public,     icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-green-50',  text: 'text-green-600'  },
              { label: t('stats.private'), value: stats.private,    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',                bg: 'bg-amber-50',  text: 'text-amber-600'  },
            ].map((s, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 ${s.bg} ${s.text} rounded-lg flex items-center justify-center shrink-0`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon}/></svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-[15px] text-gray-600">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-grow relative">
                <input
                  type="text"
                  placeholder={t('filters.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <div className="flex gap-3">
                <select value={privacyFilter} onChange={(e) => setPrivacyFilter(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] text-gray-700 focus:ring-2 focus:ring-indigo-500">
                  <option value="all">{t('filters.privacy.all')}</option>
                  <option value="public">{t('filters.privacy.public')}</option>
                  <option value="private">{t('filters.privacy.private')}</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] text-gray-700 focus:ring-2 focus:ring-indigo-500">
                  <option value="updated">{t('filters.sort.updated')}</option>
                  <option value="name">{t('filters.sort.name')}</option>
                  <option value="items">{t('filters.sort.items')}</option>
                </select>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('card')}
                    aria-label={t('filters.view.card_aria')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label={t('filters.view.list_aria')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid/List or Empty */}
          {filtered.length > 0 ? (
            <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filtered.map((col) => {
                const items = Array.isArray(col.items) ? col.items : [];
                const tags  = Array.isArray(col.tags)  ? col.tags  : [];
                return (
                  <div
                    key={col.id}
                    className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all ${viewMode === 'list' ? 'flex flex-col sm:flex-row gap-4 p-4' : 'overflow-hidden'}`}
                  >
                    {/* Preview */}
                    <div className={viewMode === 'list' ? 'w-full sm:w-48 shrink-0' : 'bg-gray-50 p-4 border-b border-gray-100'}>
                      <div className="grid grid-cols-3 gap-2 h-24">
                        {items.length > 0 ? items.slice(0, 3).map((doi, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-center text-xs text-gray-600 text-center leading-tight line-clamp-3 break-all">
                            {doi}
                          </div>
                        )) : (
                          <div className="col-span-3 flex flex-col items-center justify-center text-gray-400 text-sm gap-1">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5l-2 3h-2l-2-3H4"/></svg>
                            {t('card.preview_empty')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-lg truncate">{col.name}</h3>
                            {col.privacy === 'public' ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">{t('card.badge.public')}</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-bold">{t('card.badge.private')}</span>
                            )}
                          </div>
                          {col.description && <p className="text-[15px] text-gray-600 line-clamp-2 mb-3">{col.description}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0 ml-2">
                          <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title={t('card.actions.share')} aria-label={t('card.actions.share')}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                          </button>
                          <Link to={`/collections/${col.id}/edit`} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title={t('card.actions.edit')} aria-label={t('card.actions.edit')}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </Link>
                          <button onClick={() => handleDelete(col.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title={t('card.actions.delete')} aria-label={t('card.actions.delete')}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </div>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium">{tag}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            {t('card.items_unit', { count: col.itemCount || 0 })}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            {formatDate(col.updated_at)}
                          </span>
                        </div>
                        <Link to={`/collections/${col.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                          {t('card.open')}
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : hasActiveFilters ? (
            /* Empty: no match */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('empty.no_match.title')}</h3>
              <p className="text-gray-500 text-[15px] mb-6 max-w-md mx-auto">{t('empty.no_match.subtitle')}</p>
              <button onClick={resetAll} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[15px] font-medium hover:bg-indigo-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                {t('empty.no_match.reset')}
              </button>
            </div>
          ) : (
            /* Empty: no data */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('empty.no_data.title')}</h3>
              <p className="text-gray-600 text-[15px] mb-6 max-w-md mx-auto">{t('empty.no_data.subtitle')}</p>
              <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                {t('empty.no_data.button')}
              </button>
            </div>
          )}

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">{t('modal.title')}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label={t('modal.cancel')}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                  <div>
                    <label className="block text-[15px] font-medium text-gray-700 mb-1">
                      {t('modal.name_label')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={t('modal.name_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-[15px] font-medium text-gray-700 mb-1">{t('modal.desc_label')}</label>
                    <textarea
                      rows={3}
                      value={draft.description}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      placeholder={t('modal.desc_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-[15px] font-medium text-gray-700 mb-1">{t('modal.tags_label')}</label>
                    <input
                      type="text"
                      value={draft.tags}
                      onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={t('modal.tags_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-[15px] font-medium text-gray-700 mb-1">{t('modal.privacy_label')}</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="privacy" value="private" checked={draft.privacy === 'private'} onChange={(e) => setDraft({ ...draft, privacy: e.target.value })} className="text-indigo-600 focus:ring-indigo-500"/>
                        <span className="text-[15px] text-gray-700">{t('modal.privacy_private')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="privacy" value="public" checked={draft.privacy === 'public'} onChange={(e) => setDraft({ ...draft, privacy: e.target.value })} className="text-indigo-600 focus:ring-indigo-500"/>
                        <span className="text-[15px] text-gray-700">{t('modal.privacy_public')}</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      {t('modal.cancel')}
                    </button>
                    <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                      {t('modal.submit')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              <span className="text-[15px] font-medium">{toast}</span>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default MyCollections;