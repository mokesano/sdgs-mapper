import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Handshake, Building2, TrendingUp, Search, Filter, ArrowRight,
  DollarSign, Users, Calendar, MapPin, Target, Zap, Award, BookOpen, Globe, MessageSquare,
  Share2, ExternalLink, Star, CheckCircle, Clock, Briefcase
} from 'lucide-react';

const InnovationMarketplace = () => {
  const { t } = useTranslation('innovation_marketplace');

  /* Ikon dan warna tetap di kode; judul dan keterangan langkahnya dari locale. */
  const stepText = t('how.steps', { returnObjects: true });
  const howSteps = [
    { icon: Search,     color: 'from-emerald-500 to-teal-600' },
    { icon: Briefcase,  color: 'from-blue-500 to-indigo-600' },
    { icon: Handshake,  color: 'from-orange-500 to-red-500' },
    { icon: TrendingUp, color: 'from-pink-500 to-rose-600' },
  ].map((card, i) => ({
    ...card,
    step:  i + 1,
    title: Array.isArray(stepText) ? stepText[i]?.title ?? '' : '',
    desc:  Array.isArray(stepText) ? stepText[i]?.desc  ?? '' : '',
  }));

  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/innovation_marketplace.php?action=opportunities');
      const data = await response.json();

      if (data.status === 'success' && data.opportunities) {
        const normalizedOpportunities = data.opportunities.map(opp => ({
          ...opp,
          sdg_focus: Array.isArray(opp.sdg_focus) ? opp.sdg_focus : JSON.parse(opp.sdg_focus || '[]'),
          required_skills: Array.isArray(opp.required_skills) ? opp.required_skills : JSON.parse(opp.required_skills || '[]')
        }));
        setOpportunities(normalizedOpportunities);
      } else {
        setOpportunities(mockOpportunities);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities(mockOpportunities);
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data
  const mockOpportunities = [
    {
      id: 1,
      title: 'Carbon Capture Technology Partnership',
      organization: 'Tesla Energy',
      type: 'industry',
      category: 'Climate Tech',
      description: 'Seeking academic partners for next-generation carbon capture and storage solutions',
      sdg_focus: [13, 9, 7],
      budget_range: '$2M - $3M',
      deadline: '2025-02-28',
      required_skills: ['Environmental Science', 'Carbon Capture', 'Lab Experience'],
      status: 'open'
    },
    {
      id: 2,
      title: 'AI-Driven Drug Discovery Collaboration',
      organization: 'Pfizer Research',
      type: 'industry',
      category: 'Healthcare',
      description: 'Revolutionary AI platform for accelerating drug discovery',
      sdg_focus: [3, 9],
      budget_range: '$4M - $5M',
      deadline: '2025-01-31',
      required_skills: ['Machine Learning', 'Bioinformatics', 'Python'],
      status: 'open'
    },
    {
      id: 3,
      title: 'Sustainable Agriculture Innovation Grant',
      organization: 'Bill & Melinda Gates Foundation',
      type: 'foundation',
      category: 'Agriculture',
      description: 'Supporting breakthrough research in climate-resilient crops',
      sdg_focus: [2, 1, 13],
      budget_range: '$1.5M - $2M',
      deadline: '2025-03-15',
      required_skills: ['Agricultural Science', 'Field Research', 'Developing Countries'],
      status: 'open'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Opportunities', count: opportunities.length, icon: Lightbulb },
    { id: 'climate', name: 'Climate Tech', count: opportunities.filter(o => o.category === 'Climate Tech').length, icon: Target },
    { id: 'healthcare', name: 'Healthcare', count: opportunities.filter(o => o.category === 'Healthcare').length, icon: Zap },
    { id: 'agriculture', name: 'Agriculture', count: opportunities.filter(o => o.category === 'Agriculture').length, icon: BookOpen },
    { id: 'energy', name: 'Energy', count: opportunities.filter(o => o.category === 'Energy').length, icon: DollarSign },
    { id: 'environment', name: 'Environment', count: opportunities.filter(o => o.category === 'Environment').length, icon: Globe }
  ];

  const types = [
    { id: 'all', name: 'All Types' },
    { id: 'industry', name: 'Industry' },
    { id: 'government', name: 'Government' },
    { id: 'foundation', name: 'Foundation' },
    { id: 'nonprofit', name: 'Non-Profit' }
  ];

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

  const getTypeColor = (type) => {
    switch(type) {
      case 'industry': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'government': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'foundation': return 'bg-green-100 text-green-700 border-green-200';
      case 'nonprofit': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = (opp.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (opp.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (opp.organization || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeCategory === 'all' ||
                           (activeCategory === 'climate' && opp.category === 'Climate Tech') ||
                           (activeCategory === 'healthcare' && opp.category === 'Healthcare') ||
                           (activeCategory === 'agriculture' && opp.category === 'Agriculture') ||
                           (activeCategory === 'energy' && opp.category === 'Energy') ||
                           (activeCategory === 'environment' && opp.category === 'Environment');

    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalOpportunities: 247,
    totalFunding: '$127M+',
    activePartnerships: 89,
    successRate: '73%'
  };

  return (
    <main className="min-h-screen pt-[60px] bg-gradient-to-br from-slate-50 via-orange-50 to-yellow-50">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 text-white py-28 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container px-8 max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Handshake className="w-5 h-5" />
              <span className="text-[15px] font-medium">{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {[
                { label: t('stats.opportunities'), value: stats.totalOpportunities, icon: Lightbulb },
                { label: t('stats.funding'), value: stats.totalFunding, icon: DollarSign },
                { label: t('stats.partnerships'), value: stats.activePartnerships, icon: Handshake },
                { label: t('stats.success_rate'), value: stats.successRate, icon: CheckCircle }
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <stat.icon className="w-6 h-6 mx-auto mb-2 opacity-80" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-[15px] opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-28 -mt-8">
        <div className="container px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('filter.search_placeholder')}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button className="flex items-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium whitespace-nowrap">
                <Filter className="w-5 h-5" />
                {t('filter.advanced')}
              </button>
            </div>
            
            {/* Category Tabs */}
            <div className="flex gap-3 mt-8 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="w-5 h-5" />
                  {category.name}
                  <span className={`text-sm px-2 py-0.5 rounded-full ${
                    activeCategory === category.id ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Type Filter */}
            <div className="flex gap-2 mt-6 flex-wrap">
              <span className="text-[15px] font-semibold text-gray-700 py-2">{t('filter.org_type')}</span>
              {types.map(type => (
                <button
                  key={type.id}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-[15px] font-medium"
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading ? (
              <div className="flex justify-center items-center py-12 col-span-full">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="text-center py-12 col-span-full">
                <p className="text-gray-600">{t('list.empty')}</p>
              </div>
            ) : (filteredOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
                onClick={() => setSelectedOpportunity(opp)}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {opp.logo_url ? (
                        <img
                          src={opp.logo_url}
                          alt={opp.organization}
                          className="w-12 h-12 rounded-lg bg-white p-1 object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-lg font-bold">
                          {(opp.organization || 'O').charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-[15px] opacity-90">{opp.organization}</div>
                        <div className="font-bold text-lg">{opp.title}</div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border bg-white/20 backdrop-blur-sm`}>
                      {(opp.type || 'other').charAt(0).toUpperCase() + (opp.type || 'other').slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[15px] opacity-90">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {opp.budget_range || 'TBD'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                </div>
                
                {/* Body */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-3">{opp.description}</p>

                  {/* SDG Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(opp.sdg_focus || []).map(sdg => (
                      <span
                        key={sdg}
                        className={`w-8 h-8 rounded-full ${sdgColors[sdg]} text-white text-sm font-bold flex items-center justify-center`}
                        title={`SDG ${sdg}`}
                      >
                        {sdg}
                      </span>
                    ))}
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {opp.category}
                    </span>
                  </div>

                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-[15px]">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span>{opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'TBD'}</span>
                    </div>
                  </div>

                  {/* Requirements Preview */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-500 mb-2">KEY REQUIREMENTS</div>
                    <div className="flex flex-wrap gap-2">
                      {(opp.required_skills || []).slice(0, 2).map((req, idx) => (
                        <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-sm">
                          {req}
                        </span>
                      ))}
                      {(opp.required_skills || []).length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                          +{(opp.required_skills || []).length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all font-medium flex items-center justify-center gap-2">
                      {t('list.apply')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                      <Star className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3 text-center">
                    <span className="text-sm text-gray-500">
                      Status: {opp.status || 'open'}
                    </span>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 bg-white">
        <div className="container px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('how.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From discovery to deployment - we streamline the path from research to real-world impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {howSteps.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl text-center border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-[15px]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 text-white">
        <div className="container px-8 max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('cta.title')}</h2>
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
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

export default InnovationMarketplace;