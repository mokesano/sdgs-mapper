import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Users, Network, TrendingUp, Globe, Search, Filter, 
  Download, Share2, MessageSquare, Mail, ExternalLink, Award,
  BookOpen, Building2, MapPin, Calendar, ArrowRight, Zap,
  Target, Lightbulb, Handshake
} from 'lucide-react';

const CollaborationHub = () => {
  const { t } = useTranslation('collaboration_hub');

  /* Ikon dan warna tetap di kode karena bukan teks; judul dan keterangannya
     diambil dari locale supaya ikut berganti bahasa. */
  const featureText = t('features', { returnObjects: true });
  const featureCards = [
    { icon: Zap,       color: 'from-yellow-400 to-orange-500' },
    { icon: Target,    color: 'from-green-400 to-emerald-500' },
    { icon: Lightbulb, color: 'from-blue-400 to-indigo-500' },
    { icon: Handshake, color: 'from-purple-400 to-pink-500' },
  ].map((card, i) => ({
    ...card,
    title:       Array.isArray(featureText) ? featureText[i]?.title ?? '' : '',
    description: Array.isArray(featureText) ? featureText[i]?.description ?? '' : '',
  }));

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedResearcher, setSelectedResearcher] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [networkStats, setNetworkStats] = useState(null);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusParam = activeFilter === 'all' ? '' : `&status=${activeFilter}`;
        const [researchersRes, statsRes] = await Promise.all([
          fetch(`/api/collaboration.php?action=researchers${statusParam}`),
          fetch('/api/collaboration.php?action=stats')
        ]);

        const researchersJson = await researchersRes.json();
        const statsJson = await statsRes.json();

        if (researchersJson.status === 'success') {
          // Set actual API result - preserve empty results as legitimate
          setResearchers(researchersJson.data || []);
        } else {
          // Only fallback on API error, not on empty results
          setResearchers(defaultResearchers);
        }
        if (statsJson.status === 'success') {
          setNetworkStats(statsJson.data);
        }
      } catch (e) {
        console.error('Error fetching collaboration data:', e);
        setResearchers(defaultResearchers);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeFilter]);

  // Fallback mock data jika API tidak tersedia
  const defaultResearchers = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      title: 'Professor of Climate Science',
      institution: 'MIT',
      location: 'Cambridge, MA, USA',
      sdgFocus: [13, 14, 15],
      collaborations: 47,
      hIndex: 52,
      publications: 234,
      avatar: 'https://i.pravatar.cc/150?img=1',
      status: 'open',
      recentProjects: ['Ocean Acidification Study', 'Carbon Capture Tech']
    },
    {
      id: 2,
      name: 'Prof. Ahmed Hassan',
      title: 'Director of Renewable Energy Lab',
      institution: 'Cairo University',
      location: 'Cairo, Egypt',
      sdgFocus: [7, 9, 11],
      collaborations: 63,
      hIndex: 48,
      publications: 189,
      avatar: 'https://i.pravatar.cc/150?img=2',
      status: 'open',
      recentProjects: ['Solar Grid Optimization', 'Smart City Initiative']
    },
    {
      id: 3,
      name: 'Dr. Maria Santos',
      title: 'Head of Public Health Research',
      institution: 'University of São Paulo',
      location: 'São Paulo, Brazil',
      sdgFocus: [3, 1, 2],
      collaborations: 38,
      hIndex: 41,
      publications: 156,
      avatar: 'https://i.pravatar.cc/150?img=3',
      status: 'busy',
      recentProjects: ['Vaccine Distribution', 'Nutrition Programs']
    },
    {
      id: 4,
      name: 'Dr. James Wong',
      title: 'AI & Ethics Researcher',
      institution: 'Stanford University',
      location: 'Stanford, CA, USA',
      sdgFocus: [9, 10, 16],
      collaborations: 52,
      hIndex: 45,
      publications: 178,
      avatar: 'https://i.pravatar.cc/150?img=4',
      status: 'open',
      recentProjects: ['AI Fairness Framework', 'Digital Inclusion']
    },
    {
      id: 5,
      name: 'Prof. Emma Larsson',
      title: 'Sustainable Agriculture Expert',
      institution: 'Swedish University of Agricultural Sciences',
      location: 'Uppsala, Sweden',
      sdgFocus: [2, 12, 15],
      collaborations: 41,
      hIndex: 39,
      publications: 142,
      avatar: 'https://i.pravatar.cc/150?img=5',
      status: 'open',
      recentProjects: ['Organic Farming Methods', 'Soil Conservation']
    },
    {
      id: 6,
      name: 'Dr. Raj Patel',
      title: 'Water Resources Specialist',
      institution: 'IIT Delhi',
      location: 'New Delhi, India',
      sdgFocus: [6, 11, 13],
      collaborations: 35,
      hIndex: 37,
      publications: 128,
      avatar: 'https://i.pravatar.cc/150?img=6',
      status: 'limited',
      recentProjects: ['Water Purification', 'Urban Water Management']
    }
  ];

  const statsDisplay = networkStats || {
    totalResearchers: 12847,
    activeCollaborations: 3421,
    countries: 156,
    institutions: 2341,
    projectsCompleted: 8934,
    avgCollaborationScore: 8.7
  };

  const sdgColors = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-green-500',
    4: 'bg-red-600',
    5: 'bg-orange-600',
    6: 'bg-cyan-500',
    7: 'bg-yellow-500',
    8: 'bg-red-700',
    9: 'bg-orange-700',
    10: 'bg-pink-500',
    11: 'bg-orange-800',
    12: 'bg-brown-500',
    13: 'bg-green-600',
    14: 'bg-blue-500',
    15: 'bg-green-700',
    16: 'bg-blue-600',
    17: 'bg-navy-500'
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'busy': return 'bg-yellow-100 text-yellow-700';
      case 'limited': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredResearchers = researchers.filter(researcher => {
    const name = (researcher.name || '').toLowerCase();
    const institution = (researcher.institution || '').toLowerCase();
    const bio = (researcher.bio || researcher.title || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                         institution.includes(searchTerm.toLowerCase()) ||
                         bio.includes(searchTerm.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'open') return matchesSearch && researcher.status === 'open';

    return matchesSearch;
  });

  return (
    <main className="min-h-screen pt-[60px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container px-8 max-w-7xl mx-auto relative z-10">
          <div className="text-center px-8 max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Network className="w-5 h-5" />
              <span className="text-[15px] font-medium">{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
                <Search className="w-5 h-5" />
                {t('hero.cta_find')}
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 flex items-center gap-2">
                <Handshake className="w-5 h-5" />
                {t('hero.cta_start')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-8">
        <div className="container max-w-7xl mx-auto w-full px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { label: t('stats.researchers'), value: statsDisplay.totalResearchers.toLocaleString(), icon: Users },
              { label: t('stats.collaborations'), value: statsDisplay.activeCollaborations.toLocaleString(), icon: Handshake },
              { label: t('stats.countries'), value: statsDisplay.countries, icon: Globe },
              { label: t('stats.institutions'), value: statsDisplay.institutions.toLocaleString(), icon: Building2 },
              { label: t('stats.projects'), value: statsDisplay.projectsCompleted.toLocaleString(), icon: Target },
              { label: t('stats.avg_score'), value: statsDisplay.avgCollaborationScore, icon: Award }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-[15px] text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8">
        <div className="container max-w-7xl mx-auto w-full px-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('filter.search_placeholder')}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('filter.all')}
                </button>
                <button
                  onClick={() => setActiveFilter('open')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeFilter === 'open'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('filter.open')}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                  <Filter className="w-4 h-4" />
                  {t('filter.more')}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                  <Download className="w-4 h-4" />
                  {t('filter.export')}
                </button>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Researchers ({filteredResearchers.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Network className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Users className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Researchers Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : filteredResearchers.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">{t('list.empty')}</div>
              ) : filteredResearchers.map((researcher) => (
                <div
                  key={researcher.orcid || researcher.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-2"
                  onClick={() => setSelectedResearcher(researcher)}
                >
                  <div className="relative h-32 bg-gradient-to-br from-indigo-500 to-purple-600">
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(researcher.status)}`}>
                        {researcher.status === 'open' ? 'Open to Collaborate' : 
                         researcher.status === 'busy' ? 'Limited Availability' : 'Selective'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 -mt-24 relative">
                    <img
                      src={researcher.avatar || `https://i.pravatar.cc/150?u=${researcher.orcid}`}
                      alt={researcher.name}
                      className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg mb-4 object-cover"
                      onError={(e) => { e.target.src = '/assets/img/researcher-default.svg'; }}
                    />
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {researcher.name}
                    </h3>
                    <p className="text-gray-600 text-[15px] mb-2">{researcher.title || researcher.bio || t('list.role_fallback')}</p>
                    
                    <div className="flex items-center gap-2 text-gray-500 text-[15px] mb-4">
                      <Building2 className="w-4 h-4" />
                      {researcher.institution}
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-500 text-[15px] mb-4">
                      <MapPin className="w-4 h-4" />
                      {researcher.location}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {researcher.sdgFocus.map(sdg => (
                        <span
                          key={sdg}
                          className={`w-8 h-8 rounded-full ${sdgColors[sdg]} text-white text-sm font-bold flex items-center justify-center`}
                          title={`SDG ${sdg}`}
                        >
                          {sdg}
                        </span>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-indigo-600">{researcher.collaborations}</div>
                        <div className="text-sm text-gray-500">{t('list.collabs')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-indigo-600">{researcher.hIndex}</div>
                        <div className="text-sm text-gray-500">H-Index</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-indigo-600">{researcher.publications ?? researcher.citations ?? 0}</div>
                        <div className="text-sm text-gray-500">{t('list.publications')}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors text-[15px] font-medium flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        Contact
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-[15px] font-medium flex items-center justify-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : filteredResearchers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">{t('list.empty')}</div>
              ) : filteredResearchers.map((researcher) => (
                <div
                  key={researcher.orcid || researcher.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex items-center gap-6 cursor-pointer group"
                  onClick={() => setSelectedResearcher(researcher)}
                >
                  <img
                    src={researcher.avatar || `https://i.pravatar.cc/150?u=${researcher.orcid}`}
                    alt={researcher.name}
                    className="w-20 h-20 rounded-xl object-cover"
                    onError={(e) => { e.target.src = '/assets/img/researcher-default.svg'; }}
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {researcher.name}
                    </h3>
                    <p className="text-gray-600 text-[15px] mb-2">{researcher.title || researcher.bio || 'Researcher'}</p>
                    <div className="flex items-center gap-4 text-gray-500 text-[15px]">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {researcher.institution}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {researcher.location}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex flex-wrap gap-2">
                      {researcher.sdgFocus.map(sdg => (
                        <span
                          key={sdg}
                          className={`w-8 h-8 rounded-full ${sdgColors[sdg]} text-white text-sm font-bold flex items-center justify-center`}
                        >
                          {sdg}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">{researcher.collaborations}</div>
                      <div className="text-sm text-gray-500">{t('list.collabs')}</div>
                    </div>
                    
                    <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Collaboration Features */}
      <section className="py-28 bg-white">
        <div className="container max-w-7xl mx-auto w-full px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('features_section.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('features_section.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureCards.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('cta.title')}</h2>
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
              {t('cta.primary')}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 flex items-center gap-2">
              {t('cta.secondary')}
            </button>
          </div>
        </div>
      </section>

    </main>
  );
};

export default CollaborationHub;