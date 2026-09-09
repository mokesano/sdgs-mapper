import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

/* ─── Detectors ─────────────────────────────────────────────────────────────
 * Order matters: check the most specific patterns first (ORCID's dash layout,
 * ResearcherID's letter prefix, DOI's "10."), then fall through to the two
 * numeric-only formats. SINTA and Scopus overlap in the shorter range, so
 * when the input is purely numeric we prompt the user to disambiguate rather
 * than guess wrong and send them to a dead lookup.
 */
const PATTERNS = {
  orcid:        /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i,
  researcherid: /^[A-Z]{1,3}-\d{4}-\d{4}$/i,
  doi:          /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i,
  numeric:      /^\d{4,12}$/,   // Scopus (6–12) or SINTA (4–10)
};

// Route builders so all downstream navigation stays consistent.
const ROUTES = {
  orcid:        (id) => `/orcid/${id}`,
  scopus:       (id) => `/scopus/${id}`,
  sinta:        (id) => `/sinta/${id}`,
  researcherid: (id) => `/researcherid/${id.toUpperCase()}`,
  doi:          (id) => `/doi/${encodeURIComponent(id)}`,
};

const HeroSearch = () => {
  const { t } = useTranslation('common_ui');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [ambiguousId, setAmbiguousId] = useState(null); // set when numeric ID needs picker
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (query === '') return;

    setIsLoading(true);
    setAmbiguousId(null);
    setStatusMsg(t('hero_search.detecting'));

    setTimeout(() => {
      setIsLoading(false);

      if (PATTERNS.orcid.test(query)) {
        setStatusMsg(t('hero_search.to_orcid'));
        navigate(ROUTES.orcid(query));
        return;
      }
      if (PATTERNS.researcherid.test(query)) {
        setStatusMsg(t('hero_search.to_researcherid'));
        navigate(ROUTES.researcherid(query));
        return;
      }
      if (PATTERNS.doi.test(query)) {
        setStatusMsg(t('hero_search.to_article'));
        navigate(ROUTES.doi(query));
        return;
      }
      if (PATTERNS.numeric.test(query)) {
        // Ambiguous: numeric could be Scopus Author ID or SINTA ID. Let the user pick.
        setAmbiguousId(query);
        setStatusMsg('');
        return;
      }
      setStatusMsg(t('hero_search.unknown'));
      setTimeout(() => setStatusMsg(''), 4500);
    }, 250);
  };

  const chooseType = (type) => {
    if (!ambiguousId) return;
    navigate(ROUTES[type](ambiguousId));
  };

  return (
    <div className="w-full bg-white rounded-3xl p-10 md:p-16 mb-8 shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Menghubungkan Riset dengan{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Tujuan Global</span>
        </h1>

        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Sciecola menganalisis dan mengklasifikasikan artikel ilmiah berdasarkan
          Sustainable Development Goals (SDGs) secara otomatis menggunakan kecerdasan buatan.
        </p>

        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-search'} text-indigo-500`}></i>
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-700 text-lg disabled:bg-gray-50"
                placeholder={t('hero_search.placeholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none"
            >
              {isLoading ? 'Memproses…' : 'Analisis Sekarang'} <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>

          <div className="flex justify-between items-center mt-3 px-2 gap-4 flex-wrap">
            <div className="text-left text-sm text-gray-500 max-w-md">
              <i className="fas fa-info-circle mr-1"></i>
              Contoh: 0000-0002-5152-9727 · 7005075676 (Scopus) · 6009471 (SINTA) · A-1234-2020 (Publons) · 10.1038/nature12373
            </div>
            {statusMsg && (
              <div className="text-right text-[15px] font-bold text-indigo-600 animate-pulse">
                {statusMsg}
              </div>
            )}
          </div>
        </form>

        {/* Disambiguation picker: numeric IDs could be Scopus or SINTA */}
        {ambiguousId && (
          <div className="mt-6 mx-auto max-w-xl bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left">
            <p className="text-[15px] text-amber-900 font-medium mb-3">
              ID <span className="font-mono">{ambiguousId}</span> berbentuk numerik.
              Pilih sumber untuk lookup:
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => chooseType('scopus')}
                className="px-4 py-2 bg-white border border-amber-300 text-amber-900 rounded-lg text-[15px] font-semibold hover:bg-amber-100 transition-colors">
                Scopus Author ID
              </button>
              <button type="button" onClick={() => chooseType('sinta')}
                className="px-4 py-2 bg-white border border-amber-300 text-amber-900 rounded-lg text-[15px] font-semibold hover:bg-amber-100 transition-colors">
                SINTA ID
              </button>
              <button type="button" onClick={() => setAmbiguousId(null)}
                className="px-4 py-2 text-amber-700 rounded-lg text-[15px] font-medium hover:bg-amber-100 transition-colors">
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSearch;