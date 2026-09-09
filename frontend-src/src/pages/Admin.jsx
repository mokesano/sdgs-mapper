import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

const Admin = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, target: null });

  // Mock: Check admin access
  const isAdmin = true;
  
  // State: Impact Score Weights
  const [wisWeights, setWisWeights] = useState({
    academic: 0.40, social: 0.25, economic: 0.20, sdg: 0.15
  });

  // State: API Keys
  const [apiKeys, setApiKeys] = useState({
    cloudflareTurnstile: '', recaptchaV3: '', sangiaApi: '',
    twilioWhatsapp: '', telegramBot: ''
  });

  // State: User Management
  const [users, setUsers] = useState([
    { id: 1, name: 'Dr. Andi Rahman', email: 'andi@ui.ac.id', role: 'researcher', status: 'active', joined: '2024-01-15', lastLogin: '2 jam lalu' },
    { id: 2, name: 'Prof. Siti Nurhaliza', email: 'siti@brin.go.id', role: 'co-admin', status: 'active', joined: '2024-02-20', lastLogin: 'Kemarin' },
    { id: 3, name: 'Budi Santoso', email: 'budi@ugm.ac.id', role: 'researcher', status: 'suspended', joined: '2024-03-10', lastLogin: '5 hari lalu' },
    { id: 4, name: 'Dewi Setiawan', email: 'dewi@ipb.ac.id', role: 'researcher', status: 'disabled', joined: '2024-01-28', lastLogin: '2 minggu lalu' },
    { id: 5, name: 'Rizky Pratama', email: 'rizky@its.ac.id', role: 'researcher', status: 'active', joined: '2024-04-05', lastLogin: '1 jam lalu' }
  ]);

  const [userApiKeys, setUserApiKeys] = useState([
    { id: 1, userId: 1, key: 'wz_42_1717200000_a3f8c2e1b4d5f678', created: '2024-01-20', lastUsed: 'Hari ini', status: 'active' },
    { id: 2, userId: 2, key: 'wz_88_1719800000_b7e9d3f2c5a6g789', created: '2024-02-25', lastUsed: 'Kemarin', status: 'active' },
    { id: 3, userId: 3, key: 'wz_15_1720400000_c8f0e4g3d6b7h890', created: '2024-03-15', lastUsed: '1 minggu lalu', status: 'revoked' }
  ]);

  // State: Content & UI Settings
  const [contentSettings, setContentSettings] = useState({
    showJournalsMain: true, showInstitutionsMain: true, showResearchersMain: true,
    showArticlesMain: true, showSdgsMain: true
  });

  const [uiSettings, setUiSettings] = useState({
    primaryColor: '#6366f1', secondaryColor: '#8b5cf6', fontFamily: 'Inter',
    chartType: 'area', enableAnimations: true, compactMode: false
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false, allowNewRegistrations: true, requireEmailVerification: true,
    maxApiCallsPerHour: 60, sessionTimeoutMinutes: 120
  });

  // State: Crawl Queue
  const [crawlStatus, setCrawlStatus] = useState(null);
  const [crawlQueue, setCrawlQueue] = useState([]);
  const [crawlInput, setCrawlInput] = useState('');
  const [crawlLog, setCrawlLog] = useState([]);
  const [crawlLoading, setCrawlLoading] = useState(false);

  // State: Cache Migration
  const [cacheStatus, setCacheStatus] = useState(null);
  const [cacheLoading, setCacheLoading] = useState(false);
  const [cacheLog, setCacheLog] = useState([]);

  // Toast Handler
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // Confirmation Modal Handler
  const confirmAction = (action, target) => setConfirmModal({ show: true, action, target });

  const executeAction = async () => {
    const { action, target } = confirmModal;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (action === 'revokeApiKey') {
      setUserApiKeys(prev => prev.map(k => k.id === target ? { ...k, status: 'revoked' } : k));
      showToast('API key berhasil dicabut');
    } else if (action === 'suspendUser') {
      setUsers(prev => prev.map(u => u.id === target ? { ...u, status: 'suspended' } : u));
      showToast('Akun peneliti ditangguhkan');
    } else if (action === 'disableUser') {
      setUsers(prev => prev.map(u => u.id === target ? { ...u, status: 'disabled' } : u));
      showToast('Akun peneliti dinonaktifkan');
    } else if (action === 'deleteUser') {
      setUsers(prev => prev.filter(u => u.id !== target));
      showToast('Akun peneliti dihapus permanen');
    } else if (action === 'promoteToCoAdmin') {
      setUsers(prev => prev.map(u => u.id === target ? { ...u, role: 'co-admin' } : u));
      showToast('Pengguna dipromosikan menjadi Co-Admin');
    } else if (action === 'clearCache') {
      try {
        const r = await fetch('/api/cache_to_db.php?action=clear_cache', { method: 'POST' });
        const d = await r.json();
        setCacheLog(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: d.message || 'Cache file dihapus', type: d.status === 'ok' ? 'success' : 'error' }, ...prev.slice(0, 19)]);
        showToast(d.message || 'Cache dibersihkan');
      } catch {
        setCacheLog(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: 'Gagal membersihkan cache', type: 'error' }, ...prev.slice(0, 19)]);
      }
    }
    
    setConfirmModal({ show: false, action: null, target: null });
    setLoading(false);
  };

  // Save Handlers
  const saveWisWeights = async () => {
    const total = Object.values(wisWeights).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 1.0) > 0.01) { showToast('Total bobot harus 100%', 'error'); return; }
    setLoading(true); await new Promise(r => setTimeout(r, 1000)); setLoading(false);
    showToast('Bobot WIS berhasil diperbarui');
  };
  const saveApiKeys = async () => { setLoading(true); await new Promise(r => setTimeout(r, 1000)); setLoading(false); showToast('Konfigurasi API key disimpan'); };
  const saveContentSettings = async () => { setLoading(true); await new Promise(r => setTimeout(r, 800)); setLoading(false); showToast('Pengaturan konten diperbarui'); };
  const saveUiSettings = async () => { setLoading(true); await new Promise(r => setTimeout(r, 800)); document.documentElement.style.setProperty('--primary-color', uiSettings.primaryColor); setLoading(false); showToast('Tampilan aplikasi diperbarui'); };
  const saveSystemSettings = async () => { setLoading(true); await new Promise(r => setTimeout(r, 800)); setLoading(false); showToast('Pengaturan sistem disimpan'); };

  useEffect(() => { if (!isAdmin) navigate('/'); }, [isAdmin, navigate]);

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: t('tabs.dashboard'), icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'impact-config', label: t('tabs.impact-config'), icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'api-security', label: t('tabs.api-security'), icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'user-management', label: t('tabs.user-management'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'content-moderation', label: t('tabs.content-moderation'), icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'ui-customization', label: t('tabs.ui-customization'), icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7.343 11L5.686 9.343a2 2 0 010-2.828l2.829-2.829a2 2 0 012.828 0l8.486 8.485' },
    { id: 'system', label: t('tabs.system'), icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'crawl-queue', label: t('tabs.crawl-queue'), icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    { id: 'cache-migration', label: t('tabs.cache-migration'), icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
    { id: 'audit', label: t('tabs.audit'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
  ];

  // Helper Components
  const SectionHeader = ({ title, description, action }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div><h2 className="text-xl font-bold text-gray-900">{title}</h2>{description && <p className="text-[15px] text-gray-600 mt-1">{description}</p>}</div>
      {action}
    </div>
  );

  const StatusBadge = ({ status }) => {
    const styles = { active: 'bg-green-100 text-green-700', suspended: 'bg-amber-100 text-amber-700', disabled: 'bg-red-100 text-red-700', revoked: 'bg-gray-100 text-gray-600' };
    return <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${styles[status] || styles.active}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  const RoleBadge = ({ role }) => {
    const styles = { researcher: 'bg-indigo-100 text-indigo-700', 'co-admin': 'bg-purple-100 text-purple-700', admin: 'bg-gray-900 text-white' };
    return <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${styles[role] || styles.researcher}`}>{role === 'co-admin' ? 'Co-Admin' : role.charAt(0).toUpperCase() + role.slice(1)}</span>;
  };

  // Render Section Content
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <SectionHeader title={t('dashboard.title')} description={t('dashboard.description')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: t('dashboard.stats.users'), value: users.length, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'bg-indigo-50 text-indigo-600' },
                { label: t('dashboard.stats.api_keys'), value: userApiKeys.filter(k => k.status === 'active').length, icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', color: 'bg-purple-50 text-purple-600' },
                { label: t('dashboard.stats.requests'), value: '2,847', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'bg-green-50 text-green-600' },
                { label: t('dashboard.stats.uptime'), value: '99.98%', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-amber-50 text-amber-600' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} /></svg>
                  </div>
                  <div><p className="text-2xl font-bold text-gray-900">{stat.value}</p><p className="text-[15px] text-gray-600">{stat.label}</p></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">{t('dashboard.recent_activity')}</h3>
              <div className="space-y-4">
                {[
                  { user: 'Dr. Andi Rahman', action: 'Memperbarui profil riset', time: '5 menit lalu', type: 'update' },
                  { user: 'Admin', action: 'Mencabut API key pengguna #3', time: '1 jam lalu', type: 'security' },
                  { user: 'Prof. Siti Nurhaliza', action: 'Menganalisis 12 artikel baru', time: '3 jam lalu', type: 'analysis' },
                  { user: 'Sistem', action: 'Backup database harian selesai', time: 'Hari ini 02:00', type: 'system' }
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.type === 'security' ? 'bg-red-100 text-red-600' : activity.type === 'analysis' ? 'bg-indigo-100 text-indigo-600' : activity.type === 'system' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={activity.type === 'security' ? 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' : activity.type === 'analysis' ? 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' : activity.type === 'system' ? 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' : 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'} /></svg>
                    </div>
                    <div className="flex-grow"><p className="text-[15px] text-gray-900"><span className="font-medium">{activity.user}</span> {activity.action}</p><p className="text-sm text-gray-500 mt-0.5">{activity.time}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'impact-config':
        return (
          <div className="space-y-6">
            <SectionHeader title={t('wis.title')} description={t('wis.description')} action={<button onClick={saveWisWeights} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[15px] font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-2">{loading ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}{t('action.save')}</button>} />
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(wisWeights).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-[15px] font-medium text-gray-700 mb-2 capitalize">{key} ({Math.round(value * 100)}%)</label>
                    <input type="range" min="0" max="1" step="0.05" value={value} onChange={(e) => setWisWeights(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                    <div className="flex justify-between text-sm text-gray-500 mt-1"><span>0%</span><span>100%</span></div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-[15px] text-indigo-800"><strong>{t('wis.formula')}</strong> WIS = (Academic × {Math.round(wisWeights.academic * 100)}%) + (Social × {Math.round(wisWeights.social * 100)}%) + (Economic × {Math.round(wisWeights.economic * 100)}%) + (SDG × {Math.round(wisWeights.sdg * 100)}%)</p>
                <p className="text-sm text-indigo-600 mt-1">{t('wis.total_prefix')} {(Object.values(wisWeights).reduce((a, b) => a + b, 0) * 100).toFixed(1)}%{Math.abs(Object.values(wisWeights).reduce((a, b) => a + b, 0) - 1.0) > 0.01 && <span className="text-red-600 ml-2">{t('wis.must_be_100')}</span>}</p>
              </div>
            </div>
          </div>
        );

      case 'api-security':
        return (
          <div className="space-y-6">
            <SectionHeader title={t('api_security.title')} description={t('api_security.description')} />
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">{t('api_security.external_keys')}</h3>
              <div className="space-y-4">
                {[
                  { key: 'cloudflareTurnstile', label: t('api_security.labels.cloudflareTurnstile'), placeholder: '0x4AAAAAA...', helper: t('api_security.helpers.cloudflareTurnstile') },
                  { key: 'recaptchaV3', label: t('api_security.labels.recaptchaV3'), placeholder: '6Lc...', helper: t('api_security.helpers.recaptchaV3') },
                  { key: 'sangiaApi', label: t('api_security.labels.sangiaApi'), placeholder: 'sk_live_...', helper: t('api_security.helpers.sangiaApi') },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-[15px] font-medium text-gray-700 mb-1">{field.label}</label>
                    <input type="password" value={apiKeys[field.key]} onChange={(e) => setApiKeys(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono" />
                    <p className="text-sm text-gray-500 mt-1">{field.helper}</p>
                  </div>
                ))}
              </div>
              <button onClick={saveApiKeys} disabled={loading} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg text-[15px] font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-2">{loading ? 'Menyimpan...' : 'Simpan Kunci API'}</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">{t('api_security.user_keys')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[15px]">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr><th className="px-4 py-3 text-left font-medium">{t('api_security.table.user')}</th><th className="px-4 py-3 text-left font-medium">{t('api_security.table.api_key')}</th><th className="px-4 py-3 text-left font-medium">{t('api_security.table.created')}</th><th className="px-4 py-3 text-left font-medium">{t('api_security.table.status')}</th><th className="px-4 py-3 text-right font-medium">{t('api_security.table.actions')}</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userApiKeys.map((key) => { const user = users.find(u => u.id === key.userId); return (
                      <tr key={key.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3"><p className="font-medium text-gray-900">{user?.name || 'Unknown'}</p><p className="text-sm text-gray-500">{user?.email}</p></td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{key.key}</td>
                        <td className="px-4 py-3 text-gray-500">{key.created}</td>
                        <td className="px-4 py-3"><StatusBadge status={key.status} /></td>
                        <td className="px-4 py-3 text-right">{key.status === 'active' && <button onClick={() => confirmAction('revokeApiKey', key.id)} className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline">{t('api_security.revoke')}</button>}</td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'user-management':
        return (
          <div className="space-y-6">
            <SectionHeader title={t('users.title')} description={t('users.description')} />
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[15px]">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr><th className="px-4 py-3 text-left font-medium">{t('users.table.name_email')}</th><th className="px-4 py-3 text-left font-medium">{t('users.table.role')}</th><th className="px-4 py-3 text-left font-medium">{t('users.table.status')}</th><th className="px-4 py-3 text-left font-medium">{t('users.table.joined')}</th><th className="px-4 py-3 text-right font-medium">{t('users.table.actions')}</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3"><p className="font-medium text-gray-900">{user.name}</p><p className="text-sm text-gray-500">{user.email}</p></td>
                        <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                        <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                        <td className="px-4 py-3 text-gray-500">{user.joined}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {user.role === 'researcher' && <button onClick={() => confirmAction('promoteToCoAdmin', user.id)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline">{t('users.actions.promote')}</button>}
                            {user.status === 'active' && <><button onClick={() => confirmAction('suspendUser', user.id)} className="text-amber-600 hover:text-amber-800 text-sm font-medium hover:underline">{t('users.actions.suspend')}</button><button onClick={() => confirmAction('disableUser', user.id)} className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline">{t('users.actions.disable')}</button></>}
                            {(user.status === 'suspended' || user.status === 'disabled') && <button onClick={() => setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'active' } : u))} className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline">{t('users.actions.activate')}</button>}
                            <button onClick={() => confirmAction('deleteUser', user.id)} className="text-red-700 hover:text-red-900 text-sm font-medium hover:underline">{t('users.actions.delete')}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'content-moderation':
        return (
          <div className="space-y-6">
            <SectionHeader title={t('content.title')} description={t('content.description')} action={<button onClick={saveContentSettings} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[15px] font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-2">{loading ? t('content.saving') : t('content.save')}</button>} />
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              {[
                { key: 'showJournalsMain', label: t('content.toggles.showJournalsMain.label'), desc: t('content.toggles.showJournalsMain.desc') },
                { key: 'showInstitutionsMain', label: t('content.toggles.showInstitutionsMain.label'), desc: t('content.toggles.showInstitutionsMain.desc') },
                { key: 'showResearchersMain', label: t('content.toggles.showResearchersMain.label'), desc: t('content.toggles.showResearchersMain.desc') }
              ].map((setting) => (
                <div key={setting.key} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div><p className="font-medium text-gray-900 text-[15px]">{setting.label}</p><p className="text-sm text-gray-500 mt-1">{setting.desc}</p></div>
                  <button onClick={() => setContentSettings(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${contentSettings[setting.key] ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${contentSettings[setting.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'ui-customization':
        return (
          <div className="space-y-6">
            <SectionHeader title={t('ui.title')} description={t('ui.description')} action={<button onClick={saveUiSettings} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[15px] font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-2">{loading ? t('ui.applying') : t('ui.apply')}</button>} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">{t('ui.color_theme')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[15px] font-medium text-gray-700 mb-2">{t('ui.primary')}</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={uiSettings.primaryColor} onChange={(e) => setUiSettings(prev => ({ ...prev, primaryColor: e.target.value }))} className="w-12 h-10 rounded cursor-pointer border border-gray-200" />
                      <input type="text" value={uiSettings.primaryColor} onChange={(e) => setUiSettings(prev => ({ ...prev, primaryColor: e.target.value }))} className="flex-grow px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[15px] font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[15px] font-medium text-gray-700 mb-2">{t('ui.secondary')}</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={uiSettings.secondaryColor} onChange={(e) => setUiSettings(prev => ({ ...prev, secondaryColor: e.target.value }))} className="w-12 h-10 rounded cursor-pointer border border-gray-200" />
                      <input type="text" value={uiSettings.secondaryColor} onChange={(e) => setUiSettings(prev => ({ ...prev, secondaryColor: e.target.value }))} className="flex-grow px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[15px] font-mono" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div>
                  <label className="block text-[15px] font-medium text-gray-700 mb-2">{t('ui.font')}</label>
                  <select value={uiSettings.fontFamily} onChange={(e) => setUiSettings(prev => ({ ...prev, fontFamily: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500">
                    <option value="Inter">Inter (Default)</option><option value="Roboto">Roboto</option><option value="Open Sans">Open Sans</option><option value="Nunito">Nunito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[15px] font-medium text-gray-700 mb-2">{t('ui.chart_type')}</label>
                  <select value={uiSettings.chartType} onChange={(e) => setUiSettings(prev => ({ ...prev, chartType: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500">
                    <option value="area">{t('appearance.chart.area')}</option><option value="line">{t('appearance.chart.line')}</option><option value="bar">{t('appearance.chart.bar')}</option><option value="radar">{t('appearance.chart.radar')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <SectionHeader title={t('system.title')} description={t('system.description')} action={<button onClick={saveSystemSettings} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[15px] font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-2">{loading ? t('content.saving') : t('content.save')}</button>} />
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="flex items-start justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div><p className="font-medium text-amber-900 text-[15px]">{t('system.maintenance')}</p><p className="text-sm text-amber-700 mt-1">{t('system.maintenance_desc')}</p></div>
                <button onClick={() => setSystemSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.maintenanceMode ? 'bg-amber-600' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div><p className="text-[15px] font-medium text-gray-900">{t('system.registration')}</p><p className="text-sm text-gray-500">{t('system.registration_desc')}</p></div>
                  <button onClick={() => setSystemSettings(prev => ({ ...prev, allowNewRegistrations: !prev.allowNewRegistrations }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.allowNewRegistrations ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.allowNewRegistrations ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div><p className="text-[15px] font-medium text-gray-900">{t('system.email_verify')}</p><p className="text-sm text-gray-500">{t('system.email_verify_desc')}</p></div>
                  <button onClick={() => setSystemSettings(prev => ({ ...prev, requireEmailVerification: !prev.requireEmailVerification }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.requireEmailVerification ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'audit':
        return (
          <div className="space-y-6">
            <SectionHeader title={t('audit.title')} description={t('audit.description')} />
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[15px]">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr><th className="px-4 py-3 text-left font-medium">{t('audit.table.time')}</th><th className="px-4 py-3 text-left font-medium">{t('audit.table.admin')}</th><th className="px-4 py-3 text-left font-medium">{t('audit.table.action')}</th><th className="px-4 py-3 text-left font-medium">{t('audit.table.target')}</th><th className="px-4 py-3 text-left font-medium">{t('audit.table.status')}</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { time: '2024-05-25 14:32', admin: 'Admin Utama', action: 'Mencabut API Key', target: 'wz_42_...f678', status: 'success' },
                      { time: '2024-05-25 10:15', admin: 'Admin Utama', action: 'Memperbarui Bobot WIS', target: 'academic: 40% → 45%', status: 'success' },
                      { time: '2024-05-24 16:48', admin: 'Admin Utama', action: 'Menangguhkan Akun', target: 'budi@ugm.ac.id', status: 'success' },
                    ].map((log, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-mono text-sm">{log.time}</td>
                        <td className="px-4 py-3 text-gray-900">{log.admin}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-sm font-medium ${log.action.includes('Cabut') || log.action.includes('Hapus') ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{log.action}</span></td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-sm truncate max-w-[200px]">{log.target}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-sm font-medium ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'crawl-queue':
        return (
          <div className="space-y-6">
            <SectionHeader
              title={t('crawl.title')}
              description={t('crawl.description')}
              action={
                <button
                  onClick={async () => {
                    setCrawlLoading(true);
                    try {
                      const r = await fetch('/api/crawl_queue.php?action=status');
                      const d = await r.json();
                      setCrawlStatus(d);
                      const r2 = await fetch('/api/crawl_queue.php?action=list');
                      const d2 = await r2.json();
                      setCrawlQueue(d2.jobs || []);
                      setCrawlLog(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: 'Status antrian diperbarui', type: 'info' }, ...prev.slice(0, 19)]);
                    } catch {
                      setCrawlLog(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: 'Gagal terhubung ke API crawl', type: 'error' }, ...prev.slice(0, 19)]);
                    }
                    setCrawlLoading(false);
                  }}
                  disabled={crawlLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[15px] font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  {crawlLoading ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                  Refresh Status
                </button>
              }
            />
            {crawlStatus && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: t('crawl.stat.total'), value: crawlStatus.total ?? '—', color: 'bg-gray-50 text-gray-700' },
                  { label: t('crawl.stat.pending'), value: crawlStatus.pending ?? '—', color: 'bg-amber-50 text-amber-700' },
                  { label: t('crawl.stat.done'), value: crawlStatus.done ?? '—', color: 'bg-green-50 text-green-700' },
                  { label: t('crawl.stat.failed'), value: crawlStatus.failed ?? '—', color: 'bg-red-50 text-red-700' },
                ].map((s, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${s.color} border-current/20`}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-[15px] mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900">{t('crawl.add')}</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={crawlInput}
                  onChange={e => setCrawlInput(e.target.value)}
                  placeholder={t('crawl.placeholder')}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                />
                <button
                  onClick={async () => {
                    if (!crawlInput.trim()) return;
                    setCrawlLoading(true);
                    try {
                      const id = crawlInput.trim();
                      const inferredType = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i.test(id) ? 'orcid' : 'doi';
                      const r = await fetch('/api/crawl_queue.php?action=enqueue', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: inferredType, identifier: id }),
                      });
                      const d = await r.json();
                      setCrawlLog(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: d.message || `Ditambahkan: ${crawlInput}`, type: d.status === 'ok' ? 'success' : 'error' }, ...prev.slice(0, 19)]);
                      if (d.status === 'ok') setCrawlInput('');
                    } catch {
                      setCrawlLog(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: 'Gagal menambahkan ke antrian', type: 'error' }, ...prev.slice(0, 19)]);
                    }
                    setCrawlLoading(false);
                  }}
                  disabled={crawlLoading || !crawlInput.trim()}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-[15px] font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors whitespace-nowrap"
                >
                  Tambah
                </button>
              </div>
              <button
                onClick={async () => {
                  setCrawlLoading(true);
                  try {
                    const r = await fetch('/api/crawl_queue.php?action=process', { method: 'POST' });
                    const d = await r.json();
                    setCrawlLog(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: d.message || 'Proses antrian dijalankan', type: d.status === 'ok' ? 'success' : 'error' }, ...prev.slice(0, 19)]);
                    showToast(d.message || 'Crawl dijalankan');
                  } catch {
                    setCrawlLog(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: 'Gagal menjalankan proses crawl', type: 'error' }, ...prev.slice(0, 19)]);
                  }
                  setCrawlLoading(false);
                }}
                disabled={crawlLoading}
                className="w-full py-2.5 bg-green-600 text-white rounded-lg text-[15px] font-medium hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t('crawl.process')}
              </button>
            </div>
            {crawlQueue.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900">{t('crawl.queue_items')}</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[15px]">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr><th className="px-4 py-3 text-left font-medium">{t('crawl.identifier')}</th><th className="px-4 py-3 text-left font-medium">{t('crawl.type')}</th><th className="px-4 py-3 text-left font-medium">{t('crawl.status')}</th><th className="px-4 py-3 text-left font-medium">{t('crawl.added')}</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {crawlQueue.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-sm text-gray-700">{item.identifier}</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 rounded text-sm font-medium bg-indigo-100 text-indigo-700">{item.type || 'unknown'}</span></td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-sm font-medium ${item.status === 'done' ? 'bg-green-100 text-green-700' : item.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span></td>
                          <td className="px-4 py-3 text-gray-500 text-sm">{item.created_at || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {crawlLog.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3">{t('crawl.activity_log')}</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-sm">
                  {crawlLog.map((entry, idx) => (
                    <div key={idx} className={`flex gap-3 ${entry.type === 'error' ? 'text-red-600' : entry.type === 'success' ? 'text-green-600' : 'text-gray-600'}`}>
                      <span className="text-gray-400 shrink-0">[{entry.time}]</span>
                      <span>{entry.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'cache-migration':
        return (
          <div className="space-y-6">
            <SectionHeader
              title={t('cache.section')}
              description="Migrasikan cache file legacy ke database dan kelola status cache aktif."
              action={
                <button
                  onClick={async () => {
                    setCacheLoading(true);
                    try {
                      const r = await fetch('/api/cache_to_db.php?action=status');
                      const d = await r.json();
                      setCacheStatus(d);
                      setCacheLog(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: 'Status cache diperbarui', type: 'info' }, ...prev.slice(0, 19)]);
                    } catch {
                      setCacheLog(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: 'Gagal terhubung ke API cache', type: 'error' }, ...prev.slice(0, 19)]);
                    }
                    setCacheLoading(false);
                  }}
                  disabled={cacheLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[15px] font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  {cacheLoading ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>}
                  Cek Status Cache
                </button>
              }
            />
            {cacheStatus && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: t('cache.stat.legacy'), value: cacheStatus.file_cache_count ?? '—', color: 'bg-amber-50 text-amber-700' },
                  { label: t('cache.stat.migrated'), value: cacheStatus.db_cache_count ?? '—', color: 'bg-green-50 text-green-700' },
                  { label: t('cache.stat.db_ready'), value: cacheStatus.db_available ? t('cache.stat.yes') : t('cache.stat.no'), color: cacheStatus.db_available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700' },
                ].map((s, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${s.color} border-current/20`}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-[15px] mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900">{t('cache.migration_actions')}</h3>
              <p className="text-[15px] text-gray-600">{t('cache.migrate_desc_full')} <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">api_cache</code> di database. Proses ini tidak menghapus file asli.</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    setCacheLoading(true);
                    try {
                      const r = await fetch('/api/cache_to_db.php?action=migrate', { method: 'POST' });
                      const d = await r.json();
                      setCacheLog(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: d.message || `Migrasi: ${d.migrated ?? 0} item berhasil`, type: d.status === 'ok' ? 'success' : 'error' }, ...prev.slice(0, 19)]);
                      setCacheStatus(prev => prev ? { ...prev, db_cache_count: (prev.db_cache_count || 0) + (d.migrated || 0) } : prev);
                      showToast(d.message || 'Migrasi selesai');
                    } catch {
                      setCacheLog(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: 'Gagal menjalankan migrasi', type: 'error' }, ...prev.slice(0, 19)]);
                    }
                    setCacheLoading(false);
                  }}
                  disabled={cacheLoading}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-[15px] font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  {t('cache.run')}
                </button>
                <button
                  onClick={() => confirmAction('clearCache', null)}
                  disabled={cacheLoading}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-[15px] font-medium hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  {t('cache.clear')}
                </button>
              </div>
            </div>
            {cacheLog.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3">{t('cache.log')}</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-sm">
                  {cacheLog.map((entry, idx) => (
                    <div key={idx} className={`flex gap-3 ${entry.type === 'error' ? 'text-red-600' : entry.type === 'success' ? 'text-green-600' : 'text-gray-600'}`}>
                      <span className="text-gray-400 shrink-0">[{entry.time}]</span>
                      <span>{entry.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default: return null;
    }
  };

  // Confirmation Modal
  const ConfirmationModal = () => {
    if (!confirmModal.show) return null;
    const modal = {
      revokeApiKey: { title: 'Cabut API Key?', message: 'Pengguna tidak akan dapat menggunakan kunci API ini lagi.', confirmText: 'Ya, Cabut', confirmClass: 'bg-red-600' },
      suspendUser: { title: 'Tangguhkan Akun?', message: 'Pengguna tidak dapat login hingga ditinjau.', confirmText: 'Ya, Tangguhkan', confirmClass: 'bg-amber-600' },
      deleteUser: { title: 'Hapus Akun Permanen?', message: 'SEMUA data akan dihapus permanen. TIDAK DAPAT DIBATALKAN.', confirmText: 'Ya, Hapus', confirmClass: 'bg-red-700' },
      promoteToCoAdmin: { title: 'Promosikan ke Co-Admin?', message: 'Pengguna akan memiliki akses administratif terbatas.', confirmText: 'Ya, Promosikan', confirmClass: 'bg-indigo-600' },
      clearCache: { title: t('cache.confirm_clear_title'), message: t('cache.confirm_clear_msg'), confirmText: t('cache.confirm_clear_ok'), confirmClass: 'bg-red-600' },
    }[confirmModal.action] || { title: 'Konfirmasi', message: 'Lanjutkan?', confirmText: 'Ya', confirmClass: 'bg-indigo-600' };
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-900">{modal.title}</h3></div>
          <div className="p-6">
            <p className="text-[15px] text-gray-600 mb-6">{modal.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, action: null, target: null })} disabled={loading} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">{t('action.cancel')}</button>
              <button onClick={executeAction} disabled={loading} className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${modal.confirmClass}`}>{loading ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : modal.confirmText}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isAdmin) return null;

  return (
    <main className="pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[15px] text-gray-600 mb-6">
        <Link to="/" className="hover:text-indigo-600 transition-colors">{t('nav.home')}</Link>
        <span className="text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </span>
        <span className="text-gray-900 font-medium">{t('nav.panel')}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Sticky seperti Dashboard */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-24">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{t('nav.panel')}</p>
                <p className="text-sm text-red-600 font-medium">{t('nav.super_user')}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[15px] font-medium transition-colors text-left ${
                    activeSection === item.id 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-gray-100 space-y-1">
              <Link to="/admin/teams" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium text-[15px]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('nav.teams')}
              </Link>
              <Link to="/admin/landing-content" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium text-[15px]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                {t('nav.landing')}
              </Link>
              <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-[15px]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('nav.back_to_app')}
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-3 space-y-6">
          {renderSection()}
        </main>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-fade-in ${toast.type === 'success' ? 'bg-gray-900 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={toast.type === 'success' ? 'M5 13l4 4L19 7' : toast.type === 'error' ? 'M6 18L18 6M6 6l12 12' : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
          </svg>
          <span className="text-[15px] font-medium">{toast.message}</span>
        </div>
      )}

      <ConfirmationModal />
    </main>
  );
};

export default Admin;