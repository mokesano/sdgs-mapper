import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../components/shared';

// NOTE: The sample data below (posts, groups, activities, invitations, events,
// users) is still hardcoded Indonesian pending a real backend feed. i18n
// covers the shell chrome only for now.
const GROUPS = [
  { name: 'Riset Iklim',        members: 120, icon: '🌍' },
  { name: 'AI dalam Pendidikan', members: 85,  icon: '🤖' },
  { name: 'Penulis Jurnal',     members: 340, icon: '✍️' }
];

const POPULAR_TOPICS = [
  { tag: 'SDGs2026',        posts: '1.2k' },
  { tag: 'OpenAccess',      posts: '850'  },
  { tag: 'KolaborasiRiset', posts: '540'  }
];

const CONNECTIONS = [
  { name: 'Dr. Ani Lestari', aff: 'UI Jakarta',  avatar: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Prof. John Doe',  aff: 'MIT USA',     avatar: 'https://i.pravatar.cc/150?img=3' },
  { name: 'Siti Nurhaliza',  aff: 'ITB Bandung', avatar: 'https://i.pravatar.cc/150?img=9' }
];

const RECENT_ACTIVITIES = [
  { name: 'Budi S.', action: 'mengunggah artikel baru',        time: '5m lalu', icon: '📄' },
  { name: 'Ani L.',  action: 'bergabung dengan grup Iklim',    time: '1j lalu', icon: '👥' },
  { name: 'John D.', action: 'memberikan komentar',            time: '2j lalu', icon: '💬' }
];

const INVITATIONS = [
  { name: 'Grup Energi Terbarukan',  action: 'mengundang Anda', logo: '⚡' },
  { name: 'Konferensi Asia 2026',    action: 'mengundang Anda', logo: '🎤' }
];

const EVENTS = [
  { day: '25', month: 'MEI', title: 'Webinar SDG 13',       time: '10:00 WIB', location: 'Zoom' },
  { day: '02', month: 'JUN', title: 'Workshop Penulisan',    time: '13:00 WIB', location: 'Jakarta' }
];

const ACTIVE_USERS = [
  { name: 'Rina M.',  status: 'online', avatar: 'https://i.pravatar.cc/150?img=10' },
  { name: 'Dimas P.', status: 'away',   avatar: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Sarah K.', status: 'online', avatar: 'https://i.pravatar.cc/150?img=20' }
];

const TABS = ['semua', 'mengikuti', 'grup', 'mentions'];

const Feeds = () => {
  const { t } = useTranslation('feeds');
  const [activeTab, setActiveTab] = useState('semua');
  const [postContent, setPostContent] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [feedPosts, setFeedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/feeds.php?action=list&visibility=public&limit=20');
        const data = await response.json();
        if (data.status === 'success' && data.posts) setFeedPosts(data.posts);
        else                                         setFeedPosts(getSampleFeedPosts());
      } catch (err) {
        console.error('Error fetching feed posts:', err);
        setFeedPosts(getSampleFeedPosts());
      } finally {
        setLoading(false);
      }
    };
    fetchFeedPosts();
  }, []);

  const getSampleFeedPosts = () => [
    {
      id: 1, type: 'text', likes: 12, comments: 5, shares: 2,
      author: { name: 'Dr. Budi Santoso', handle: '@budisantoso', avatar: 'https://via.placeholder.com/40/6366f1/ffffff?text=BS', affiliation: 'Universitas Indonesia', isGroup: false, time: '2 jam yang lalu' },
      content: 'Kami dengan bangga mengumumkan peluncuran fitur baru untuk analisis kolaborasi riset.',
      article: null, file: null, images: null
    },
    {
      id: 2, type: 'article', likes: 45, comments: 12, shares: 8,
      author: { name: 'Prof. Siti Aminah', handle: '@sitiaminah', avatar: 'https://i.pravatar.cc/150?img=5', affiliation: 'ITB', isGroup: false, time: '5 jam yang lalu' },
      content: 'Temuan terbaru kami tentang dampak perubahan iklim terhadap biodiversitas laut.',
      article: { title: 'Dampak Perubahan Iklim pada Biodiversitas Laut', journal: 'Jurnal Ilmu Kelautan', vol: 'Vol. 12, No. 3 (2026)', image: 'https://via.placeholder.com/600x300/10b981/ffffff?text=Artikel+Riset', sdgs: [13, 14] }
    }
  ];

  const toggleLike = async (id) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    try {
      await fetch('/api/feeds.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', post_id: id, user_id: 1 })
      });
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const toggleSave = (id) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getSDGColor = (sdg) => {
    const colors = {
      11: 'bg-amber-100 text-amber-700',
      13: 'bg-green-100 text-green-700',
      14: 'bg-blue-100 text-blue-700'
    };
    return colors[sdg] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {t('create_post')}
            </button>

            {/* Navigation Menu */}
            <nav className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <Link to="/feeds" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 font-medium border-l-4 border-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                {t('nav.feed')}
              </Link>
              <Link to="/notifications" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-lg">@</span>
                {t('nav.mentions')}
              </Link>
              <Link to="/messages" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {t('nav.messages')}
                <span className="ml-auto bg-indigo-600 text-white text-sm font-bold px-2 py-0.5 rounded-full">8</span>
              </Link>
              <Link to="/my-collections" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                {t('nav.saved')}
              </Link>
              <Link to="/notifications" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {t('nav.notifications')}
                <span className="ml-auto bg-indigo-600 text-white text-sm font-bold px-2 py-0.5 rounded-full">12</span>
              </Link>
            </nav>

            {/* Groups */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-900 text-[15px] mb-3 uppercase tracking-wider">{t('sections.groups')}</h3>
              <div className="space-y-3">
                {GROUPS.map((group, idx) => (
                  <Link key={idx} to={`/groups/${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-lg">{group.icon}</div>
                    <div>
                      <p className="text-[15px] font-semibold text-gray-900">{group.name}</p>
                      <p className="text-sm text-gray-500">{t('members', { count: group.members })}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button className="w-full mt-3 text-[15px] text-indigo-600 font-medium hover:text-indigo-700">{t('see_all.groups')}</button>
            </div>

            {/* Popular Topics */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-900 text-[15px] mb-3 uppercase tracking-wider">{t('sections.topics')}</h3>
              <div className="space-y-2">
                {POPULAR_TOPICS.map((topic, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-[15px] font-medium text-gray-900">#{topic.tag}</span>
                    <span className="text-sm text-gray-500">{t('posts', { count: topic.posts })}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 text-[15px] text-indigo-600 font-medium hover:text-indigo-700">{t('see_all.topics')}</button>
            </div>

            {/* Connections */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-900 text-[15px] mb-3 uppercase tracking-wider">{t('sections.connections')}</h3>
              <div className="space-y-3">
                {CONNECTIONS.map((conn, idx) => (
                  <Link key={idx} to={`/profile/${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <img src={conn.avatar} alt={conn.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-gray-900 truncate">{conn.name}</p>
                      <p className="text-sm text-gray-500 truncate">{conn.aff}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button className="w-full mt-3 text-[15px] text-indigo-600 font-medium hover:text-indigo-700">{t('see_all.connections')}</button>
            </div>
          </aside>

          {/* MAIN FEED */}
          <main className="lg:col-span-2 space-y-6">
            {/* Composer */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex gap-3">
                <img src="https://i.pravatar.cc/150?img=11" alt={t('aria.user')} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-grow">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={t('composer.placeholder')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-3">
                <div className="flex gap-2 flex-wrap">
                  {[
                    { i18n: 'article', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { i18n: 'image',   d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                    { i18n: 'poll',    d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                    { i18n: 'video',   d: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                    { i18n: 'event',   d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  ].map(btn => (
                    <button key={btn.i18n} className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-[15px] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={btn.d} />
                      </svg>
                      {t(`composer.${btn.i18n}`)}
                    </button>
                  ))}
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-[15px] font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                  {t('composer.submit')}
                </button>
              </div>
            </div>

            {/* Feed Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 flex items-center justify-between">
              <div className="flex gap-1">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                      activeTab === tab ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t(`tabs.${tab}`)}
                  </button>
                ))}
              </div>
              <select className="text-[15px] border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:ring-2 focus:ring-indigo-500">
                <option>{t('sort.recent')}</option>
                <option>{t('sort.popular')}</option>
                <option>{t('sort.relevant')}</option>
              </select>
            </div>

            {/* Feed Posts */}
            <div className="space-y-4">
              {feedPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  {/* Post Header */}
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex gap-3">
                      <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-[15px]">{post.author.name}</p>
                          {post.author.isGroup && (
                            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{post.author.handle}</span>
                          <span>•</span>
                          <span>{post.author.time}</span>
                        </div>
                        {post.author.affiliation && (
                          <p className="text-sm text-gray-500 mt-0.5">{post.author.affiliation}</p>
                        )}
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-3">
                    <p className="text-[15px] text-gray-800 whitespace-pre-line">{post.content}</p>
                  </div>

                  {/* Article Preview */}
                  {post.type === 'article' && post.article && (
                    <div className="mx-4 mb-3 border border-gray-200 rounded-xl overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer">
                      <img src={post.article.image} alt={post.article.title} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 text-[15px] mb-1">{post.article.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">{post.article.journal}</p>
                        <p className="text-sm text-gray-500 mb-3">{post.article.vol}</p>
                        <div className="flex gap-2">
                          {post.article.sdgs.map(sdg => (
                            <span key={sdg} className={`px-2 py-1 rounded text-sm font-bold ${getSDGColor(sdg)}`}>SDG {sdg}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Preview */}
                  {post.type === 'file' && post.file && (
                    <div className="mx-4 mb-3 border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">{post.file.icon}</div>
                      <div>
                        <p className="text-[15px] font-semibold text-gray-900">{post.file.name}</p>
                        <p className="text-sm text-gray-500">{post.file.size}</p>
                      </div>
                    </div>
                  )}

                  {/* Images Grid */}
                  {post.type === 'images' && post.images && (
                    <div className="mx-4 mb-3 grid grid-cols-2 gap-2">
                      {post.images.map((img, idx) => (
                        <img key={idx} src={img} alt="" className={`w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${post.images.length === 3 && idx === 0 ? 'row-span-2 h-full' : ''}`} />
                      ))}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 text-[15px] transition-colors ${likedPosts.has(post.id) ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`}
                      >
                        <svg className="w-5 h-5" fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                      </button>
                      <button className="flex items-center gap-2 text-[15px] text-gray-600 hover:text-indigo-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.comments}
                      </button>
                      <button className="flex items-center gap-2 text-[15px] text-gray-600 hover:text-green-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        {post.shares}
                      </button>
                    </div>
                    <button
                      onClick={() => toggleSave(post.id)}
                      className={`text-gray-400 hover:text-indigo-600 transition-colors ${savedPosts.has(post.id) ? 'text-indigo-600' : ''}`}
                    >
                      <svg className="w-5 h-5" fill={savedPosts.has(post.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center py-4">
              <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-[15px] font-medium hover:bg-gray-50 transition-colors shadow-sm">
                {t('load_more')}
              </button>
            </div>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-900 text-[15px] mb-4 uppercase tracking-wider">{t('sections.activities')}</h3>
              <div className="space-y-4">
                {RECENT_ACTIVITIES.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <img src={`https://i.pravatar.cc/150?img=${30 + idx}`} alt={activity.name} className="w-8 h-8 rounded-full object-cover mt-0.5" />
                    <div>
                      <p className="text-[15px]">
                        <span className="font-semibold text-gray-900">{activity.name}</span>{' '}
                        <span className="text-gray-600">{activity.action}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{activity.time}</p>
                    </div>
                    <span className="ml-auto text-lg">{activity.icon}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-[15px] text-indigo-600 font-medium hover:text-indigo-700">{t('see_all.activities')}</button>
            </div>

            {/* Invitations */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-900 text-[15px] mb-4 uppercase tracking-wider">{t('sections.invitations')}</h3>
              <div className="space-y-4">
                {INVITATIONS.map((inv, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-lg">{inv.logo}</div>
                    <div className="flex-grow">
                      <p className="text-[15px]">
                        <span className="font-semibold text-gray-900">{inv.name}</span>{' '}
                        <span className="text-gray-600">{inv.action}</span>
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">{t('invite.reject')}</button>
                        <button className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">{t('invite.accept')}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-[15px] text-indigo-600 font-medium hover:text-indigo-700">{t('see_all.invitations')}</button>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-900 text-[15px] mb-4 uppercase tracking-wider">{t('sections.events')}</h3>
              <div className="space-y-4">
                {EVENTS.map((event, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-lg font-bold text-indigo-600 leading-none">{event.day}</span>
                      <span className="text-xs font-bold text-indigo-600 uppercase">{event.month}</span>
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{event.time}</p>
                      <p className="text-sm text-gray-500">{event.location}</p>
                      <button className="mt-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">{t('event_register')}</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-[15px] text-indigo-600 font-medium hover:text-indigo-700">{t('see_all.events')}</button>
            </div>

            {/* Who's Active */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-900 text-[15px] mb-4 uppercase tracking-wider">{t('sections.active')}</h3>
              <div className="space-y-3">
                {ACTIVE_USERS.map((user, idx) => (
                  <Link key={idx} to={`/profile/${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="relative">
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user.status === 'online' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{user.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button className="w-full mt-4 text-[15px] text-indigo-600 font-medium hover:text-indigo-700">{t('see_all.users')}</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Feeds;