import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('collection_detail');
  const { user } = useAuth();
  
  // State Management
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [editCollection, setEditCollection] = useState({
    name: '',
    description: '',
    privacy: 'private',
    tags: ''
  });

  // Mock Data for Collection Detail
  const mockCollection = {
    id: parseInt(id),
    name: 'Climate Change Adaptation',
    description: 'Kumpulan riset tentang adaptasi perubahan iklim di wilayah pesisir Asia Tenggara. Koleksi ini mencakup penelitian terbaru tentang strategi adaptasi, mitigasi dampak, dan kebijakan berkelanjutan untuk wilayah pesisir yang rentan terhadap perubahan iklim.',
    itemCount: 24,
    lastUpdated: '2024-11-15',
    privacy: 'public',
    tags: ['Climate', 'Adaptation', 'SDG 13'],
    owner: {
      name: 'Dr. Sarah Wijaya',
      orcid: '0000-0000-0000-0000',
      avatar: null
    },
    createdAt: '2024-06-10'
  };

  // Mock Data for Items in Collection
  const mockItems = [
    {
      id: 1,
      title: 'Climate Change Adaptation Strategies for Coastal Communities in Southeast Asia',
      authors: ['Sarah Wijaya', 'Ahmad Rahman', 'Li Wei'],
      type: 'article',
      publishedDate: '2024-10-15',
      journal: 'Journal of Climate Studies',
      doi: '10.1234/jcs.2024.001',
      citations: 45,
      sdgs: [13, 14]
    },
    {
      id: 2,
      title: 'Sustainable Urban Transport Systems and Their Impact on Carbon Emissions',
      authors: ['Michael Chen', 'Fatima Hassan'],
      type: 'article',
      publishedDate: '2024-09-22',
      journal: 'Urban Sustainability Review',
      doi: '10.1234/usr.2024.045',
      citations: 32,
      sdgs: [11, 13]
    },
    {
      id: 3,
      title: 'Renewable Energy Policy Frameworks in ASEAN Countries',
      authors: ['Budi Santoso', 'Emma Thompson'],
      type: 'article',
      publishedDate: '2024-08-30',
      journal: 'Energy Policy Journal',
      doi: '10.1234/epj.2024.078',
      citations: 28,
      sdgs: [7, 13]
    },
    {
      id: 4,
      title: 'Community-Based Waste Management in Coastal Cities',
      authors: ['Rina Kusuma', 'John Doe'],
      type: 'article',
      publishedDate: '2024-11-01',
      journal: 'Environmental Management',
      doi: '10.1234/em.2024.112',
      citations: 15,
      sdgs: [11, 12, 13]
    },
    {
      id: 5,
      title: 'Mangrove Ecosystem Restoration as Climate Adaptation Strategy',
      authors: ['Agus Pratama', 'Maria Garcia'],
      type: 'article',
      publishedDate: '2024-07-18',
      journal: 'Ecological Engineering',
      doi: '10.1234/ee.2024.056',
      citations: 52,
      sdgs: [13, 14, 15]
    },
    {
      id: 6,
      title: 'Green Infrastructure Planning for Flood Resilience',
      authors: ['David Lee', 'Siti Nurhaliza'],
      type: 'article',
      publishedDate: '2024-06-25',
      journal: 'Landscape and Urban Planning',
      doi: '10.1234/lup.2024.034',
      citations: 38,
      sdgs: [11, 13]
    },
    {
      id: 7,
      title: 'Solar Panel Adoption Patterns in Tropical Regions',
      authors: ['Hendra Gunawan', 'Lisa Anderson'],
      type: 'article',
      publishedDate: '2024-10-05',
      journal: 'Renewable Energy',
      doi: '10.1234/re.2024.089',
      citations: 21,
      sdgs: [7, 13]
    },
    {
      id: 8,
      title: 'Water Security and Climate Change in Island Nations',
      authors: ['Putri Wulandari', 'Robert Smith'],
      type: 'article',
      publishedDate: '2024-09-10',
      journal: 'Water Resources Research',
      doi: '10.1234/wrr.2024.067',
      citations: 44,
      sdgs: [6, 13]
    },
    {
      id: 9,
      title: 'Agricultural Adaptation to Changing Rainfall Patterns',
      authors: ['Yanto Susilo', 'Anna Martinez'],
      type: 'article',
      publishedDate: '2024-08-15',
      journal: 'Agricultural Systems',
      doi: '10.1234/as.2024.045',
      citations: 36,
      sdgs: [2, 13]
    },
    {
      id: 10,
      title: 'Climate Education Programs in Southeast Asian Universities',
      authors: ['Dewi Lestari', 'James Wilson'],
      type: 'article',
      publishedDate: '2024-11-08',
      journal: 'Environmental Education Research',
      doi: '10.1234/eer.2024.123',
      citations: 12,
      sdgs: [4, 13]
    },
    {
      id: 11,
      title: 'Blue Carbon Ecosystems: Measurement and Valuation',
      authors: ['Eko Prasetyo', 'Catherine Brown'],
      type: 'article',
      publishedDate: '2024-07-22',
      journal: 'Marine Policy',
      doi: '10.1234/mp.2024.078',
      citations: 48,
      sdgs: [13, 14]
    },
    {
      id: 12,
      title: 'Disaster Risk Reduction in Coastal Megacities',
      authors: ['Fitri Handayani', 'Thomas Miller'],
      type: 'article',
      publishedDate: '2024-10-28',
      journal: 'International Journal of Disaster Risk Reduction',
      doi: '10.1234/ijdrr.2024.091',
      citations: 27,
      sdgs: [11, 13]
    }
  ];

  // Fetch collection data from API
  useEffect(() => {
    if (!user?.orcid) { 
      // Use mock data if not authenticated
      setCollection(mockCollection);
      setItems(mockItems);
      setLoading(false);
      return; 
    }
    
    setLoading(true);
    setError(null);
    
    // Fetch collection detail from API
    fetch(`/api/my_collections.php?orcid=${encodeURIComponent(user.orcid)}&action=detail&collection_id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          setCollection(data.collection ?? mockCollection);
          setItems(data.items ?? mockItems);
        } else {
          // Fallback to mock data
          setCollection(mockCollection);
          setItems(mockItems);
        }
      })
      .catch(err => {
        // Fallback to mock data on error
        setCollection(mockCollection);
        setItems(mockItems);
      })
      .finally(() => setLoading(false));
  }, [id, user?.orcid]);

  // Filter & Sort Logic
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.authors.some(a => a.toLowerCase().includes(q)) ||
        item.journal?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.publishedDate) - new Date(a.publishedDate);
      if (sortBy === 'citations') return b.citations - a.citations;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [searchQuery, sortBy, items]);

  // Stats Calculation
  const stats = {
    totalItems: items.length,
    totalCitations: items.reduce((sum, item) => sum + (item.citations || 0), 0),
    avgCitations: items.length > 0 ? Math.round(items.reduce((sum, item) => sum + (item.citations || 0), 0) / items.length) : 0,
    uniqueSdgs: [...new Set(items.flatMap(item => item.sdgs || []))].length
  };

  // Handlers
  const showToast = (msg) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  const handleUpdateCollection = (e) => {
    e.preventDefault();
    if (!editCollection.name.trim()) return;

    const formData = new FormData();
    formData.append('orcid', user.orcid);
    formData.append('action', 'update');
    formData.append('collection_id', id);
    formData.append('name', editCollection.name);
    formData.append('description', editCollection.description);
    formData.append('privacy', editCollection.privacy);
    formData.append('tags', editCollection.tags);

    fetch('/api/my_collections.php', { method: 'POST', body: formData })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          setCollection({ ...collection, ...data.collection });
          setIsEditModalOpen(false);
          showToast(t('toast.updated'));
        } else {
          showToast(data.message || 'Gagal memperbarui koleksi');
        }
      })
      .catch(err => showToast('Error: ' + err.message));
  };

  const handleDeleteCollection = () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus koleksi ini?')) return;

    const formData = new FormData();
    formData.append('orcid', user.orcid);
    formData.append('action', 'delete');
    formData.append('collection_id', id);

    fetch('/api/my_collections.php', { method: 'POST', body: formData })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          showToast(t('toast.deleted'));
          navigate('/my-collections');
        } else {
          showToast(data.message || 'Gagal menghapus koleksi');
        }
      })
      .catch(err => showToast('Error: ' + err.message));
  };

  const handleRemoveItem = (itemId) => {
    if (!window.confirm('Hapus item ini dari koleksi?')) return;
    
    // In real implementation, call API to remove item
    setItems(items.filter(item => item.id !== itemId));
    showToast(t('toast.item_removed'));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return t('date.today');
    if (diff === 1) return t('date.yesterday');
    if (diff < 7)   return t('date.days_ago', { count: diff });
    const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getSDGColor = (sdg) => {
    const colors = {
      1: '#e5243b', 2: '#dda63a', 3: '#4c9f38', 4: '#c5192d', 5: '#ff3a21',
      6: '#26bde2', 7: '#fcc30b', 8: '#a21942', 9: '#fd6925', 10: '#dd1367',
      11: '#fd9d24', 12: '#bf8b2e', 13: '#3f7e44', 14: '#0a97d9', 15: '#56c024',
      16: '#00689d', 17: '#19486a'
    };
    return colors[sdg] || '#gray';
  };

  if (loading) {
    return (
      <main className="pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-gray-600">{t('loading')}</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">{t('error_title')}</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/my-collections" className="text-indigo-600 hover:text-indigo-700 font-medium">
            {t('back_link')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[15px] text-gray-600 mb-6">
        <Link to="/" className="hover:text-indigo-600 transition-colors">{t('breadcrumb.home')}</Link>
        <span className="text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </span>
        <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">{t('breadcrumb.dashboard')}</Link>
        <span className="text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </span>
        <Link to="/my-collections" className="hover:text-indigo-600 transition-colors">{t('breadcrumb.collections')}</Link>
        <span className="text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{collection?.name}</span>
      </nav>

      {/* Collection Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{collection?.name}</h1>
              {collection?.privacy === 'public' ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">{t('privacy.public')}</span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-bold">{t('privacy.private')}</span>
              )}
            </div>
            <p className="text-gray-600 mb-4">{collection?.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {collection?.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[15px] font-medium">#{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => {
                setEditCollection({
                  name: collection?.name || '',
                  description: collection?.description || '',
                  privacy: collection?.privacy || 'private',
                  tags: collection?.tags?.join(', ') || ''
                });
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              {t('actions.edit')}
            </button>
            <button 
              onClick={() => showToast(t('toast.share_soon'))}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              {t('actions.share')}
            </button>
            <button 
              onClick={handleDeleteCollection}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              {t('actions.delete')}
            </button>
          </div>
        </div>

        {/* Collection Meta */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-[15px] text-gray-600">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span>{t('meta.created_by')} <strong>{collection?.owner?.name}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-[15px] text-gray-600">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>{t('meta.created_at')} {formatDate(collection?.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-[15px] text-gray-600">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <span>{t('meta.last_updated')} {formatDate(collection?.lastUpdated)}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: t('stat.items'), value: stats.totalItems, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-indigo-50 text-indigo-600' },
          { label: t('stat.citations'), value: stats.totalCitations, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'bg-purple-50 text-purple-600' },
          { label: t('stat.avg'), value: stats.avgCitations, icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z', color: 'bg-blue-50 text-blue-600' },
          { label: t('stat.sdgs'), value: stats.uniqueSdgs, icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-green-50 text-green-600' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-[15px] text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow relative">
            <input 
              type="text" 
              placeholder={t('search_ph')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          
          <div className="flex gap-3">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] text-gray-700 focus:ring-2 focus:ring-indigo-500">
              <option value="date">{t('sort.date')}</option>
              <option value="citations">{t('sort.citations')}</option>
              <option value="title">{t('sort.title')}</option>
            </select>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid/List */}
      {filteredItems.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all ${viewMode === 'list' ? 'p-4' : 'overflow-hidden'}`}
            >
              {viewMode === 'grid' && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 border-b border-gray-100">
                  <div className="flex items-center justify-center h-20">
                    <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                </div>
              )}
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold uppercase tracking-wide">
                    {item.type}
                  </span>
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title={t('item.remove_title')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 cursor-pointer transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-[15px] text-gray-600 mb-2 line-clamp-1">{item.authors.join(', ')}</p>
                
                <p className="text-sm text-gray-500 mb-3">{item.journal} • {formatDate(item.publishedDate)}</p>
                
                {item.sdgs && item.sdgs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.sdgs.map(sdg => (
                      <span 
                        key={sdg}
                        className="w-7 h-7 rounded flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: getSDGColor(sdg) }}
                        title={t('item.sdg_title', { n: sdg })}
                      >
                        {sdg}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      {t('item.citations', { count: item.citations })}
                    </span>
                  </div>
                  <a 
                    href={`https://doi.org/${item.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    DOI
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('empty.title')}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery ? t('empty.with_search') : t('empty.no_items')}
          </p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              {t('empty.reset')}
            </button>
          )}
        </div>
      )}

      {/* Edit Collection Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{t('modal.title')}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateCollection} className="p-6 space-y-4">
              <div>
                <label className="block text-[15px] font-medium text-gray-700 mb-1">{t('modal.name_label')}</label>
                <input 
                  type="text" 
                  required
                  value={editCollection.name}
                  onChange={(e) => setEditCollection({...editCollection, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('modal.name_ph')}
                />
              </div>
              <div>
                <label className="block text-[15px] font-medium text-gray-700 mb-1">{t('modal.desc_label')}</label>
                <textarea 
                  rows={3}
                  value={editCollection.description}
                  onChange={(e) => setEditCollection({...editCollection, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder={t('modal.desc_ph')}
                />
              </div>
              <div>
                <label className="block text-[15px] font-medium text-gray-700 mb-1">{t('modal.tags_label')}</label>
                <input 
                  type="text" 
                  value={editCollection.tags}
                  onChange={(e) => setEditCollection({...editCollection, tags: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('modal.tags_ph')}
                />
              </div>
              <div>
                <label className="block text-[15px] font-medium text-gray-700 mb-1">{t('modal.privacy_label')}</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="private" 
                      checked={editCollection.privacy === 'private'}
                      onChange={(e) => setEditCollection({...editCollection, privacy: e.target.value})}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-[15px] text-gray-700">{t('privacy.private')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="public" 
                      checked={editCollection.privacy === 'public'}
                      onChange={(e) => setEditCollection({...editCollection, privacy: e.target.value})}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-[15px] text-gray-700">{t('privacy.public')}</span>
                  </label>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('modal.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  {t('modal.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {isToastVisible && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-slide-up">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          <span className="text-[15px] font-medium">{toastMessage}</span>
        </div>
      )}
    </main>
  );
};

export default CollectionDetail;