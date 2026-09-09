import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

// Icon paths / URLs are chrome — copy lives in the `contact` i18n bundle.
const CONTACT_METHOD_META = [
  { key: 'email',   icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', value: 'contact@sangia.org', action: 'mailto:contact@sangia.org' },
  { key: 'phone',   icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', value: '+1 (234) 567-890', action: 'tel:+1234567890' },
  { key: 'address', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', value: '123 Innovation Drive\nTech Valley, CA 94000\nUnited States', action: null },
  { key: 'chat',    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', value: null, action: 'chat' },
];

const QUICK_LINK_META = [
  { key: 'help',      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', link: '/help' },
  { key: 'docs',      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', link: '/docs/documentation' },
  { key: 'api',       icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', link: '/docs/api-reference' },
  { key: 'community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', link: '/collaboration' },
];

const OFFICE_HOUR_META = [
  { key: 'weekdays', time: '9:00 AM - 6:00 PM PST' },
  { key: 'saturday', time: '10:00 AM - 4:00 PM PST' },
  { key: 'sunday',   time: null },
];

const INQUIRY_TYPE_KEYS = ['', 'general', 'technical', 'partnership', 'api', 'enterprise', 'research', 'media', 'other'];

const SOCIAL_LINKS = [
  { name: 'Twitter',  icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', url: 'https://twitter.com/sciecola' },
  { name: 'LinkedIn', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 2a2 2 0 11-4 0 2 2 0 014 0z', url: 'https://linkedin.com/company/sciecola' },
  { name: 'GitHub',   icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22', url: 'https://github.com/sciecola' },
  { name: 'YouTube',  icon: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z', url: 'https://youtube.com/@sciecola' },
];

const MAX_MESSAGE_LENGTH = 1000;

const Contact = () => {
  const { t } = useTranslation('contact');
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    inquiryType: '',
    subject: '',
    message: '',
    newsletter: false,
    privacy: false
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [charCount, setCharCount] = useState(0);
  const [openFaqs, setOpenFaqs] = useState({});

  // Built from the i18n bundle + the module-level metadata tables.
  const contactMethods = CONTACT_METHOD_META.map(m => ({
    ...m,
    title: t(`contact_methods.${m.key}.title`),
    // The chat card has its own translated value + button label.
    value: m.value ?? t(`contact_methods.${m.key}.value`, { defaultValue: '' }),
    note:  t(`contact_methods.${m.key}.note`, { defaultValue: '' }) || null,
    buttonText: m.key === 'chat' ? t('contact_methods.chat.button') : undefined,
  }));

  const quickLinks = QUICK_LINK_META.map(l => ({ ...l, title: t(`quick_links.${l.key}`) }));

  const officeHours = OFFICE_HOUR_META.map(h => ({
    day:  t(`office_hours.${h.key}`),
    time: h.time ?? t('office_hours.closed'),
  }));

  const socialLinks = SOCIAL_LINKS;

  const faqs = (t('faqs', { returnObjects: true }) || []).map((f, idx) => ({
    id: `faq-${idx + 1}`, question: f.q, answer: f.a,
  }));

  const inquiryTypes = INQUIRY_TYPE_KEYS.map(value => ({
    value, label: t(`inquiry_types.${value}`),
  }));


  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Update character count for message field
    if (name === 'message') {
      setCharCount(value.length);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('errors.name_required');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('errors.email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('errors.email_invalid');
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = t('errors.subject_required');
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t('errors.message_required');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('errors.message_too_short');
    }
    
    if (!formData.privacy) {
      newErrors.privacy = t('errors.privacy_required');
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, send data to backend here:
      // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData), ... })
      
      setSubmitStatus('success');
      toast.success(t('toast.success'));
      setFormData({
        name: '',
        email: '',
        organization: '',
        inquiryType: '',
        subject: '',
        message: '',
        newsletter: false,
        privacy: false
      });
      setCharCount(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(t('toast.error'));
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (faqId) => {
    setOpenFaqs(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  };

  const handleContactAction = (action) => {
    if (action === 'chat') {
      // Trigger chatbot - in production, integrate with your chat provider
      console.log('Opening chat...');
      // Example: window.Intercom('show');
    }
  };

  // Initialize character count on mount
  useEffect(() => {
    setCharCount(formData.message.length);
  }, []);

  return (
    <main className="pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[15px] text-gray-600 mb-8">
        <Link to="/" className="hover:text-indigo-600 transition-colors">{t('breadcrumb.home')}</Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-900 font-medium">{t('breadcrumb.current')}</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          {t('subtitle')}
        </p>
      </div>

      {/* Success/Error Messages */}
      {submitStatus === 'success' && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-green-800">{t('status.success_title')}</p>
            <p className="text-[15px] text-green-700">{t('status.success_body')}</p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-red-800">{t('status.error_title')}</p>
            <p className="text-[15px] text-red-700">{t('status.error_body')}</p>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('form.title')}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-[15px] font-medium text-gray-700 mb-1.5">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t('form.name')}
                    </span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all ${
                      errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    placeholder={t('form.name_ph')}
                    required
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-[15px] font-medium text-gray-700 mb-1.5">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {t('form.email')}
                    </span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all ${
                      errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    placeholder={t('form.email_ph')}
                    required
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              {/* Organization & Inquiry Type Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="organization" className="block text-[15px] font-medium text-gray-700 mb-1.5">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {t('form.organization')}
                    </span>
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
                    placeholder={t('form.organization_ph')}
                  />
                </div>

                <div>
                  <label htmlFor="inquiry_type" className="block text-[15px] font-medium text-gray-700 mb-1.5">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {t('form.inquiry_type')}
                    </span>
                  </label>
                  <select
                    id="inquiry_type"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-[15px] font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {t('form.subject')}
                  </span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all ${
                    errors.subject ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder={t('form.subject_ph')}
                  required
                />
                {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-[15px] font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t('form.message')}
                  </span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all resize-none ${
                    errors.message ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder={t('form.message_ph')}
                  required
                />
                <div className="flex justify-between items-center mt-1.5">
                  {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
                  <p className={`text-sm ml-auto ${charCount > MAX_MESSAGE_LENGTH * 0.9 ? 'text-orange-600' : 'text-gray-500'}`}>
                    <span id="charCount">{charCount}</span> / {MAX_MESSAGE_LENGTH} {t('form.char_suffix')}
                  </p>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-[15px] text-gray-700">
                    {t('form.newsletter')}
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="privacy"
                    checked={formData.privacy}
                    onChange={handleChange}
                    className={`w-4 h-4 mt-0.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${
                      errors.privacy ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  <span className="text-[15px] text-gray-700">
                    {t('form.privacy_prefix')}{' '}
                    <Link to="/privacy" className="text-indigo-600 hover:underline">{t('form.privacy_link')}</Link>{' '}
                    *
                  </span>
                </label>
                {errors.privacy && <p className="text-sm text-red-600 -mt-2">{errors.privacy}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                  isSubmitting ? 'animate-pulse' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('form.submitting')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {t('form.submit')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          {/* Contact Methods */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('sidebar.contact_title')}
            </h3>

            <div className="space-y-4">
              {contactMethods.map((method) => (
                <div key={method.id} className="flex gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={method.icon} />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-900 text-[15px]">{method.title}</h4>
                    {method.action?.startsWith('mailto:') || method.action?.startsWith('tel:') ? (
                      <a 
                        href={method.action} 
                        className="text-[15px] text-indigo-600 hover:underline block"
                      >
                        {method.value}
                      </a>
                    ) : method.action === 'chat' ? (
                      <>
                        <p className="text-[15px] text-gray-600">{method.value}</p>
                        <button
                          onClick={() => handleContactAction(method.action)}
                          className="mt-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          {method.buttonText}
                        </button>
                      </>
                    ) : (
                      <p className="text-[15px] text-gray-600 whitespace-pre-line">{method.value}</p>
                    )}
                    {method.note && (
                      <p className="text-sm text-gray-500 mt-1">{method.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {t('sidebar.quick_links')}
            </h3>
            <div className="space-y-2">
              {quickLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.link}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                  </svg>
                  <span className="text-[15px] font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                    {link.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Office Hours */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('sidebar.office_hours')}
            </h3>
            <div className="space-y-3">
              {officeHours.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-[15px] text-gray-700">{item.day}</span>
                  <span className="text-[15px] font-medium text-gray-900">{item.time}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('note.timezone')}
            </p>
          </div>

          {/* Social Media */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {t('sidebar.follow_us')}
            </h3>
            <p className="text-[15px] text-gray-600 mb-4">{t('sidebar.follow_note')}</p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-[15px] font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('faq_title')}</h2>
        </div>

        <div className="space-y-3 max-w-3xl">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${openFaqs[faq.id] ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaqs[faq.id] && (
                <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                  <p className="text-[15px] text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">{t('cta.title')}</h3>
            <p className="text-indigo-100">{t('cta.body')}</p>
          </div>
          <button 
            onClick={() => handleContactAction('chat')}
            className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {t('action.start_chat')}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Contact;