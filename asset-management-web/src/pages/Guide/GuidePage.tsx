import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Search, ArrowLeft, ChevronRight, CheckCircle2,
  AlertCircle, Info, Lightbulb, Users, Database,
  ScrollText, FolderOpen, Monitor, Handshake, Wrench,
  QrCode, HelpCircle, LayoutDashboard, Menu, X,
  ShieldCheck, UserCheck, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggleButton } from '../../components/common/ThemeToggleButton';
import {
  GUIDE_TOPICS,
  ROLE_METADATA,
  type GuideTopic,
  type RoleGuideMeta
} from '../../data/userGuidesData';

export const GuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { roles, user } = useAuth();

  // Deteksi peran otomatis pengguna saat ini (Super User, Admin, atau Staff)
  const currentRole = useMemo<'superuser' | 'admin' | 'staff'>(() => {
    if (roles.includes('superuser')) return 'superuser';
    if (roles.includes('admin')) return 'admin';
    return 'staff';
  }, [roles]);

  // Search keyword state
  const [searchKeyword, setSearchKeyword] = useState('');

  // Mobile sidebar open state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Active topic selection
  const initialTopicParam = searchParams.get('topic');
  const [activeTopicId, setActiveTopicId] = useState<string>(
    initialTopicParam || 'overview-system'
  );

  // Sinkronisasi URL query params saat topik berubah
  const handleSelectTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setSearchParams({ topic: topicId });
    setIsMobileDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper render ikon dinamis
  const renderTopicIcon = (iconName: string, size = 16) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard size={size} />;
      case 'Users': return <Users size={size} />;
      case 'Database': return <Database size={size} />;
      case 'ScrollText': return <ScrollText size={size} />;
      case 'FolderOpen': return <FolderOpen size={size} />;
      case 'Monitor': return <Monitor size={size} />;
      case 'Handshake': return <Handshake size={size} />;
      case 'Wrench': return <Wrench size={size} />;
      case 'QrCode': return <QrCode size={size} />;
      case 'HelpCircle': return <HelpCircle size={size} />;
      default: return <BookOpen size={size} />;
    }
  };

  // Filter topik otomatis berdasarkan peran aktif pengguna dan kata kunci pencarian
  const filteredTopics = useMemo(() => {
    return GUIDE_TOPICS.filter((topic) => {
      const matchesRole = topic.targetRole === 'all' || topic.targetRole === currentRole;
      if (!matchesRole) return false;

      if (!searchKeyword.trim()) return true;
      const q = searchKeyword.toLowerCase();
      const inTitle = topic.title.toLowerCase().includes(q);
      const inDesc = topic.shortDesc.toLowerCase().includes(q);
      const inKeywords = topic.keywords.some((k) => k.toLowerCase().includes(q));
      const inSteps = topic.steps.some(
        (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );

      return inTitle || inDesc || inKeywords || inSteps;
    });
  }, [currentRole, searchKeyword]);

  // Kelompokkan topik berdasarkan kategori
  const groupedTopics = useMemo(() => {
    const groups: Record<string, GuideTopic[]> = {};
    filteredTopics.forEach((topic) => {
      if (!groups[topic.category]) {
        groups[topic.category] = [];
      }
      groups[topic.category].push(topic);
    });
    return groups;
  }, [filteredTopics]);

  // Cari topik aktif saat ini
  const activeTopic = useMemo(() => {
    const found = GUIDE_TOPICS.find((t) => t.id === activeTopicId);
    return found || GUIDE_TOPICS[0];
  }, [activeTopicId]);

  useEffect(() => {
    if (filteredTopics.length > 0 && !filteredTopics.some((t) => t.id === activeTopicId)) {
      setActiveTopicId(filteredTopics[0].id);
    }
  }, [filteredTopics, activeTopicId]);

  const currentTopicIndex = filteredTopics.findIndex((t) => t.id === activeTopic.id);
  const prevTopic = currentTopicIndex > 0 ? filteredTopics[currentTopicIndex - 1] : null;
  const nextTopic = currentTopicIndex < filteredTopics.length - 1 ? filteredTopics[currentTopicIndex + 1] : null;

  const currentRoleMeta: RoleGuideMeta = ROLE_METADATA[currentRole];

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden font-sans text-slate-800 bg-[#FAF7F2] dark:bg-[#111822] dark:text-slate-100">
      
      {/* 1. HEADER DOKUMENTASI & PANDUAN APLIKASI */}
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#E6E1D6] bg-white/90 px-4 dark:border-slate-800 dark:bg-[#1A2433]/90 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="cursor-pointer rounded-xl p-2 text-slate-500 hover:bg-[#FAF7F2] dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            title="Buka Navigasi Panduan"
          >
            <Menu size={20} />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E6E1D6] bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-[#FAF7F2] hover:text-[#1E3A5F] dark:border-slate-700 dark:bg-[#111822] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ArrowLeft size={14} className="text-[#1E3A5F] dark:text-[#F4B752]" />
            <span>Kembali ke Dashboard</span>
          </button>

          <div className="hidden md:flex items-center gap-2.5 border-l border-[#E6E1D6] pl-3 dark:border-slate-800">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E3A5F] font-mono text-[11px] font-bold text-[#FAF7F2] shadow-xs">
              AM
            </div>
            <span className="text-xs font-bold tracking-tight text-[#2B4C6F] dark:text-[#FAF7F2]">
              Buku Panduan Operasional Program
            </span>
          </div>
        </div>

        {/* Header Kanan: Status User & Tema */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Pengguna Aktif:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'User'}</span>
            <span className="rounded-md border border-[#E6E1D6] bg-[#FAF7F2] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
              {currentRole}
            </span>
          </div>
          <ThemeToggleButton />
        </div>
      </header>

      {/* 2. AREA UTAMA */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Overlay Mobile Drawer */}
        {isMobileDrawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
        )}

        {/* SIDEBAR PANDUAN MANDIRI */}
        <aside
          className={`fixed inset-y-16 left-0 z-50 flex w-76 flex-col border-r border-[#E6E1D6] bg-white dark:border-slate-800 dark:bg-[#1A2433] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header Sidebar Panduan: Informasi Peran Otomatis */}
          <div className="border-b border-[#E6E1D6] p-4 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Panduan Peran Anda:
              </span>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 lg:hidden"
              >
                <X size={16} />
              </button>
            </div>

            {/* Kartu Status Peran Terdeteksi Otomatis */}
            <div className="flex items-center gap-3 rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/70 p-3 dark:border-slate-800 dark:bg-[#111822]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs dark:bg-slate-800">
                {currentRole === 'superuser' && <ShieldAlert size={18} className="text-purple-600 dark:text-purple-400" />}
                {currentRole === 'admin' && <ShieldCheck size={18} className="text-[#1E3A5F] dark:text-[#F4B752]" />}
                {currentRole === 'staff' && <UserCheck size={18} className="text-emerald-600 dark:text-emerald-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Otorisasi Aktif
                  </span>
                  <span className={`rounded-full border px-2 py-0.2 text-[9px] font-bold ${currentRoleMeta.badgeColor}`}>
                    {currentRoleMeta.badgeName}
                  </span>
                </div>
                <div className="truncate text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {currentRoleMeta.title}
                </div>
              </div>
            </div>

            {/* Kotak Pencarian Topik */}
            <div className="relative mt-3">
              <Search size={14} className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Cari kata kunci panduan..."
                className="w-full rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/70 py-2 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 dark:border-slate-800 dark:bg-[#111822] dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-[#F4B752]"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Daftar Isi Topik Panduan */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {Object.keys(groupedTopics).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                Tidak ada panduan yang cocok dengan pencarian &quot;{searchKeyword}&quot;.
              </div>
            ) : (
              Object.entries(groupedTopics).map(([category, topics]) => (
                <div key={category}>
                  <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {category}
                  </div>
                  <ul className="space-y-1">
                    {topics.map((topic) => {
                      const isActive = topic.id === activeTopic.id;
                      return (
                        <li key={topic.id}>
                          <button
                            onClick={() => handleSelectTopic(topic.id)}
                            className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                              isActive
                                ? 'bg-[#1E3A5F] font-semibold text-[#FAF7F2] shadow-xs'
                                : 'text-slate-600 hover:bg-[#FAF7F2] hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <span className={isActive ? 'text-[#F4B752]' : 'text-slate-400 dark:text-slate-500'}>
                                {renderTopicIcon(topic.iconName, 15)}
                              </span>
                              <span className="truncate">{topic.title}</span>
                            </div>
                            {topic.badge && (
                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                  isActive
                                    ? 'bg-[#F4B752] text-slate-900'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {topic.badge}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* Footer Sidebar */}
          <div className="border-t border-[#E6E1D6] p-3.5 dark:border-slate-800">
            <div className="rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/70 p-3 dark:border-slate-800 dark:bg-[#111822]">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Dokumentasi Resmi v1.0</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Dioptimalkan untuk alur kerja operasional perusahaan dan audit siap pakai.
              </p>
            </div>
          </div>
        </aside>

        {/* AREA BACA ARTIKEL PANDUAN */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">

            {/* KARTU RINGKASAN PERAN AKTIF */}
            {currentRoleMeta && (
              <div className="rounded-2xl border border-[#E6E1D6] bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#1A2433]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E6E1D6] pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FAF7F2] dark:bg-[#111822] border border-[#E6E1D6] dark:border-slate-800">
                      {currentRole === 'superuser' && <ShieldAlert className="text-purple-600 dark:text-purple-400" size={24} />}
                      {currentRole === 'admin' && <ShieldCheck className="text-[#1E3A5F] dark:text-[#F4B752]" size={24} />}
                      {currentRole === 'staff' && <UserCheck className="text-emerald-600 dark:text-emerald-400" size={24} />}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#2B4C6F] dark:text-[#FAF7F2]">
                        Panduan Operasional: {currentRoleMeta.title}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {currentRoleMeta.description}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-block w-fit rounded-full border px-3 py-1 text-[10px] font-bold ${currentRoleMeta.badgeColor}`}>
                    {currentRoleMeta.badgeName}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Tanggung Jawab Utama Peran:
                  </div>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs text-slate-600 dark:text-slate-300">
                    {currentRoleMeta.responsibilities.map((resp: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-600" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ARTIKEL BENTO MODULE */}
            <article className="rounded-2xl border border-[#E6E1D6] bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-[#1A2433]">
              <div className="border-b border-[#E6E1D6] pb-5 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-md bg-[#FAF7F2] border border-[#E6E1D6] px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                    {activeTopic.category}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Target: <strong className="uppercase">{activeTopic.targetRole}</strong>
                  </span>
                </div>

                <h1 className="text-xl font-bold tracking-tight text-[#2B4C6F] dark:text-[#FAF7F2] sm:text-2xl">
                  {activeTopic.title}
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeTopic.summary}
                </p>
              </div>

              {/* DIAGRAM WORKFLOW ALUR KERJA */}
              {activeTopic.workflow && (
                <div className="my-6 rounded-xl border border-[#E6E1D6] bg-[#FAF7F2]/60 p-4 dark:border-slate-800 dark:bg-[#111822]">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#2B4C6F] dark:text-[#FAF7F2]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#1E3A5F] text-[10px] font-bold text-[#FAF7F2]">
                      →
                    </span>
                    <span>{activeTopic.workflow.title}</span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5 overflow-x-auto pb-1">
                    {activeTopic.workflow.nodes.map((node, idx) => (
                      <React.Fragment key={idx}>
                        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-[#E6E1D6] bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FAF7F2] text-[10px] font-mono text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {idx + 1}
                          </span>
                          <span>{node}</span>
                        </div>
                        {idx < (activeTopic.workflow?.nodes.length ?? 0) - 1 && (
                          <div className="hidden sm:flex text-slate-300 dark:text-slate-600">
                            <ChevronRight size={16} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* DAFTAR LANGKAH-LANGKAH PANDUAN */}
              <div className="my-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Langkah-Langkah Pelaksanaan:
                </h3>

                <div className="space-y-3">
                  {activeTopic.steps.map((st) => (
                    <div
                      key={st.step}
                      className="group flex gap-3.5 rounded-xl border border-[#E6E1D6] bg-white p-4 transition-colors hover:border-[#1E3A5F]/40 dark:border-slate-800 dark:bg-[#151D2A] dark:hover:border-slate-700"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1E3A5F] font-mono text-xs font-bold text-[#FAF7F2] shadow-2xs">
                        {st.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-[#2B4C6F] dark:text-[#FAF7F2]">
                            {st.title}
                          </h4>
                          {st.badge && (
                            <span className="rounded-md bg-[#FAF7F2] border border-[#E6E1D6] px-2 py-0.5 font-mono text-[9px] font-semibold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                              {st.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {st.description}
                        </p>
                        {st.detail && (
                          <div className="mt-2.5 rounded-lg border-l-2 border-[#1E3A5F] bg-[#FAF7F2] p-2.5 text-[11px] text-slate-600 dark:border-[#F4B752] dark:bg-[#111822] dark:text-slate-400">
                            💡 <strong>Catatan Teknis:</strong> {st.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KOTAK CALLOUT */}
              {activeTopic.callouts && activeTopic.callouts.length > 0 && (
                <div className="my-6 space-y-3">
                  {activeTopic.callouts.map((c, i) => {
                    if (c.type === 'warning') {
                      return (
                        <div key={i} className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                          <AlertCircle size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div>
                            <span className="font-bold">{c.title}:</span> {c.message}
                          </div>
                        </div>
                      );
                    }
                    if (c.type === 'tip') {
                      return (
                        <div key={i} className="flex gap-3 rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                          <Lightbulb size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                          <div>
                            <span className="font-bold">{c.title}:</span> {c.message}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={i} className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
                        <Info size={18} className="shrink-0 text-[#1E3A5F] dark:text-[#F4B752] mt-0.5" />
                        <div>
                          <span className="font-bold">{c.title}:</span> {c.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TOPIK TERKAIT */}
              {activeTopic.relatedTopicIds && activeTopic.relatedTopicIds.length > 0 && (
                <div className="mt-8 border-t border-[#E6E1D6] pt-5 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
                    Topik Terkait Lainnya:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeTopic.relatedTopicIds.map((rId) => {
                      const rel = GUIDE_TOPICS.find((t) => t.id === rId);
                      if (!rel) return null;
                      return (
                        <button
                          key={rId}
                          onClick={() => handleSelectTopic(rId)}
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-white dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          {renderTopicIcon(rel.iconName, 13)}
                          <span>{rel.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NAVIGASI PREV / NEXT TOPIC */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E6E1D6] pt-6 dark:border-slate-800">
                {prevTopic ? (
                  <button
                    onClick={() => handleSelectTopic(prevTopic.id)}
                    className="flex w-full sm:w-auto cursor-pointer items-center gap-2 rounded-xl border border-[#E6E1D6] bg-white px-4 py-2.5 text-left text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-[#FAF7F2] dark:border-slate-800 dark:bg-[#111822] dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft size={14} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Topik Sebelumnya</div>
                      <div className="font-bold text-[#2B4C6F] dark:text-[#FAF7F2] truncate max-w-[180px]">
                        {prevTopic.title}
                      </div>
                    </div>
                  </button>
                ) : <div />}

                {nextTopic && (
                  <button
                    onClick={() => handleSelectTopic(nextTopic.id)}
                    className="flex w-full sm:w-auto cursor-pointer items-center justify-end gap-2 rounded-xl border border-[#E6E1D6] bg-white px-4 py-2.5 text-right text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-[#FAF7F2] dark:border-slate-800 dark:bg-[#111822] dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Topik Selanjutnya</div>
                      <div className="font-bold text-[#2B4C6F] dark:text-[#FAF7F2] truncate max-w-[180px]">
                        {nextTopic.title}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[#1E3A5F] dark:text-[#F4B752]" />
                  </button>
                )}
              </div>
            </article>

          </div>
        </main>
      </div>
    </div>
  );
};

export default GuidePage;
