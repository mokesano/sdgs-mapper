import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

/* ─── helpers ────────────────────────────────────────────────────────────── */

const EMPTY_FORM = {
  id: null,
  orcid: '',
  department_id: '',
  position: '',
  bio: '',
  long_bio: '',
  photo_url: '',
  slug: '',
  code: '',
  location: '',
  joined_year: new Date().getFullYear(),
  expertise: '',
  sdg_focus: '',
  display_order: 0,
  is_visible: true,
};

function memberToForm(m) {
  return {
    id:             m.id,
    orcid:          m.orcid ?? '',
    department_id:  m.department_id ?? '',
    position:       m.position ?? '',
    bio:            m.bio ?? '',
    long_bio:       m.long_bio ?? '',
    photo_url:      m.photo_url ?? '',
    slug:           m.slug ?? '',
    code:           m.code ?? '',
    location:       m.location ?? '',
    joined_year:    m.joined_year || '',
    expertise:      (m.expertise ?? []).join(', '),
    sdg_focus:      (m.sdg_focus ?? []).join(', '),
    display_order:  m.display_order ?? 0,
    is_visible:     !!m.is_visible,
  };
}

function formToPayload(f) {
  const expertise = f.expertise.split(',').map(s => s.trim()).filter(Boolean);
  const sdg_focus = f.sdg_focus.split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => Number.isInteger(n) && n >= 1 && n <= 17);
  return {
    orcid:          f.orcid.trim(),
    department_id:  Number(f.department_id) || 0,
    position:       f.position.trim(),
    bio:            f.bio.trim() || null,
    long_bio:       f.long_bio.trim() || null,
    photo_url:      f.photo_url.trim() || null,
    slug:           f.slug.trim() || null,
    code:           f.code.trim() || null,
    location:       f.location.trim() || null,
    joined_year:    f.joined_year ? Number(f.joined_year) : null,
    expertise:      expertise.length ? expertise : null,
    sdg_focus:      sdg_focus.length ? sdg_focus : null,
    display_order:  Number(f.display_order) || 0,
    is_visible:     !!f.is_visible,
  };
}

/* ─── component ──────────────────────────────────────────────────────────── */

const AdminTeams = () => {
  const { t } = useTranslation('admin_teams');

  const [members,      setMembers]      = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [researchers,  setResearchers]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [errors,       setErrors]       = useState({});

  /* ── data load ─────────────────────────────────────────────────────── */
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, dRes] = await Promise.all([
        fetch('/api/wrapper/admin_teams.php?action=list'),
        fetch('/api/wrapper/admin_teams.php?action=departments'),
      ]);
      const mJson = await mRes.json();
      const dJson = await dRes.json();
      if (mJson.status === 'success') setMembers(mJson.members ?? []);
      if (dJson.status === 'success') {
        setDepartments(dJson.departments ?? []);
        setResearchers(dJson.researchers ?? []);
      }
    } catch (e) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── handlers ──────────────────────────────────────────────────────── */
  const openCreate = () => {
    setForm({ ...EMPTY_FORM, department_id: departments[0]?.id ?? '' });
    setErrors({});
    setShowForm(true);
    setTimeout(() => document.getElementById('admin-team-form')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const openEdit = (member) => {
    setForm(memberToForm(member));
    setErrors({});
    setShowForm(true);
    setTimeout(() => document.getElementById('admin-team-form')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const isEdit = !!form.id;
    const action = isEdit ? `update&id=${form.id}` : 'create';
    setSaving(true);
    try {
      const res = await fetch(`/api/wrapper/admin_teams.php?action=${action}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formToPayload(form)),
      });
      const json = await res.json();
      if (!res.ok || json.status !== 'success') {
        if (json.errors) setErrors(json.errors);
        toast.error(json.message ?? t('error'));
        return;
      }
      toast.success(isEdit ? 'Updated' : 'Created');
      setShowForm(false);
      setForm(EMPTY_FORM);
      loadAll();
    } catch (e) {
      toast.error(t('error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('actions.confirm_delete'))) return;
    try {
      const res = await fetch(`/api/wrapper/admin_teams.php?action=delete&id=${id}`, { method: 'POST' });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message);
      toast.success('Deleted');
      loadAll();
    } catch (e) {
      toast.error(t('error'));
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`/api/wrapper/admin_teams.php?action=toggle_visibility&id=${id}`, { method: 'POST' });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message);
      loadAll();
    } catch (e) {
      toast.error(t('error'));
    }
  };

  /* ── render ────────────────────────────────────────────────────────── */
  return (
    <main className="pt-[68px] pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link to="/admin" className="text-[15px] text-indigo-600 hover:text-indigo-700 mb-2 inline-block">
            {t('back_admin')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1 max-w-2xl">{t('subtitle')}</p>
        </div>
        <button onClick={openCreate}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[15px] font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          {t('actions.add')}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          {t('loading')}
        </div>
      )}

      {/* Table */}
      {!loading && (
        members.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
            <p className="font-semibold text-gray-800 mb-1">{t('empty.title')}</p>
            <p className="text-[15px] text-gray-500">{t('empty.subtitle')}</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-[15px]">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">{t('table.name')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('table.position')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('table.department')}</th>
                    <th className="px-4 py-3 text-center font-medium">{t('table.joined')}</th>
                    <th className="px-4 py-3 text-center font-medium">{t('table.order')}</th>
                    <th className="px-4 py-3 text-center font-medium">{t('table.visible')}</th>
                    <th className="px-4 py-3 text-right font-medium">{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{m.name}</p>
                        {m.code && <p className="text-sm text-gray-400 font-mono">{m.code}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{m.position}</td>
                      <td className="px-4 py-3 text-gray-700">{m.department ?? '—'}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{m.joined_year || '—'}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{m.display_order}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleToggle(m.id)}
                          title={m.is_visible ? t('actions.toggle_hide') : t('actions.toggle_show')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            m.is_visible ? 'bg-indigo-600' : 'bg-gray-300'
                          }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            m.is_visible ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(m)}
                            className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            {t('actions.edit')}
                          </button>
                          <button onClick={() => handleDelete(m.id)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            {t('actions.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Form */}
      {showForm && (
        <form id="admin-team-form" onSubmit={handleSave}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {form.id ? t('form.title_edit') : t('form.title_create')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ORCID */}
            <div className="md:col-span-2">
              <label className="block text-[15px] font-medium text-gray-700 mb-1.5">{t('form.orcid')}</label>
              {form.id ? (
                <input name="orcid" value={form.orcid} disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-[15px] font-mono" />
              ) : (
                <select name="orcid" value={form.orcid} onChange={handleField}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-[15px] ${
                    errors.orcid ? 'border-red-300' : 'border-gray-200'
                  }`}>
                  <option value="">{t('form.pick_researcher')}</option>
                  {researchers.map(r => (
                    <option key={r.orcid} value={r.orcid}>{r.name} ({r.orcid})</option>
                  ))}
                </select>
              )}
              <p className="text-sm text-gray-400 mt-1">{t('form.orcid_help')}</p>
              {errors.orcid && <p className="text-sm text-red-600 mt-1">{errors.orcid}</p>}
            </div>

            <Field label={t('form.department')} name="department_id"
              error={errors.department_id}
              as={
                <select name="department_id" value={form.department_id} onChange={handleField}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-[15px] ${
                    errors.department_id ? 'border-red-300' : 'border-gray-200'
                  }`}>
                  <option value="">—</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              } />

            <Field label={t('form.position')} name="position"
              value={form.position} onChange={handleField} error={errors.position} />

            <Field label={t('form.slug')} name="slug"
              value={form.slug} onChange={handleField} />

            <Field label={t('form.code')} name="code"
              value={form.code} onChange={handleField} />

            <Field label={t('form.location')} name="location"
              value={form.location} onChange={handleField} />

            <Field label={t('form.joined_year')} name="joined_year" type="number"
              value={form.joined_year} onChange={handleField} />

            <Field label={t('form.photo_url')} name="photo_url"
              value={form.photo_url} onChange={handleField} />

            <div className="md:col-span-2">
              <label className="block text-[15px] font-medium text-gray-700 mb-1.5">{t('form.bio')}</label>
              <input name="bio" value={form.bio} onChange={handleField}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px]" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[15px] font-medium text-gray-700 mb-1.5">{t('form.long_bio')}</label>
              <textarea name="long_bio" value={form.long_bio} onChange={handleField} rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] resize-none" />
            </div>

            <Field label={t('form.expertise')} name="expertise"
              value={form.expertise} onChange={handleField} />

            <Field label={t('form.sdg_focus')} name="sdg_focus"
              value={form.sdg_focus} onChange={handleField} placeholder={t('form.sdg_hint')} />

            <Field label={t('form.display_order')} name="display_order" type="number"
              value={form.display_order} onChange={handleField} />

            <div className="flex items-center gap-2 mt-7">
              <input type="checkbox" id="is_visible" name="is_visible"
                checked={form.is_visible} onChange={handleField}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <label htmlFor="is_visible" className="text-[15px] text-gray-700">{t('form.is_visible')}</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="px-5 py-2.5 text-gray-700 rounded-xl text-[15px] font-medium hover:bg-gray-100 transition-colors">
              {t('actions.cancel')}
            </button>
            <button type="submit" disabled={saving}
              className={`px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[15px] font-semibold transition-colors flex items-center gap-2 ${
                saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
              }`}>
              {saving && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saving ? t('saving') : t('actions.save')}
            </button>
          </div>
        </form>
      )}

    </main>
  );
};

/* ─── sub-component ──────────────────────────────────────────────────────── */

const Field = ({ label, name, value, onChange, error, type = 'text', placeholder, as }) => (
  <div>
    <label className="block text-[15px] font-medium text-gray-700 mb-1.5">{label}</label>
    {as ?? (
      <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder}
        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-[15px] ${
          error ? 'border-red-300' : 'border-gray-200'
        }`} />
    )}
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

export default AdminTeams;