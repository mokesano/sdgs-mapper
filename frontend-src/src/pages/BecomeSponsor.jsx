import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { useTranslation, Trans } from 'react-i18next';
import toast from 'react-hot-toast';

/* ─── constants ─────────────────────────────────────────────────────────── */

const TIER_STYLE = {
  platinum: { ring: 'border-indigo-300',  badge: 'bg-indigo-100  text-indigo-800  border-indigo-300',  btn: 'bg-indigo-600 hover:bg-indigo-700' },
  gold:     { ring: 'border-yellow-300',  badge: 'bg-yellow-100  text-yellow-800  border-yellow-300',  btn: 'bg-yellow-600 hover:bg-yellow-700' },
  silver:   { ring: 'border-gray-300',    badge: 'bg-gray-100    text-gray-700    border-gray-300',    btn: 'bg-gray-600   hover:bg-gray-700'   },
  bronze:   { ring: 'border-amber-300',   badge: 'bg-amber-100   text-amber-800   border-amber-300',   btn: 'bg-amber-600  hover:bg-amber-700'  },
};

const ORG_TYPES = ['government','academic','corporate','ngo','international','other'];

const COUNTRY_CODES = [
  'indonesia','malaysia','singapore','thailand','philippines',
  'vietnam','australia','japan','south-korea','other',
];

const COUNTRY_LABELS = {
  indonesia:'Indonesia',  malaysia:'Malaysia',   singapore:'Singapore',
  thailand:'Thailand',    philippines:'Philippines', vietnam:'Vietnam',
  australia:'Australia',  japan:'Japan',         'south-korea':'South Korea',
  other:'Other',
};

const BENEFIT_ICONS = {
  global:      'M13 10V3L4 14h7v7l9-11h-7z',
  credibility: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  data_access: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
};

const TIER_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

/* ─── component ──────────────────────────────────────────────────────────── */

const BecomeSponsor = () => {
  const { t } = useTranslation('become_sponsor');

  /* ── data from API ─────────────────────────────────────────────── */
  const [tiers,            setTiers]            = useState([]);
  const [tiersLoading,     setTiersLoading]     = useState(true);
  const [testimonials,     setTestimonials]     = useState([]);
  const [testiLoading,     setTestiLoading]     = useState(true);
  const [stats,            setStats]            = useState(null);

  const fetchTiers = useCallback(async () => {
    setTiersLoading(true);
    try {
      const r = await fetch('/api/wrapper/become_sponsor.php?action=tiers');
      const j = await r.json();
      if (j.status === 'success') setTiers(j.data ?? []);
    } catch (e) { /* keep empty → triggers empty state */ }
    finally     { setTiersLoading(false); }
  }, []);

  const fetchTestimonials = useCallback(async () => {
    setTestiLoading(true);
    try {
      const r = await fetch('/api/wrapper/become_sponsor.php?action=testimonials&limit=3');
      const j = await r.json();
      if (j.status === 'success') setTestimonials(j.data ?? []);
    } catch (e) { /* keep empty */ }
    finally     { setTestiLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch('/api/wrapper/become_sponsor.php?action=stats');
      const j = await r.json();
      if (j.status === 'success') setStats(j.data);
    } catch (e) { /* silent */ }
  }, []);

  useEffect(() => {
    fetchTiers();
    fetchTestimonials();
    fetchStats();
  }, [fetchTiers, fetchTestimonials, fetchStats]);

  /* ── form state ────────────────────────────────────────────────── */
  const [formData, setFormData] = useState({
    organizationName: '', organizationType: '', contactName: '',
    email: '', phone: '', website: '', country: '',
    tier: '', message: '',
    newsletter: false, privacy: false,
  });
  const [errors, setErrors]               = useState({});
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [activeStep, setActiveStep]       = useState(1);
  const [submitted, setSubmitted]         = useState(false);
  const [expandedFaq, setExpandedFaq]     = useState(null);

  const selectTier = (tierId) => {
    setFormData(prev => ({ ...prev, tier: tierId }));
    setTimeout(() => {
      document.getElementById('sponsor-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.organizationName.trim()) errs.organizationName = 'required';
      if (!formData.organizationType)        errs.organizationType = 'required';
      if (!formData.contactName.trim())      errs.contactName      = 'required';
      if (!formData.email.trim())            errs.email = 'required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'email';
    }
    if (step === 2) {
      if (!formData.message.trim())                 errs.message = 'required';
      else if (formData.message.trim().length < 20) errs.message = 'message';
      if (!formData.privacy)                        errs.privacy = 'privacy';
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep(activeStep);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setActiveStep(prev => Math.min(prev + 1, 2));
  };

  const handleBack = () => {
    setErrors({});
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep(2);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/wrapper/become_sponsor.php?action=apply', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_name: formData.organizationName,
          organization_type: formData.organizationType,
          contact_name:      formData.contactName,
          email:             formData.email,
          phone:             formData.phone,
          website:           formData.website,
          country:           formData.country,
          tier:              formData.tier,
          message:           formData.message,
          newsletter:        formData.newsletter,
          privacy:           formData.privacy,
        }),
      });
      const json = await res.json();

      if (!res.ok || json.status !== 'success') {
        if (json.errors) setErrors(mapServerErrors(json.errors));
        toast.error(t('form.errors.server'));
        return;
      }

      setSubmitted(true);
      toast.success(t('success.title'));
    } catch (err) {
      toast.error(t('form.errors.server'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      organizationName: '', organizationType: '', contactName: '',
      email: '', phone: '', website: '', country: '',
      tier: '', message: '', newsletter: false, privacy: false,
    });
    setActiveStep(1);
    setErrors({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const orderedTiers = [...tiers].sort(
    (a, b) => TIER_ORDER.indexOf(a.id) - TIER_ORDER.indexOf(b.id)
  );
  const selectedTierObj = tiers.find(tt => tt.id === formData.tier);

  /* ── render ────────────────────────────────────────────────────── */
  return (
    <main className="pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[15px] text-gray-600 mb-6">
        <Link to="/"         className="hover:text-indigo-600 transition-colors">{t('breadcrumb.home')}</Link>
        <span className="text-gray-400">›</span>
        <Link to="/sponsors" className="hover:text-indigo-600 transition-colors">{t('breadcrumb.sponsors')}</Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-900 font-medium">{t('breadcrumb.current')}</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{t('header.title')}</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t('header.subtitle')}</p>
      </div>

      {/* Stats */}
      {stats && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { key: 'active_sponsors',  value: stats.active_sponsors  },
            { key: 'researcher_reach', value: stats.researcher_reach },
            { key: 'countries',        value: stats.countries_count  },
            { key: 'publications',     value: stats.publications     },
          ].map(s => (
            <div key={s.key} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-2xl lg:text-3xl font-bold text-indigo-600">{(s.value ?? 0).toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">{t(`stats.${s.key}`)}</p>
            </div>
          ))}
        </section>
      )}

      {submitted ? (
        /* ── Success State ───────────────────────────────────────── */
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('success.title')}</h2>
            <p className="text-gray-600 mb-6">{t('success.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/sponsors" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                {t('success.view_sponsors')}
              </Link>
              <button onClick={resetForm}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                {t('success.submit_another')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Benefits */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['global', 'credibility', 'data_access'].map((key) => (
                <div key={key} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={BENEFIT_ICONS[key]} />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{t(`benefits.${key}.title`)}</h3>
                  <p className="text-[15px] text-gray-600">{t(`benefits.${key}.description`)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tiers */}
          {!formData.tier && (
            <section className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('tiers.title')}</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">{t('tiers.subtitle')}</p>
              </div>

              {tiersLoading ? (
                <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  {t('tiers.loading')}
                </div>
              ) : orderedTiers.length === 0 ? (
                <div className="bg-gray-50 rounded-xl py-10 text-center text-gray-500">
                  {t('tiers.empty')}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {orderedTiers.map(tier => {
                    const style    = TIER_STYLE[tier.id] ?? TIER_STYLE.bronze;
                    const features = t(`tier_features.${tier.id}`, { returnObjects: true, defaultValue: [] });
                    return (
                      <div key={tier.id}
                        className={`bg-white rounded-2xl p-6 border-2 ${style.ring} ${tier.highlight ? 'shadow-md ring-2 ring-indigo-100' : 'shadow-sm'} transition-all hover:shadow-lg flex flex-col`}>
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 capitalize">{tier.name}</h3>
                          <p className="text-2xl font-bold text-indigo-600 mt-1">{t('tiers.price_custom')}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {t('tiers.active_count', { count: tier.sponsor_count })}
                          </p>
                        </div>
                        <ul className="space-y-2 flex-1 mb-4">
                          {Array.isArray(features) && features.map((f, i) => (
                            <li key={i} className="flex gap-2 text-[15px] text-gray-700">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <button type="button" onClick={() => selectTier(tier.id)}
                          className={`mt-auto px-4 py-2.5 ${style.btn} text-white rounded-xl text-[15px] font-semibold transition-colors`}>
                          {t('tiers.select', { tier: tier.name })}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Form */}
          {formData.tier && (
            <>
              {/* Step indicator */}
              <div className="mb-8" id="sponsor-form">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2].map((num, idx) => (
                    <React.Fragment key={num}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[15px] font-bold transition-colors ${
                          activeStep >= num ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {activeStep > num ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : num}
                        </div>
                        <span className={`text-[15px] font-medium hidden sm:inline ${
                          activeStep >= num ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {num === 1 ? t('form.step_org') : t('form.step_review')}
                        </span>
                      </div>
                      {idx === 0 && (
                        <div className={`w-12 sm:w-24 h-0.5 ${activeStep > 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">

                  {/* Step 1 */}
                  {activeStep === 1 && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{t('form.section_org')}</h2>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold border capitalize ${TIER_STYLE[formData.tier]?.badge ?? ''}`}>
                            {t('form.selected_tier', { tier: selectedTierObj?.name ?? formData.tier })}
                          </span>
                          <button type="button" onClick={() => setFormData(p => ({ ...p, tier: '' }))}
                            className="text-sm text-indigo-600 hover:text-indigo-700 underline">
                            {t('form.change_tier')}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label={t('form.field.organization_name')} name="organizationName"
                          value={formData.organizationName} onChange={handleChange}
                          placeholder={t('form.placeholder.organization_name')} error={errors.organizationName} t={t} />

                        <SelectField label={t('form.field.organization_type')} name="organizationType"
                          value={formData.organizationType} onChange={handleChange} error={errors.organizationType} t={t}
                          options={[
                            { value: '', label: t('form.org_type.placeholder') },
                            ...ORG_TYPES.map(v => ({ value: v, label: t(`form.org_type.${v}`) })),
                          ]} />

                        <Field label={t('form.field.contact_name')} name="contactName"
                          value={formData.contactName} onChange={handleChange}
                          placeholder={t('form.placeholder.contact_name')} error={errors.contactName} t={t} />

                        <Field label={t('form.field.email')} name="email" type="email"
                          value={formData.email} onChange={handleChange}
                          placeholder={t('form.placeholder.email')} error={errors.email} t={t} />

                        <Field label={t('form.field.phone')} name="phone" type="tel"
                          value={formData.phone} onChange={handleChange}
                          placeholder={t('form.placeholder.phone')} t={t} />

                        <Field label={t('form.field.website')} name="website" type="url"
                          value={formData.website} onChange={handleChange}
                          placeholder={t('form.placeholder.website')} t={t} />

                        <SelectField label={t('form.field.country')} name="country"
                          value={formData.country} onChange={handleChange} t={t}
                          options={[
                            { value: '', label: t('form.country.placeholder') },
                            ...COUNTRY_CODES.map(v => ({ value: v, label: COUNTRY_LABELS[v] })),
                          ]} />
                      </div>
                    </div>
                  )}

                  {/* Step 2 */}
                  {activeStep === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{t('form.section_review')}</h2>

                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">{t('form.summary_title')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
                          <SummaryRow label={t('form.summary_org')}     value={formData.organizationName} />
                          <SummaryRow label={t('form.summary_type')}    value={formData.organizationType ? t(`form.org_type.${formData.organizationType}`) : '-'} />
                          <SummaryRow label={t('form.summary_contact')} value={`${formData.contactName} • ${formData.email}`} />
                          <SummaryRow label={t('form.summary_tier')}    value={selectedTierObj?.name ?? formData.tier} capitalize />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-[15px] font-medium text-gray-700 mb-1.5">
                          {t('form.field.message')}
                        </label>
                        <textarea id="message" name="message" rows={4}
                          value={formData.message} onChange={handleChange}
                          maxLength={500}
                          placeholder={t('form.placeholder.message')}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none ${
                            errors.message ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                          }`} />
                        <div className="flex justify-between items-center mt-1.5">
                          {errors.message && <p className="text-sm text-red-600">{t(`form.errors.${errors.message === 'message' ? 'message' : 'required'}`)}</p>}
                          <p className={`text-sm ml-auto ${formData.message.length > 400 ? 'text-orange-600' : 'text-gray-500'}`}>
                            {t('form.char_count', { count: formData.message.length })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" name="newsletter" checked={formData.newsletter} onChange={handleChange}
                            className="w-4 h-4 mt-0.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <span className="text-[15px] text-gray-700">{t('form.field.newsletter')}</span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" name="privacy" checked={formData.privacy} onChange={handleChange}
                            className={`w-4 h-4 mt-0.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${errors.privacy ? 'border-red-500' : ''}`} />
                          <span className="text-[15px] text-gray-700">
                            <Trans t={t} i18nKey="form.field.privacy">
                              I agree to <Link to="/privacy" className="text-indigo-600 hover:underline">{t('legal.privacy')}</Link> and <Link to="/terms" className="text-indigo-600 hover:underline">{t('legal.terms')}</Link>
                            </Trans>
                          </span>
                        </label>
                        {errors.privacy && <p className="text-sm text-red-600">{t('form.errors.privacy')}</p>}
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
                    <button type="button" onClick={handleBack} disabled={activeStep === 1}
                      className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                        activeStep === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                      {t('form.back')}
                    </button>

                    {activeStep < 2 ? (
                      <button type="button" onClick={handleNext}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                        {t('form.next')}
                      </button>
                    ) : (
                      <button type="submit" disabled={isSubmitting}
                        className={`px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                          isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                        }`}>
                        {isSubmitting && (
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        )}
                        {isSubmitting ? t('form.submitting') : t('form.submit')}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}

          {/* FAQ */}
          <section className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('faq.title')}</h2>
            <div className="space-y-3">
              {t('faq.items', { returnObjects: true, defaultValue: [] }).map((faq, idx) => {
                const open = expandedFaq === idx;
                return (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button onClick={() => setExpandedFaq(open ? null : idx)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                      <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {open && (
                      <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                        <p className="text-[15px] text-gray-600 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Testimonials */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('testimonials.title')}</h2>
            {testiLoading ? (
              <div className="flex items-center justify-center py-8 gap-3 text-gray-500">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                {t('testimonials.loading')}
              </div>
            ) : testimonials.length === 0 ? (
              <div className="bg-gray-50 rounded-xl py-10 text-center text-gray-500">
                {t('testimonials.empty')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map(ts => {
                  const style = TIER_STYLE[ts.tier] ?? TIER_STYLE.bronze;
                  return (
                    <div key={ts.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                          {ts.logo ? (
                            <img src={ts.logo} alt={ts.organization}
                              className="w-12 h-12 rounded-lg object-contain"
                              onError={(e) => { e.target.replaceWith(Object.assign(document.createTextNode(ts.organization?.[0] ?? '?'), {})); }} />
                          ) : (ts.organization?.[0] ?? '?')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-[15px] leading-tight">{ts.organization}</p>
                          {ts.since && <p className="text-sm text-gray-500 mt-0.5">Since {ts.since}</p>}
                        </div>
                      </div>
                      <p className="text-[15px] text-gray-600 italic mb-3 flex-1">&ldquo;{ts.quote}&rdquo;</p>
                      <span className={`inline-block w-fit px-2 py-1 rounded text-sm font-medium border capitalize ${style.badge}`}>
                        {ts.tier} Sponsor
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
};

/* ─── sub-components ─────────────────────────────────────────────────────── */

const Field = ({ label, name, type = 'text', value, onChange, placeholder, error, t }) => (
  <div>
    <label htmlFor={name} className="block text-[15px] font-medium text-gray-700 mb-1.5">{label}</label>
    <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
        error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
      }`} />
    {error && <p className="mt-1 text-sm text-red-600">{t(`form.errors.${error === 'email' ? 'email' : 'required'}`)}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error, t }) => (
  <div>
    <label htmlFor={name} className="block text-[15px] font-medium text-gray-700 mb-1.5">{label}</label>
    <select id={name} name={name} value={value} onChange={onChange}
      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer ${
        error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
      }`}>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{t('form.errors.required')}</p>}
  </div>
);

const SummaryRow = ({ label, value, capitalize }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className={`font-medium text-gray-900 ${capitalize ? 'capitalize' : ''}`}>{value || '-'}</p>
  </div>
);

/* ─── helpers ────────────────────────────────────────────────────────────── */

function mapServerErrors(serverErrors) {
  const map = {
    organization_name: 'organizationName',
    organization_type: 'organizationType',
    contact_name:      'contactName',
    email:             'email',
    tier:              'tier',
    message:           'message',
    privacy:           'privacy',
  };
  const out = {};
  Object.entries(serverErrors).forEach(([k, v]) => {
    const key = map[k] ?? k;
    out[key] = v === 'invalid' && k === 'email' ? 'email'
             : v === 'too_short' ? 'message'
             : v;
  });
  return out;
}

export default BecomeSponsor;