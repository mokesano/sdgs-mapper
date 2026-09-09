import React, { useState, useRef, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useTranslation } from 'react-i18next';

/*
 * Basis pengetahuan, sapaan, dan seluruh teks antarmuka chatbot hidup di
 * berkas locale — bukan di sini. Yang dipindah bukan cuma labelnya: kata
 * kunci pencarian ikut pindah, sebab kata kunci berbahasa Indonesia tidak
 * akan pernah cocok dengan pertanyaan berbahasa Inggris. Fuse diindeks ulang
 * setiap basis pengetahuannya berganti bahasa.
 */

const TypingIndicator = () => (
  <div className="flex items-end gap-2">
    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>
    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

const Chatbot = () => {
  const { t } = useTranslation('chatbot');

  const asList = (key) => {
    const v = t(key, { returnObjects: true });
    return Array.isArray(v) ? v : [];
  };

  const knowledgeBase = useMemo(() => asList('kb'), [t]);
  const faqLinks      = useMemo(() => asList('quick'), [t]);

  const [isOpen, setIsOpen]       = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [helpSearch, setHelpSearch] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const fuse = useMemo(() => new Fuse(knowledgeBase, {
    keys: ['q'],
    threshold: 0.45,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  }), [knowledgeBase]);

  const helpResults = useMemo(() => {
    if (!helpSearch.trim()) return knowledgeBase.slice(0, 8);
    return fuse.search(helpSearch).slice(0, 8).map(r => r.item);
  }, [helpSearch, fuse, knowledgeBase]);

  const getResponse = (text) => {
    const results = fuse.search(text.toLowerCase().trim());
    if (results.length > 0 && results[0].score < 0.5) return results[0].item.a;

    /* Ucapan terima kasih dan sapaan dikenali dari daftar kata di locale,
       bukan dari kata Indonesia yang ditulis tetap di sini — kalau tidak,
       "thanks" tidak akan pernah terdeteksi saat antarmuka berbahasa
       Inggris. */
    const lower = text.toLowerCase();
    const hits = (key) => asList(`trigger.${key}`).some(w => lower.includes(String(w).toLowerCase()));
    if (hits('thanks')) return t('reply.thanks');
    if (hits('hello'))  return t('reply.hello');
    return t('reply.fallback');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* Sapaan pembuka menyesuaikan bahasa yang aktif. Selama percakapannya
     masih kosong, mengganti bahasa mengganti sapaannya juga; begitu pengguna
     mulai menulis, riwayatnya dibiarkan apa adanya. */
  useEffect(() => {
    setMessages(prev => (prev.length > 1 ? prev : [{ id: 1, from: 'bot', text: t('greeting') }]));
  }, [t]);

  useEffect(() => {
    if (isOpen && activeTab === 'messages') inputRef.current?.focus();
  }, [isOpen, activeTab]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'bot', text: getResponse(trimmed) }]);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const TAB_ICONS = {
    home: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <mask id="f2fda" fill="none">
        <path fillRule="evenodd" d="M10.5 2.335 3 7.51c-.625.437-1 1.116-1 1.84V19.7C2 20.965 3.125 22 4.5 22h15c1.375 0 2.5-1.035 2.5-2.3V9.35c0-.724-.375-1.403-1-1.84l-7.5-5.175a2.69 2.69 0 0 0-3 0M7.316 14.366a.85.85 0 1 0-1.132 1.268A8.7 8.7 0 0 0 12 17.852a8.7 8.7 0 0 0 5.816-2.218.85.85 0 1 0-1.132-1.268A7 7 0 0 1 12 16.152c-1.8 0-3.44-.675-4.684-1.786" clipRule="evenodd"></path></mask><path fill="currentColor" fillRule="evenodd" d="M10.5 2.335 3 7.51c-.625.437-1 1.116-1 1.84V19.7C2 20.965 3.125 22 4.5 22h15c1.375 0 2.5-1.035 2.5-2.3V9.35c0-.724-.375-1.403-1-1.84l-7.5-5.175a2.69 2.69 0 0 0-3 0M7.316 14.366a.85.85 0 1 0-1.132 1.268A8.7 8.7 0 0 0 12 17.852a8.7 8.7 0 0 0 5.816-2.218.85.85 0 1 0-1.132-1.268A7 7 0 0 1 12 16.152c-1.8 0-3.44-.675-4.684-1.786" clipRule="evenodd"></path><path fill="currentColor" d="m3 7.51-.965-1.4-.01.007zm7.5-5.175L9.538.934l-.003.002zM21 7.51l.974-1.393-.009-.006zm-7.5-5.175.966-1.4-.004-.001zM6.116 14.434l1.268 1.132zm1.2-.068 1.133-1.268zm-1.132 1.268L5.05 16.902zm11.632 0 1.133 1.268zm.068-1.2-1.268 1.132zm-1.2-.068-1.133-1.268zM3.965 8.91l7.5-5.175L9.536.936l-7.5 5.175zm-.265.44c0-.12.063-.299.274-.447L2.026 6.117C.987 6.843.3 8.022.3 9.35zm0 10.35V9.35H.3V19.7zm.8.6a.9.9 0 0 1-.615-.227.5.5 0 0 1-.185-.373H.3c0 2.335 2.022 4 4.2 4zm15 0h-15v3.4h15zm.8-.6a.5.5 0 0 1-.185.373.9.9 0 0 1-.615.227v3.4c2.178 0 4.2-1.665 4.2-4zm0-10.35V19.7h3.4V9.35zm-.274-.447c.211.148.274.326.274.447h3.4c0-1.328-.687-2.507-1.726-3.233zm-7.491-5.169 7.5 5.175 1.93-2.798-7.5-5.175zm-1.073.002a.99.99 0 0 1 1.076 0L14.462.934a4.39 4.39 0 0 0-4.924 0zm-4.078 11.83a.85.85 0 0 1-1.2.068l2.265-2.536a2.55 2.55 0 0 0-3.6.203zm-.068-1.2c.35.313.38.85.068 1.2l-2.536-2.265a2.55 2.55 0 0 0 .203 3.6zM12 16.152c-1.8 0-3.44-.675-4.684-1.786l-2.265 2.536A10.4 10.4 0 0 0 12 19.552zm4.684-1.786A7 7 0 0 1 12 16.152v3.4c2.667 0 5.105-1.004 6.949-2.65zm-.068 1.2a.85.85 0 0 1 .068-1.2l2.265 2.536a2.55 2.55 0 0 0 .203-3.6zm1.2.068a.85.85 0 0 1-1.2-.068l2.536-2.265a2.55 2.55 0 0 0-3.6-.203zM12 17.852a8.7 8.7 0 0 0 5.816-2.218l-2.265-2.536A5.3 5.3 0 0 1 12 14.452zm-5.816-2.218A8.7 8.7 0 0 0 12 17.852v-3.4a5.3 5.3 0 0 1-3.551-1.354z" mask="url(#f2fda)"></path>
      </svg>
    ),
    messages: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <mask id="1965a" fill="#fff">
        <path fillRule="evenodd" d="M19 2a3 3 0 0 1 3 3v15.806c0 1.335-1.613 2.005-2.559 1.062L15.56 18H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z" clipRule="evenodd"></path></mask><path fill="currentColor" d="m19.441 21.868 1.2-1.204zM15.56 18v-1.7h.702l.498.496zM20.3 5A1.3 1.3 0 0 0 19 3.7V.3A4.7 4.7 0 0 1 23.7 5zm0 8.956V5h3.4v8.956zm0 2.544v-2.544h3.4V16.5zm0 4.306V16.5h3.4v4.306zm.341-.142a.23.23 0 0 0-.218-.043.23.23 0 0 0-.123.185h3.4c0 2.848-3.441 4.277-5.459 2.267zm-3.882-3.868 3.882 3.868-2.4 2.409-3.882-3.869zM5 16.3h10.559v3.4H5zM3.7 15A1.3 1.3 0 0 0 5 16.3v3.4A4.7 4.7 0 0 1 .3 15zm0-10v10H.3V5zM5 3.7A1.3 1.3 0 0 0 3.7 5H.3A4.7 4.7 0 0 1 5 .3zm14 0H5V.3h14z" className="ed6a78d3fill" mask="url(#1965a)"></path><path fill="currentColor" fillRule="evenodd" d="M17 7a.85.85 0 0 1 0 1.7H7A.85.85 0 1 1 7 7zm-5 4a.85.85 0 0 1 0 1.7H7A.85.85 0 0 1 7 11z" className="ed6a78d3fill" clipRule="evenodd"></path>
      </svg>
    ),
    help: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9.65" stroke="currentColor" strokeWidth="1.7" className="80f8f27estroke d4cca62acircle"></circle>
        <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" d="M9.664 8.576a2.41 2.41 0 1 1 4.102 2.39l-1.075 1.104c-.326.322-.765.76-.765 1.544v.364" className="80f8f27estroke db816c32negative"></path><circle cx="11.927" cy="16.884" r="0.884" fill="currentColor" className="f75e1256fill db816c32negative"></circle>
      </svg>
    ),
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-label={isOpen ? t('ui.close_bot') : t('ui.open')}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" viewBox="0 0 28 32" fill="currentColor" stroke="none">
            <path stroke="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M28 32s-4.714-1.855-8.527-3.34H3.437C1.54 28.66 0 27.026 0 25.013V3.644C0 1.633 1.54 0 3.437 0h21.125c1.898 0 3.437 1.632 3.437 3.645v18.404H28V32zm-4.139-11.982a.88.88 0 00-1.292-.105c-.03.026-3.015 2.681-8.57 2.681-5.486 0-8.517-2.636-8.571-2.684a.88.88 0 00-1.29.107 1.01 1.01 0 00-.219.708.992.992 0 00.318.664c.142.128 3.537 3.15 9.762 3.15 6.226 0 9.621-3.022 9.763-3.15a.992.992 0 00.317-.664 1.01 1.01 0 00-.218-.707z"></path>
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-white"
          style={{ width: '400px', height: '680px', maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* ── HOME TAB ────────────────────────────────────────── */}
          {activeTab === 'home' && (
            <>
              {/* Dark hero header */}
              <div className="bg-[#1e1b4b] px-6 pt-6 pb-10 shrink-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                    <span className="text-white font-bold text-base">{t('ui.brand')}</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label={t('ui.close')}
                    className="text-indigo-300 hover:text-white transition-colors text-xl leading-none"
                  >
                    <svg fill="currentColor" viewBox="0 0 16 16" className="h-3 w-3">
                        <path d="M0 14.545L1.455 16 8 9.455 14.545 16 16 14.545 9.455 8 16 1.455 14.545 0 8 6.545 1.455 0 0 1.455 6.545 8z" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" stroke="none"></path>
                    </svg>
                  </button>
                </div>
                <h2 className="text-white text-2xl font-bold leading-snug">{t('ui.home_title')}</h2>
                <h3 className="text-white text-lg font-bold leading-snug">{t('ui.home_sub')}</h3>
              </div>

              {/* Cards area — overlaps header slightly */}
              <div className="flex-1 overflow-y-auto bg-gray-50 px-4 space-y-3" style={{ marginTop: '-1.5rem', paddingTop: '1rem' }}>
                {/* Status card */}
                <div className="bg-white rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-gray-900">{t('ui.status')}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Send message CTA */}
                <button
                  onClick={() => setActiveTab('messages')}
                  className="bg-white rounded-xl px-4 py-3.5 flex items-center justify-between w-full shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all group text-left"
                >
                  <div>
                    <p className="text-[15px] font-semibold text-gray-900">{t('ui.send_title')}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{t('ui.send_sub')}</p>
                  </div>
                  <svg className="w-5 h-5 text-indigo-500 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('ui.search_help')}
                    value={helpSearch}
                    onChange={e => setHelpSearch(e.target.value)}
                    onFocus={() => setActiveTab('help')}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-[15px] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-sm"
                  />
                  <svg className="w-4 h-4 text-indigo-400 absolute right-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Quick FAQ links */}
                <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-100">
                  {faqLinks.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab('help')}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <span className="text-[15px] text-gray-700 group-hover:text-gray-900">{item}</span>
                      <svg className="w-4 h-4 text-indigo-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>

                <div className="pb-4" />
              </div>
            </>
          )}

          {/* ── MESSAGES TAB ─────────────────────────────────────── */}
          {activeTab === 'messages' && (
            <>
              <div className="bg-[#1e1b4b] px-4 py-3.5 flex items-center gap-3 shrink-0">
                <button onClick={() => setActiveTab('home')} className="text-indigo-300 hover:text-white transition-colors mr-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-[15px] leading-none">{t('ui.assistant')}</p>
                  <p className="text-indigo-300 text-sm mt-0.5">{t('ui.assistant_sub')}</p>
                </div>
                <button onClick={() => setIsOpen(false)} aria-label={t('ui.close')} className="text-indigo-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-white px-4 py-4 flex flex-col gap-3">
                {messages.map(msg =>
                  msg.from === 'bot' ? (
                    <div key={msg.id} className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="max-w-[78%] bg-gray-100 text-gray-800 text-[15px] rounded-2xl rounded-bl-sm px-4 py-3 leading-relaxed">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex items-end gap-2 justify-end">
                      <div className="max-w-[78%] bg-indigo-600 text-white text-[15px] rounded-2xl rounded-br-sm px-4 py-3 leading-relaxed">
                        {msg.text}
                      </div>
                    </div>
                  )
                )}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-white border-t border-gray-100 px-3 py-3 flex items-center gap-2 shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('ui.type_message')}
                  className="flex-1 text-[15px] bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400 text-gray-800"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  aria-label={t('ui.send')}
                  className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* ── HELP TAB ─────────────────────────────────────────── */}
          {activeTab === 'help' && (
            <>
              <div className="bg-[#1e1b4b] px-4 py-3.5 flex items-center gap-3 shrink-0">
                <div className="flex-1">
                  <p className="text-white font-semibold text-[15px]">{t('ui.help_center')}</p>
                  <p className="text-indigo-300 text-sm mt-0.5">{t('ui.help_sub')}</p>
                </div>
                <button onClick={() => setIsOpen(false)} aria-label={t('ui.close')} className="text-indigo-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-4 pt-4 pb-2 bg-white border-b border-gray-100 shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('ui.search_help')}
                    value={helpSearch}
                    onChange={e => setHelpSearch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-[15px] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    autoFocus
                  />
                  <svg className="w-4 h-4 text-indigo-400 absolute right-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white divide-y divide-gray-100">
                {helpResults.length === 0 ? (
                  <p className="text-[15px] text-gray-400 text-center py-10">Tidak ada hasil untuk "{helpSearch}"</p>
                ) : (
                  helpResults.map((item, idx) => (
                    <details key={idx} className="group px-4 py-3.5 cursor-pointer">
                      <summary className="flex items-center justify-between list-none gap-2">
                        <span className="text-[15px] text-gray-800 font-medium group-open:text-indigo-700 leading-snug">
                          {item.q.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').substring(0, 60)}
                        </span>
                        <svg className="w-4 h-4 text-indigo-400 shrink-0 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </summary>
                      <p className="text-[15px] text-gray-600 mt-2 leading-relaxed">{item.a}</p>
                    </details>
                  ))
                )}
              </div>
            </>
          )}

          {/* ── BOTTOM TAB BAR ───────────────────────────────────── */}
          <div className="bg-white border-t border-gray-200 flex shrink-0">
            {[
              { key: 'home',     label: t('ui.tab_home')     },
              { key: 'messages', label: t('ui.tab_messages') },
              { key: 'help',     label: t('ui.tab_help')     },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-sm font-medium transition-colors ${
                  activeTab === tab.key ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className={activeTab === tab.key ? 'text-indigo-600' : 'text-gray-400'}>
                  {TAB_ICONS[tab.key]}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;