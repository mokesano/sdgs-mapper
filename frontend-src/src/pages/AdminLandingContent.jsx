import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, CheckCircle, AlertCircle, RotateCcw, Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// =====================================================================
// SCHEMA: field-field naratif yang dapat diedit admin per-bahasa.
// Setiap entri: { path: dot-path ke key konten, label, type, rows? }
// Path harus selaras dengan struktur JSON yang dikonsumsi
// PublicHomePage.jsx & locale files (id.json / en.json).
// =====================================================================

/* Skema dibungkus fungsi karena label medannya kini datang dari locale:
   t() hanya tersedia di dalam komponen, sedangkan skema ini dulu berdiri
   di lingkup modul. */
const buildSchema = (t) => [
  {
    section: 'Hero',
    fields: [
      { path: 'hero.badge',                type: 'text',     label: t('field.badge') },
      { path: 'hero.title_1',              type: 'text',     label: t('field.title_1') },
      { path: 'hero.title_2',              type: 'text',     label: t('field.title_2') },
      { path: 'hero.subtitle',             type: 'textarea', label: t('field.subtitle'), rows: 3 },
      { path: 'hero.cta_primary',          type: 'text',     label: t('field.cta_primary') },
      { path: 'hero.cta_secondary',        type: 'text',     label: t('field.cta_secondary') },
      { path: 'hero.orcid_hint_prefix',    type: 'text',     label: t('field.orcid_prefix') },
      { path: 'hero.orcid_hint_link',      type: 'text',     label: t('field.orcid_link') },
    ],
  },
  {
    section: 'Bagian Fitur',
    fields: [
      { path: 'features_section.title',    type: 'text',     label: t('field.section_title') },
      { path: 'features_section.subtitle', type: 'textarea', label: t('field.section_subtitle'), rows: 2 },
    ],
  },
  {
    section: 'Kartu Fitur (6 buah)',
    fields: Array.from({ length: 6 }, (_, i) => [
      { path: `features.${i}.title`, type: 'text',     label: `Fitur ${i + 1} — judul` },
      { path: `features.${i}.desc`,  type: 'textarea', label: `Fitur ${i + 1} — deskripsi`, rows: 2 },
    ]).flat(),
  },
  {
    section: '17 SDGs Section',
    fields: [
      { path: 'sdg_section.title',     type: 'text',     label: t('field.section_title') },
      { path: 'sdg_section.subtitle',  type: 'textarea', label: t('field.section_subtitle'), rows: 2 },
      { path: 'sdg_section.cta_label', type: 'text',     label: t('field.section_cta') },
    ],
  },
  {
    section: 'Cara Kerja — Section',
    fields: [
      { path: 'how_it_works_section.title',    type: 'text',     label: t('field.section_title') },
      { path: 'how_it_works_section.subtitle', type: 'textarea', label: t('field.section_subtitle'), rows: 2 },
    ],
  },
  {
    section: 'Cara Kerja — Langkah (3 buah)',
    fields: Array.from({ length: 3 }, (_, i) => [
      { path: `how_it_works.${i}.title`, type: 'text',     label: `Langkah ${i + 1} — judul` },
      { path: `how_it_works.${i}.desc`,  type: 'textarea', label: `Langkah ${i + 1} — deskripsi`, rows: 2 },
    ]).flat(),
  },
  {
    section: 'Bagian AI Insights',
    fields: [
      { path: 'insights_section.title',     type: 'text',     label: t('field.section_title') },
      { path: 'insights_section.subtitle',  type: 'textarea', label: t('field.section_subtitle'), rows: 2 },
      { path: 'insights_section.cta_label', type: 'text',     label: t('field.section_cta') },
    ],
  },
  {
    section: 'Bagian Partner & Sponsor',
    fields: [
      { path: 'partners_section.title',     type: 'text',     label: t('field.section_title') },
      { path: 'partners_section.subtitle',  type: 'textarea', label: t('field.section_subtitle'), rows: 2 },
      { path: 'partners_section.cta_label', type: 'text',     label: t('field.section_cta') },
    ],
  },
  {
    section: 'CTA Akhir',
    fields: [
      { path: 'cta_section.badge',          type: 'text',     label: t('field.badge') },
      { path: 'cta_section.title',          type: 'text',     label: t('field.title_1') },
      { path: 'cta_section.subtitle',       type: 'textarea', label: t('field.subtitle'), rows: 2 },
      { path: 'cta_section.cta_primary',    type: 'text',     label: t('field.cta_primary') },
      { path: 'cta_section.cta_secondary',  type: 'text',     label: t('field.cta_secondary') },
      { path: 'cta_section.trust_signals.0', type: 'text',    label: t('field.trust_1') },
      { path: 'cta_section.trust_signals.1', type: 'text',    label: t('field.trust_2') },
      { path: 'cta_section.trust_signals.2', type: 'text',    label: t('field.trust_3') },
    ],
  },
];

// Utility: get/set nested value by dot path. Supports numeric segments
// (array indices) — di-handle dengan array jika path-nya numeric.
const getByPath = (obj, path) => {
  return path.split('.').reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[key];
  }, obj);
};

// Whitelist: hanya izinkan alphanumeric + underscore + hyphen.
// Cegah __proto__, constructor, prototype dan karakter aneh lain
// agar tidak terjadi prototype pollution saat traversal.
const SAFE_KEY = /^[a-zA-Z0-9_-]+$/;
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const isSafeKey = (k) => SAFE_KEY.test(k) && !BLOCKED_KEYS.has(k);
const isPlainObject = (v) => {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};

const setByPath = (obj, path, value) => {
  const next = structuredClone(obj || {});
  const keys = path.split('.');

  if (!keys.every(isSafeKey)) {
    return next;
  }

  let cursor = next;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const shouldBeArray = /^\d+$/.test(nextKey);

    if (!Array.isArray(cursor) && !isPlainObject(cursor)) return next;

    const hasOwnSlot = Object.prototype.hasOwnProperty.call(cursor, key);
    const slot = hasOwnSlot ? cursor[key] : undefined;

    // Own-properties-only traversal: never descend through inherited chain.
    if (!hasOwnSlot) {
      cursor[key] = shouldBeArray ? [] : {};
    } else if (shouldBeArray) {
      if (!Array.isArray(slot)) cursor[key] = [];
    } else if (!isPlainObject(slot)) {
      cursor[key] = {};
    }

    cursor = cursor[key];
  }

  const lastKey = keys[keys.length - 1];
  if (!isSafeKey(lastKey)) return next;
  if (!Array.isArray(cursor) && !isPlainObject(cursor)) return next;

  // Final write guard: only assign on safe containers and safe own/new slots.
  // This keeps behavior (create/update field) while preventing dangerous chain writes.
  const hasOwnLastKey = Object.prototype.hasOwnProperty.call(cursor, lastKey);
  if (!hasOwnLastKey && BLOCKED_KEYS.has(lastKey)) return next;

  cursor[lastKey] = value;
  return next;
};

const AdminLandingContent = () => {
  const { t, i18n } = useTranslation('admin_landing');
  const schema = buildSchema(t);
  const { user } = useAuth();

  const [lang, setLang]       = useState('id');
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState(null); // {type: 'success'|'error', text}

  // Tentukan baseline locale untuk placeholder/seed default.
  // Diambil dari t() pada bahasa yang sama agar admin tahu nilai bawaan.
  const localeBaseline = useMemo(() => {
    return t('', { returnObjects: true, lng: lang, ns: 'homepage' }) || {};
  }, [t, lang, i18n.language]);

  useEffect(() => {
    setLoading(true);
    setMessage(null);
    fetch(`/api/admin/landing_content.php?lang=${encodeURIComponent(lang)}`)
      .then(r => r.json())
      .then(json => {
        if (json.status === 'success' && json.content && typeof json.content === 'object') {
          setContent(json.content);
        } else {
          setContent({});
        }
      })
      .catch(() => setContent({}))
      .finally(() => setLoading(false));
  }, [lang]);

  const handleChange = (path, value) => {
    setContent(prev => setByPath(prev, path, value));
  };

  const handleResetToLocale = () => {
    if (!confirm('Reset semua field ke nilai bawaan locale? Perubahan yang belum disimpan akan hilang.')) return;
    setContent(structuredClone(localeBaseline));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/landing_content.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          content,
          updated_by: user?.email || user?.orcid || 'admin',
        }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setMessage({ type: 'success', text: `Konten ${lang.toUpperCase()} berhasil disimpan.` });
      } else {
        throw new Error(json.message || 'Gagal menyimpan');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const dbValue     = getByPath(content, field.path);
    const localeValue = getByPath(localeBaseline, field.path);
    const value       = dbValue ?? '';
    const placeholder = typeof localeValue === 'string' ? localeValue : '';

    if (field.type === 'textarea') {
      return (
        <textarea
          rows={field.rows || 3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => handleChange(field.path, e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[15px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleChange(field.path, e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[15px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
      />
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="mt-1 text-[15px] text-gray-500">
              {t('subtitle')}
              Placeholder pada setiap kolom adalah nilai bawaan dari locale ({lang.toUpperCase()}).
            </p>
          </div>

          {/* Language switch */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
            <Languages className="ml-2 mr-1 h-4 w-4 text-gray-400" />
            {['id', 'en'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-lg px-3 py-1.5 text-[15px] font-semibold transition-all ${
                  lang === l ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Message banner */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-[15px] ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        {/* Form */}
        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">
            {t('loading')}
          </div>
        ) : (
          <div className="space-y-6">
            {schema.map((section) => (
              <section key={section.section} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">{section.section}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <div key={field.path} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">
                        {field.label}
                        <span className="ml-2 font-mono text-xs text-gray-400">{field.path}</span>
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Sticky save bar */}
            <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[15px] text-gray-500">
                Kosongkan kolom untuk menggunakan teks bawaan dari locale {lang.toUpperCase()}.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToLocale}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[15px] font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('reset')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[15px] font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Menyimpan...' : `Simpan (${lang.toUpperCase()})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminLandingContent;