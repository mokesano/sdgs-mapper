import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Brain, Users, Target, Zap, Search, Filter, Sparkles, TrendingUp,
  Award, BookOpen, Building2, MapPin, Mail, ExternalLink, CheckCircle,
  Star, Lightbulb, Network, ArrowRight, Heart, MessageSquare, Share2
} from 'lucide-react';

const ResearchMatching = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('research_matching');

  /* Ikon dan warna tetap di kode karena bukan teks; judul dan keterangannya
     diambil dari locale supaya ikut berganti bahasa. */
  const featureText = t('features', { returnObjects: true });
  const featureCards = [
    { icon: Brain,  color: 'from-purple-500 to-indigo-600' },
    { icon: Target, color: 'from-blue-500 to-cyan-600' },
    { icon: Zap,    color: 'from-yellow-500 to-orange-600' },
  ].map((card, i) => ({
    ...card,
    title:       Array.isArray(featureText) ? featureText[i]?.title ?? '' : '',
    description: Array.isArray(featureText) ? featureText[i]?.description ?? '' : '',
  }));

  const stepText = t('how.steps', { returnObjects: true });
  const howSteps = [Search, Brain, Target, TrendingUp].map((icon, i) => ({
    icon,
    step:  i + 1,
    title: Array.isArray(stepText) ? stepText[i]?.title ?? '' : '',
    desc:  Array.isArray(stepText) ? stepText[i]?.desc  ?? '' : '',
  }));
  const [searchCriteria, setSearchCriteria] = useState({
    keywords: '',
    sdgGoals: [],
    institution: '',
    location: '',
    expertise: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [aiMatches, setAiMatches] = useState([]);

  // Fallback mock data
  const mockMatches = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      title: 'Professor of Climate Science',
      institution: 'MIT',
      location: 'Cambridge, MA, USA',
      match_score: 96,
      match_reasons: ['Similar research focus', 'Complementary expertise', 'Active in SDG 13 & 14'],
      sdg_focus: [13, 14, 15],
      h_index: 52,
      publications: 234,
      collaborations: 47,
      availability: 'Available for new projects'
    },
    {
      id: 2,
      name: 'Prof. Ahmed Hassan',
      title: 'Director of Renewable Energy Lab',
      institution: 'Cairo University',
      location: 'Cairo, Egypt',
      match_score: 93,
      match_reasons: ['Expertise in sustainable energy', 'Strong publication record', 'Active network'],
      sdg_focus: [7, 9, 11],
      h_index: 48,
      publications: 189,
      collaborations: 63,
      availability: 'Available for new projects'
    },
    {
      id: 3,
      name: 'Dr. James Wong',
      title: 'AI & Ethics Researcher',
      institution: 'Stanford University',
      location: 'Stanford, CA, USA',
      match_score: 89,
      match_reasons: ['AI expertise', 'Ethics alignment', 'High citation impact'],
      sdg_focus: [9, 10, 16],
      h_index: 45,
      publications: 178,
      collaborations: 52,
      availability: 'Limited availability'
    }
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

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const handleSearch = async () => {
    setIsSearching(true);

    try {
      const response = await fetch('/api/research_matching.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchCriteria)
      });

      const data = await response.json();

      if (data.status === 'success' && (data.matches || data.data)) {
        setAiMatches(data.matches || data.data);
      } else {
        setAiMatches(mockMatches);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setAiMatches(mockMatches);
    } finally {
      setIsSearching(false);
      setShowResults(true);
    }
  };

  return (
    <main className="min-h-screen pt-[60px] bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-28 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container px-8 max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Brain className="w-5 h-5" />
              <span className="text-[15px] font-medium">{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-4xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Search Criteria Section */}
      <section className="py-28">
        <div className="container px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('form.title')}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('form.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-[15px] font-semibold text-gray-700 mb-2">{t('form.keywords_label')}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('form.keywords_placeholder')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    value={searchCriteria.keywords}
                    onChange={(e) => setSearchCriteria({...searchCriteria, keywords: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-700 mb-2">{t('form.sdg_label')}</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                  <option>{t('form.sdg_any')}</option>
                  {[...Array(17)].map((_, i) => (
                    <option key={i} value={i + 1}>SDG {i + 1}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-700 mb-2">{t('form.institution_label')}</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                  <option>{t('institution.any')}</option>
                  <option>{t('institution.university')}</option>
                  <option>{t('institution.institute')}</option>
                  <option>{t('institution.government')}</option>
                  <option>{t('institution.industry')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-700 mb-2">{t('form.location_label')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('form.location_placeholder')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    value={searchCriteria.location}
                    onChange={(e) => setSearchCriteria({...searchCriteria, location: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-700 mb-2">{t('form.expertise_label')}</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                  <option>{t('expertise.any')}</option>
                  <option>{t('expertise.leading')}</option>
                  <option>{t('expertise.established')}</option>
                  <option>{t('expertise.emerging')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-700 mb-2">{t('form.collab_label')}</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                  <option>{t('collab.any')}</option>
                  <option>{t('collab.joint')}</option>
                  <option>{t('collab.coauthor')}</option>
                  <option>{t('collab.grant')}</option>
                  <option>{t('collab.exchange')}</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-12 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('form.searching')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('form.submit')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Matching Features */}
          {!showResults && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featureCards.map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Results Section */}
          {showResults && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">{t('results.title')}</h2>
                  <p className="text-gray-600">{t('results.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                    <Filter className="w-4 h-4" />
                    {t('results.refine')}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                    <Share2 className="w-4 h-4" />
                    {t('results.share')}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {aiMatches.map((match, index) => (
                  <div
                    key={match.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer group"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="flex items-start gap-6">
                      {/* Rank Number */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                          {index + 1}
                        </div>
                      </div>

                      {/* Avatar */}
                      <img
                        src={match.avatar || `https://i.pravatar.cc/150?u=${match.id}`}
                        alt={match.name}
                        className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                        onError={(e) => { e.target.src = '/assets/img/researcher-default.svg'; }}
                      />

                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                              {match.name}
                            </h3>
                            <p className="text-gray-600 mb-1">{match.title || t('card.role_fallback')}</p>
                            <div className="flex items-center gap-4 text-[15px] text-gray-500">
                              {match.institution && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {match.institution}
                                </span>
                              )}
                              {match.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {match.location}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Match Score */}
                          <div className={`px-4 py-2 rounded-xl border-2 font-bold ${getMatchScoreColor(match.match_score)}`}>
                            <div className="text-2xl">{match.match_score}%</div>
                            <div className="text-sm uppercase tracking-wide">{t('card.match')}</div>
                          </div>
                        </div>

                        {/* SDG Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(match.sdg_focus || []).map(sdg => (
                            <span
                              key={sdg}
                              className={`w-8 h-8 rounded-full ${sdgColors[sdg]} text-white text-sm font-bold flex items-center justify-center`}
                              title={`SDG ${sdg}`}
                            >
                              {sdg}
                            </span>
                          ))}
                        </div>

                        {/* Match Reasons */}
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-purple-900">{t('card.why')}</span>
                          </div>
                          <ul className="space-y-1">
                            {(match.match_reasons || []).map((reason, idx) => (
                              <li key={idx} className="text-[15px] text-purple-800 flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-indigo-600">{match.h_index}</div>
                            <div className="text-sm text-gray-500">{t('card.h_index')}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-indigo-600">{match.publications}</div>
                            <div className="text-sm text-gray-500">{t('card.publications')}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-indigo-600">{match.collaborations}</div>
                            <div className="text-sm text-gray-500">{t('card.collaborations')}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[15px] font-semibold text-green-600">{match.availability}</div>
                            <div className="text-sm text-gray-500">{match.response_time}</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                          <button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium flex items-center justify-center gap-2">
                            <Mail className="w-4 h-4" />
                            {t('card.contact')}
                          </button>
                          <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all font-medium flex items-center justify-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            {t('card.view_profile')}
                          </button>
                          <button className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all" title={t('card.save')} aria-label={t('card.save')}>
                            <Heart className="w-5 h-5" />
                          </button>
                          <button className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all" title={t('card.message')} aria-label={t('card.message')}>
                            <MessageSquare className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      {!showResults && (
        <section className="pt-20 pb-28 bg-white">
          <div className="container px-8 max-w-7xl mx-auto relative">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('how.title')}</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                {t('how.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {howSteps.map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-[15px]">{item.desc}</p>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="hidden md:block absolute top-1/2 -right-8 w-8 h-8 text-purple-300 transform -translate-y-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default ResearchMatching;