import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const getSDGColor = (sdg) => {
  const colors = {
    1: 'bg-red-100 text-red-700',   2: 'bg-orange-100 text-orange-700', 3: 'bg-teal-100 text-teal-700',
    4: 'bg-rose-100 text-rose-700', 5: 'bg-pink-100 text-pink-700',     6: 'bg-blue-100 text-blue-700',
    7: 'bg-yellow-100 text-yellow-700', 8: 'bg-amber-100 text-amber-700', 9: 'bg-orange-100 text-orange-700',
    10: 'bg-pink-100 text-pink-700', 11: 'bg-amber-100 text-amber-700', 12: 'bg-yellow-100 text-yellow-700',
    13: 'bg-green-100 text-green-700', 14: 'bg-cyan-100 text-cyan-700', 15: 'bg-green-100 text-green-700',
    16: 'bg-indigo-100 text-indigo-700', 17: 'bg-purple-100 text-purple-700'
  };
  return colors[sdg] || 'bg-gray-100 text-gray-700';
};

const getStatusBadge = (status) => {
  const badges = {
    'Published':    'bg-green-50 text-green-700 border-green-200',
    'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
    'Draft':        'bg-gray-50 text-gray-700 border-gray-200',
  };
  return badges[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const MyArticles = () => {
  const { t, i18n } = useTranslation('my_articles');
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [sdgFilter, setSdgFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user?.orcid) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      orcid: user.orcid,
      page:  currentPage,
      limit: 50,
      search: searchQuery,
      status: statusFilter,
      sdg:    sdgFilter,
      sort:   sortConfig.key,
      dir:    sortConfig.direction,
    });

    fetch(`/api/my_articles.php?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          setArticles(data.articles ?? []);
          setTotal(data.total ?? 0);
        } else {
          setError(data.message || t('load_failed'));
        }
      })
      .catch(err => setError(`${t('error_prefix')} ${err.message}`))
      .finally(() => setLoading(false));
  }, [user?.orcid, currentPage, searchQuery, statusFilter, sdgFilter, sortConfig, t]);

  const filteredArticles = useMemo(() => {
    let result = [...articles];
    if (yearFilter !== 'All') result = result.filter(a => String(new Date(a.date).getFullYear()) === yearFilter);
    return result;
  }, [articles, yearFilter]);

  const years = useMemo(() => {
    const ys = [...new Set(articles.map(a => String(new Date(a.date).getFullYear())).filter(Boolean))].sort().reverse();
    return ['All', ...ys];
  }, [articles]);

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginated  = filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => setSortConfig(prev => ({
    key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
  }));

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return (
      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';

  if (!user?.orcid && !loading) {
    return (
      <main className="pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('no_orcid.title')}</h2>
          <p className="text-gray-600 mb-6">{t('no_orcid.subtitle')}</p>
          <Link to="/settings" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">
            {t('no_orcid.cta')}
          </Link>
        </div>
      </main>
    );
  }

  const stats = [
    { key: 'total',     value: articles.length,                                          icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',           color: 'text-indigo-600 bg-indigo-50' },
    { key: 'citations', value: articles.reduce((s, a) => s + (a.citations || 0), 0),    icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',                                    color: 'text-purple-600 bg-purple-50' },
    { key: 'avg_score', value: articles.length ? (articles.reduce((s, a) => s + (a.impactScore || 0), 0) / articles.length).toFixed(1) : '0.0', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-amber-600 bg-amber-50' },
    { key: 'published', value: articles.filter(a => a.status === 'Published').length,   icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-600 bg-green-50' },
  ];

  return (
    <main className="pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[15px] text-gray-600 mb-6">
        <Link to="/" className="hover:text-indigo-600">{t('breadcrumb.home')}</Link>
        <span className="text-gray-400">›</span>
        <Link to="/dashboard" className="hover:text-indigo-600">{t('breadcrumb.dashboard')}</Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-900 font-medium">{t('breadcrumb.current')}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {loading ? t('loading') : t('count', { count: total, orcid: user?.orcid || '' })}
          </p>
          <p className="text-gray-600 text-[15px] mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={`https://orcid.org/${user?.orcid}`} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-[15px] font-medium hover:bg-gray-50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {t('add_via_orcid')}
          </a>
          <Link to="/"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t('new_analysis')}
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.key} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-[15px] text-gray-600">{t(`stats.${stat.key}`)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder={t('filter.search_ph')}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="All">{t('filter.status_all')}</option>
              <option value="Published">{t('status.published')}</option>
              <option value="Under Review">{t('status.under_review')}</option>
              <option value="Draft">{t('status.draft')}</option>
            </select>
            <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              {years.map(y => <option key={y} value={y}>{y === 'All' ? t('filter.year_all') : y}</option>)}
            </select>
            <select value={sdgFilter} onChange={(e) => { setSdgFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="All">{t('filter.sdg_all')}</option>
              {[...Array(17)].map((_, i) => <option key={i + 1} value={i + 1}>SDG {i + 1}</option>)}
            </select>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('All'); setYearFilter('All'); setSdgFilter('All'); }}
              className="px-3 py-2.5 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg text-[15px] font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t('filter.reset')}
            </button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      )}

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-2">{t('table.title_journal')} <SortIcon columnKey="title" /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700 cursor-pointer hover:text-indigo-600 hidden md:table-cell" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-2">{t('table.date')} <SortIcon columnKey="date" /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700 hidden lg:table-cell">{t('table.sdgs')}</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center cursor-pointer hover:text-indigo-600 hidden sm:table-cell" onClick={() => handleSort('citations')}>
                  <div className="flex items-center justify-center gap-2">{t('table.citations')} <SortIcon columnKey="citations" /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center hidden md:table-cell">{t('table.views')}</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center cursor-pointer hover:text-indigo-600" onClick={() => handleSort('impactScore')}>
                  <div className="flex items-center justify-center gap-2">{t('table.score')} <SortIcon columnKey="impactScore" /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">{t('table.status')}</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length > 0 ? paginated.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 line-clamp-2 max-w-xs">{article.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{article.journal}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 hidden md:table-cell">
                    {new Date(article.date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {(article.sdgs || []).map(sdg => (
                        <span key={sdg} className={`px-2 py-0.5 rounded text-xs font-bold ${getSDGColor(sdg)}`}>{sdg}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-900 hidden sm:table-cell">{article.citations}</td>
                  <td className="px-6 py-4 text-center text-gray-600 hidden md:table-cell">{article.views}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${article.impactScore}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{article.impactScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-sm font-medium border ${getStatusBadge(article.status)}`}>{article.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title={t('table.action_view')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title={t('table.action_analyze')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title={t('table.action_more')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium">{t('table.empty_title')}</p>
                    <p className="text-[15px] mt-1">{t('table.empty_desc')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredArticles.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-[15px] text-gray-600">
              {t('pagination.showing', {
                from:  (currentPage - 1) * itemsPerPage + 1,
                to:    Math.min(currentPage * itemsPerPage, filteredArticles.length),
                total: filteredArticles.length,
              })}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-[15px] font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('pagination.prev')}
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-lg text-[15px] font-medium transition-colors ${
                    currentPage === idx + 1 ? 'bg-indigo-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-[15px] font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('pagination.next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyArticles;