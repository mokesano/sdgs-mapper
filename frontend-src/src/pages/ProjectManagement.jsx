import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Users, Calendar, CheckCircle, Clock, AlertCircle, Plus,
  Search, Filter, MoreVertical, Edit2, Trash2, Share2, Download, MessageSquare,
  FileText, BarChart3, Settings, Eye, Star, Zap, Target, TrendingUp, Award
} from 'lucide-react';

const ProjectManagement = () => {
  const { t } = useTranslation('project_management');

  /* Ikon dan warna tetap di kode; judul dan keterangannya dari locale. */
  const quickText = t('quick.items', { returnObjects: true });
  const quickActions = [
    { icon: Plus,      color: 'from-blue-500 to-indigo-600' },
    { icon: Users,     color: 'from-green-500 to-emerald-600' },
    { icon: BarChart3, color: 'from-purple-500 to-pink-600' },
    { icon: Target,    color: 'from-orange-500 to-red-600' },
  ].map((card, i) => ({
    ...card,
    title: Array.isArray(quickText) ? quickText[i]?.title ?? '' : '',
    desc:  Array.isArray(quickText) ? quickText[i]?.desc  ?? '' : '',
  }));

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    planning: 0,
    completed: 0,
    totalBudget: 0,
    totalPublications: 0
  });
  const [loading, setLoading] = useState(true);

  // Fallback mock data
  const mockProjects = [
    {
      id: 1,
      title: 'Ocean Acidification Impact Study',
      description: 'Comprehensive analysis of ocean acidification effects on marine ecosystems across Pacific regions',
      status: 'active',
      progress: 67,
      start_date: '2024-01-15',
      end_date: '2025-06-30',
      sdg_focus: [13, 14],
      budget: 450000,
      spent: 287500,
      institution: 'MIT'
    },
    {
      id: 2,
      title: 'Solar Grid Optimization Initiative',
      description: 'Developing AI-powered optimization algorithms for renewable energy grid distribution',
      status: 'active',
      progress: 45,
      start_date: '2024-03-01',
      end_date: '2025-12-31',
      sdg_focus: [7, 9, 11],
      budget: 680000,
      spent: 245000,
      institution: 'Cairo University'
    },
    {
      id: 3,
      title: 'Urban Water Management System',
      description: 'Smart water purification and distribution system for rapidly growing urban areas',
      status: 'planning',
      progress: 15,
      start_date: '2024-06-01',
      end_date: '2026-05-31',
      sdg_focus: [6, 11, 13],
      budget: 520000,
      spent: 45000,
      institution: 'IIT Delhi'
    },
    {
      id: 4,
      title: 'Sustainable Agriculture Methods',
      description: 'Research on organic farming techniques and soil conservation practices for small-scale farmers',
      status: 'completed',
      progress: 100,
      start_date: '2022-09-01',
      end_date: '2024-08-31',
      sdg_focus: [2, 12, 15],
      budget: 380000,
      spent: 375000,
      institution: 'Swedish University of Agricultural Sciences'
    },
    {
      id: 5,
      title: 'AI Fairness Framework Development',
      description: 'Creating ethical guidelines and technical frameworks for unbiased AI systems in healthcare',
      status: 'active',
      progress: 78,
      start_date: '2023-11-01',
      end_date: '2025-04-30',
      sdg_focus: [9, 10, 16],
      budget: 590000,
      spent: 425000,
      institution: 'Stanford University'
    }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects.php?action=list');
      const data = await response.json();

      if (data.status === 'success' && data.projects) {
        const normalizedProjects = data.projects.map(p => ({
          ...p,
          sdg_focus: Array.isArray(p.sdg_focus) ? p.sdg_focus : JSON.parse(p.sdg_focus || '[]')
        }));
        setProjects(normalizedProjects);
        updateStats(normalizedProjects);
      } else {
        setProjects(mockProjects);
        updateStats(mockProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects(mockProjects);
      updateStats(mockProjects);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (projectList) => {
    setStats({
      total: projectList.length,
      active: projectList.filter(p => p.status === 'active').length,
      planning: projectList.filter(p => p.status === 'planning').length,
      completed: projectList.filter(p => p.status === 'completed').length,
      totalBudget: projectList.reduce((sum, p) => sum + (p.budget || 0), 0),
      totalPublications: projectList.reduce((sum, p) => sum + (p.publications || 0), 0)
    });
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
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'planning': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'on-hold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return Zap;
      case 'planning': return Clock;
      case 'completed': return CheckCircle;
      case 'paused': return AlertCircle;
      default: return Clock;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && project.status === 'active';
    if (activeTab === 'planning') return matchesSearch && project.status === 'planning';
    if (activeTab === 'completed') return matchesSearch && project.status === 'completed';

    return matchesSearch;
  });

  return (
    <main className="min-h-screen pt-[60px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-28 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container px-8 max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <FolderOpen className="w-5 h-5" />
                <span className="text-[15px] font-medium">{t('hero.badge')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('hero.title')}</h1>
              <p className="text-xl text-white/90 max-w-2xl">
                {t('hero.subtitle')}
              </p>
            </div>
            <button 
              onClick={() => setShowNewProjectModal(true)}
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('hero.new_project')}
            </button>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8">
        <div className="container px-8 max-w-7xl mx-auto relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: t('stats.total'), value: stats.total, icon: FolderOpen, color: 'from-blue-500 to-indigo-600' },
              { label: t('stats.active'), value: stats.active, icon: Zap, color: 'from-green-500 to-emerald-600' },
              { label: t('stats.planning'), value: stats.planning, icon: Clock, color: 'from-orange-500 to-red-600' },
              { label: t('stats.completed'), value: stats.completed, icon: CheckCircle, color: 'from-purple-500 to-pink-600' },
              { label: t('stats.budget'), value: `$${(stats.totalBudget / 1000000).toFixed(1)}M`, icon: BarChart3, color: 'from-cyan-500 to-blue-600' },
              { label: t('stats.publications'), value: stats.totalPublications, icon: FileText, color: 'from-yellow-500 to-orange-600' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-[15px] text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs & Search */}
      <section className="py-6">
        <div className="container px-8 max-w-7xl mx-auto relative z-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'all', label: t('tabs.all'), count: stats.total },
                  { id: 'active', label: t('tabs.active'), count: stats.active },
                  { id: 'planning', label: t('tabs.planning'), count: stats.planning },
                  { id: 'completed', label: t('tabs.completed'), count: stats.completed }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('filter.search_placeholder')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{t('list.empty')}</p>
              </div>
            ) : (filteredProjects.map((project) => {
              const StatusIcon = getStatusIcon(project.status);

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer group"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {project.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(project.status)} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-[15px] mb-3 line-clamp-2">{project.description}</p>
                      
                      <div className="flex items-center gap-4 text-[15px] text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {project.collaborators || 0} collaborators
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {project.publications || 0} publications
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(project.sdg_focus || []).map(sdg => (
                          <span
                            key={sdg}
                            className={`w-8 h-8 rounded-full ${sdgColors[sdg]} text-white text-sm font-bold flex items-center justify-center`}
                            title={`SDG ${sdg}`}
                          >
                            {sdg}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[15px] mb-2">
                      <span className="text-gray-600">{t('card.progress')}</span>
                      <span className="font-semibold text-indigo-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Team & Budget */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(4, 3))].map((_, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full border-2 border-white bg-indigo-400 flex items-center justify-center text-white text-sm font-bold"
                          title={t('card.team_member')}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[15px] text-gray-500">{t('card.budget_used')}</div>
                        <div className="font-semibold text-gray-900">
                          ${(project.spent / 1000).toFixed(0)}K / ${(project.budget / 1000).toFixed(0)}K
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[15px] text-gray-500">{t('card.institution')}</div>
                        <div className="font-semibold text-gray-900">{project.institution}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-indigo-50 rounded-lg transition-colors group/btn">
                          <Eye className="w-5 h-5 text-gray-400 group-hover/btn:text-indigo-600" />
                        </button>
                        <button className="p-2 hover:bg-indigo-50 rounded-lg transition-colors group/btn">
                          <Edit2 className="w-5 h-5 text-gray-400 group-hover/btn:text-indigo-600" />
                        </button>
                        <button className="p-2 hover:bg-indigo-50 rounded-lg transition-colors group/btn">
                          <MessageSquare className="w-5 h-5 text-gray-400 group-hover/btn:text-indigo-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400 mt-3 text-right">
                    {t('card.updated', { when: project.updated_at ? new Date(project.updated_at).toLocaleDateString() : t('card.recently') })}
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="pt-20 pb-28 bg-white">
        <div className="container px-8 max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('quick.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group text-left border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-[15px]">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProjectManagement;