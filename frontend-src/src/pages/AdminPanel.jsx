import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, Edit2, Trash2, Save, X, User, Briefcase, Lightbulb,
  Building2, DollarSign, Calendar, AlertCircle, CheckCircle,
  BarChart3, TrendingUp
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const AdminPanel = () => {
  const { t } = useTranslation('admin_panel');
  const [activeTab, setActiveTab] = useState('researchers');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const forms = {
    researchers: {
      title: t('section.researchers'),
      icon: User,
      fields: [
        { name: 'orcid', label: t('field.orcid'), type: 'text', required: true, placeholder: '0000-0002-5152-9727' },
        { name: 'name', label: t('field.name'), type: 'text', required: true },
        // Identifier selain ORCID. Kolomnya sudah ada di tabel researchers dan
        // dipakai strip identifier pada halaman profil anggota tim.
        { name: 'scopus_id', label: t('field.scopus_id'), type: 'text', placeholder: '57204244163' },
        { name: 'sinta_id', label: t('field.sinta_id'), type: 'text', placeholder: '6032151' },
        { name: 'researcher_id', label: t('field.researcher_id'), type: 'text', placeholder: 'S-9066-2016' },
        { name: 'institution_id', label: t('field.institution_id'), type: 'number' },
        { name: 'collaboration_status', label: t('field.collaboration_status'), type: 'select', options: ['open', 'busy', 'limited'] },
        { name: 'bio', label: t('field.bio'), type: 'textarea' },
        { name: 'research_keywords', label: t('field.research_keywords'), type: 'textarea' },
        { name: 'profile_photo_url', label: t('field.profile_photo_url'), type: 'url' }
      ],
      endpoint: '/api/admin/researchers'
    },
    projects: {
      title: t('section.projects'),
      icon: Briefcase,
      fields: [
        { name: 'title', label: t('field.project_title'), type: 'text', required: true },
        { name: 'description', label: t('field.description'), type: 'textarea' },
        { name: 'lead_orcid', label: t('field.lead_orcid'), type: 'text', required: true },
        { name: 'institution_id', label: t('field.institution_id'), type: 'number' },
        { name: 'status', label: t('field.status'), type: 'select', options: ['planning', 'active', 'completed', 'paused'] },
        { name: 'start_date', label: t('field.start_date'), type: 'date' },
        { name: 'end_date', label: t('field.end_date'), type: 'date' },
        { name: 'budget', label: t('field.budget'), type: 'number' },
        { name: 'progress', label: t('field.progress'), type: 'number', min: 0, max: 100 },
        { name: 'sdg_focus', label: t('field.sdg_focus_list'), type: 'text' }
      ],
      endpoint: '/api/admin/projects'
    },
    opportunities: {
      title: t('section.opportunities'),
      icon: Lightbulb,
      fields: [
        { name: 'title', label: t('field.opportunity_title'), type: 'text', required: true },
        { name: 'description', label: t('field.description'), type: 'textarea', required: true },
        { name: 'organization_id', label: t('field.organization_id'), type: 'number', required: true },
        { name: 'category_id', label: t('field.category_id'), type: 'number' },
        { name: 'status', label: t('field.status'), type: 'select', options: ['open', 'in-progress', 'closed'] },
        { name: 'budget_range', label: t('field.budget_range'), type: 'text', placeholder: '$1M - $2M' },
        { name: 'deadline', label: t('field.deadline'), type: 'date' },
        { name: 'sdg_alignment', label: t('field.sdg_alignment'), type: 'textarea' },
        { name: 'required_skills', label: t('field.required_skills'), type: 'textarea' }
      ],
      endpoint: '/api/admin/opportunities'
    },
    expertise: {
      title: t('section.expertise'),
      icon: BarChart3,
      fields: [
        { name: 'orcid', label: t('field.researcher_orcid'), type: 'text', required: true },
        { name: 'field_name', label: t('field.field_name'), type: 'text', required: true, placeholder: t('placeholder.field_name') },
        { name: 'experience_years', label: t('field.experience_years'), type: 'number' },
        { name: 'sdg_number', label: t('field.sdg_number'), type: 'number', min: 1, max: 17 },
        { name: 'expertise_level', label: t('field.expertise_level'), type: 'select', options: ['beginner', 'intermediate', 'expert'] }
      ],
      endpoint: '/api/admin/expertise'
    }
  };

  const currentForm = forms[activeTab];
  const FormIcon = currentForm.icon;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(currentForm.endpoint, {
        method: formMode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setSubmitStatus({
          type: 'success',
          message: t(formMode === 'create' ? 'status.created' : 'status.updated',
            { entity: t(`entity.${activeTab}`) })
        });
        setFormData({});
        setShowForm(false);
        setTimeout(() => setSubmitStatus(null), 3000);
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || t('status.failed')
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: t('status.network', { message: error.message })
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setFormMode('create');
    setFormData({});
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setFormMode('edit');
    setFormData(item);
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({});
  };

  return (
    <main className="min-h-screen pt-[60px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-700 to-slate-900 text-white py-12">
        <div className="container max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-4 mb-6">
            <FormIcon className="w-8 h-8" />
            <h1 className="text-4xl font-bold">{t('title')}</h1>
          </div>
          <p className="text-gray-300 max-w-2xl">{t('subtitle')}</p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-8">
          <div className="flex gap-2 overflow-x-auto pb-4">
            {Object.entries(forms).map(([key, form]) => {
              const Icon = form.icon;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    setShowForm(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    activeTab === key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {form.title}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Status Messages */}
      {submitStatus && (
        <div className={`mt-4 mx-8 p-4 rounded-lg flex items-center gap-2 ${
          submitStatus.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {submitStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {submitStatus.message}
        </div>
      )}

      {/* Form Section */}
      <section className="py-8">
        <div className="container max-w-7xl mx-auto px-8">
          {!showForm ? (
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium mb-6"
            >
              <Plus className="w-5 h-5" />
              {t('action.add_new', { entity: t(`entity.${activeTab}`) })}
            </button>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t(formMode === 'create' ? 'action.add_new' : 'action.edit', { entity: t(`entity.${activeTab}`) })}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {currentForm.fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={formData[field.name] ?? ''}
                        onChange={handleInputChange}
                        required={field.required}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name] ?? ''}
                        onChange={handleInputChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] ?? ''}
                        onChange={handleInputChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        min={field.min}
                        max={field.max}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    )}
                  </div>
                ))}

                <div className="flex gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? t('action.saving') : t('action.save')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    {t('action.cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Info Box */}
      <section className="py-8 bg-blue-50">
        <div className="container max-w-7xl mx-auto px-8">
          <div className="bg-white rounded-lg p-6 border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-2">{t('notice.title')}</h3>
            <p className="text-gray-600 text-[15px]">
              {t('notice.body')}<br/>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">api/admin/researchers.php</code>,
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">api/admin/projects.php</code>,
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">api/admin/opportunities.php</code>,
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">api/admin/expertise.php</code>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default AdminPanel;