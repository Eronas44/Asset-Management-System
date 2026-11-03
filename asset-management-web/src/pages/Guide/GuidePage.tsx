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
      // Filter Peran Otomatis: hanya tampilkan topik umum ('all') atau topik khusus peran aktif
      const matchesRole = topic.targetRole === 'all' || topic.targetRole === currentRole;
      if (!matchesRole) return false;

      // Filter Pencarian
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

  // Pastikan topik aktif tetap valid jika filteredTopics berubah
  useEffect(() => {
    if (filteredTopics.length > 0 && !filteredTopics.some((t) => t.id === activeTopicId)) {
      setActiveTopicId(filteredTopics[0].id);
    }
  }, [filteredTopics, activeTopicId]);

  // Navigasi Prev/Next topic
  const currentTopicIndex = filteredTopics.findIndex((t) => t.id === activeTopic.id);
  const prevTopic = currentTopicIndex > 0 ? filteredTopics[currentTopicIndex - 1] : null;
  const nextTopic = currentTopicIndex < filteredTopics.length - 1 ? filteredTopics[currentTopicIndex + 1] : null;

  // Metadata peran aktif
  const currentRoleMeta: RoleGuideMeta = ROLE_METADATA[currentRole];

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden font-sans text-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100">
      
      {/* ========================================================================= */}
      {/* 1. HEADER DOKUMENTASI & PANDUAN APLIKASI */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/90 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Tombol menu sidebar untuk mobile */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="cursor-pointer rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            title="Buka Navigasi Panduan"
          >
            <Menu size={20} />
          </button>

          {/* Tombol Kembali ke Dashboard Aplikasi */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Dashboard</span>
          </button>

          <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 font-mono text-[10px] font-bold text-white dark:bg-slate-100 dark:text-slate-950">
              AM
            </div>
            <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
              Buku Panduan Operasional Program
            </span>
          </div>
        </div>

        {/* Header Kanan: Status User & Tema */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Pengguna Aktif:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'User'}</span>
            <span className="rounded border border-slate-200/80 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
              {currentRole}
            </span>
          </div>
          <ThemeToggleButton />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. AREA UTAMA: SIDEBAR PANDUAN & KONTEN DOKUMENTASI */}
      {/* ========================================================================= */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Overlay Mobile Drawer */}
        {isMobileDrawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
        )}

        {/* SIDEBAR PANDUAN MANDIRI (GUIDE SIDEBAR) */}
        <aside
          className={`fixed inset-y-14 left-0 z-50 flex w-72 flex-col border-r border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header Sidebar Panduan: Informasi Peran Otomatis */}
          <div className="border-b border-slate-200/90 p-3.5 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Panduan Peran Anda:
              </span>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              >
                <X size={16} />
              </button>
            </div>

            {/* Kartu Status Peran Terdeteksi Otomatis */}
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white shadow-2xs dark:bg-slate-800">
                {currentRole === 'superuser' && <ShieldAlert size={16} className="text-purple-600 dark:text-purple-400" />}
                {currentRole === 'admin' && <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />}
                {currentRole === 'staff' && <UserCheck size={16} className="text-emerald-600 dark:text-emerald-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Otorisasi Aktif
                  </span>
                  <span className={`rounded-full border px-1.5 py-0.2 text-[9px] font-bold ${currentRoleMeta.badgeColor}`}>
                    {currentRoleMeta.badgeName}
                  </span>
                </div>
                <div className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {currentRoleMeta.title}
                </div>
              </div>
            </div>

            {/* Kotak Pencarian Topik */}
            <div className="relative mt-3">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Cari kata kunci panduan..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-slate-400 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-slate-600"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Daftar Isi Topik Panduan */}
          <div className="flex-1 overflow-y-auto px-2.5 py-3">
            {Object.keys(groupedTopics).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                Tidak ada panduan yang cocok dengan pencarian &quot;{searchKeyword}&quot;.
              </div>
            ) : (
              Object.entries(groupedTopics).map(([category, topics]) => (
                <div key={category} className="mb-4">
                  <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {category}
                  </div>
                  <ul className="space-y-0.5">
                    {topics.map((topic) => {
                      const isActive = topic.id === activeTopic.id;
                      return (
                        <li key={topic.id}>
                          <button
                            onClick={() => handleSelectTopic(topic.id)}
                            className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-all ${
                              isActive
                                ? 'bg-slate-900 font-medium text-white shadow-2xs dark:bg-slate-100 dark:text-slate-950'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className={isActive ? 'text-white dark:text-slate-950' : 'text-slate-400 dark:text-slate-500'}>
                                {renderTopicIcon(topic.iconName, 15)}
                              </span>
                              <span className="truncate">{topic.title}</span>
                            </div>
                            {topic.badge && (
                              <span
                                className={`shrink-0 rounded px-1.5 py-0.2 text-[9px] font-semibold ${
                                  isActive
                                    ? 'bg-slate-800 text-slate-200 dark:bg-slate-200 dark:text-slate-800'
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

          {/* Footer Sidebar Panduan */}
          <div className="border-t border-slate-200/90 p-3 dark:border-slate-800">
            <div className="rounded-md border border-slate-200/70 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Dokumentasi Resmi v1.0</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Dioptimalkan untuk alur kerja operasional perusahaan dan keamanan data.
              </p>
            </div>
          </div>
        </aside>

        {/* AREA BACA ARTIKEL PANDUAN */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">

            {/* KARTU RINGKASAN PERAN AKTIF (ROLE OVERVIEW BANNER) */}
            {currentRoleMeta && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    {currentRole === 'superuser' && <ShieldAlert className="text-purple-600 dark:text-purple-400" size={22} />}
                    {currentRole === 'admin' && <ShieldCheck className="text-blue-600 dark:text-blue-400" size={22} />}
                    {currentRole === 'staff' && <UserCheck className="text-emerald-600 dark:text-emerald-400" size={22} />}
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Panduan Operasional: {currentRoleMeta.title}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {currentRoleMeta.description}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-block w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${currentRoleMeta.badgeColor}`}>
                    {currentRoleMeta.badgeName}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Tanggung Jawab Utama Peran:
                  </div>
                  <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 text-xs text-slate-600 dark:text-slate-300">
                    {currentRoleMeta.responsibilities.map((resp: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-emerald-500" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* HEADER TOPIK ARTIKEL */}
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200/80 pb-5 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {activeTopic.category}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Target: <strong className="uppercase">{activeTopic.targetRole}</strong>
                  </span>
                </div>

                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                  {activeTopic.title}
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeTopic.summary}
                </p>
              </div>

              {/* DIAGRAM WORKFLOW ALUR KERJA (JIKA TERSEDIA) */}
              {activeTopic.workflow && (
                <div className="my-6 rounded-lg border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] font-bold text-white dark:bg-slate-100 dark:text-slate-950">
                      →
                    </span>
                    <span>{activeTopic.workflow.title}</span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5 overflow-x-auto pb-1">
                    {activeTopic.workflow.nodes.map((node, idx) => (
                      <React.Fragment key={idx}>
                        <div className="flex shrink-0 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-mono text-slate-600 dark:bg-slate-700 dark:text-slate-300">
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

              {/* DAFTAR LANGKAH-LANGKAH PANDUAN (STEP-BY-STEP) */}
              <div className="my-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Langkah-Langkah Pelaksanaan:
                </h3>

                <div className="space-y-3">
                  {activeTopic.steps.map((st) => (
                    <div
                      key={st.step}
                      className="group flex gap-3.5 rounded-lg border border-slate-200/70 bg-white p-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 font-mono text-xs font-bold text-white shadow-2xs dark:bg-slate-100 dark:text-slate-950">
                        {st.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {st.title}
                          </h4>
                          {st.badge && (
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {st.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {st.description}
                        </p>
                        {st.detail && (
                          <div className="mt-2 rounded border-l-2 border-slate-300 bg-slate-50 p-2 text-[11px] text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                            💡 <strong>Catatan Teknis:</strong> {st.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KOTAK CALLOUT (INFO / WARNING / TIP) */}
              {activeTopic.callouts && activeTopic.callouts.length > 0 && (
                <div className="my-6 space-y-3">
                  {activeTopic.callouts.map((c, i) => {
                    if (c.type === 'warning') {
                      return (
                        <div key={i} className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                          <AlertCircle size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div>
                            <span className="font-bold">{c.title}:</span> {c.message}
                          </div>
                        </div>
                      );
                    }
                    if (c.type === 'tip') {
                      return (
                        <div key={i} className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                          <Lightbulb size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                          <div>
                            <span className="font-bold">{c.title}:</span> {c.message}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={i} className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
                        <Info size={18} className="shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
                        <div>
                          <span className="font-bold">{c.title}:</span> {c.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TOPIK TERKAIT (RELATED TOPICS) */}
              {activeTopic.relatedTopicIds && activeTopic.relatedTopicIds.length > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
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
                          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 pt-6 dark:border-slate-800">
                {prevTopic ? (
                  <button
                    onClick={() => handleSelectTopic(prevTopic.id)}
                    className="flex w-full sm:w-auto cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-left text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft size={14} />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Topik Sebelumnya</div>
                      <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {prevTopic.title}
                      </div>
                    </div>
                  </button>
                ) : <div />}

                {nextTopic && (
                  <button
                    onClick={() => handleSelectTopic(nextTopic.id)}
                    className="flex w-full sm:w-auto cursor-pointer items-center justify-end gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-right text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Topik Selanjutnya</div>
                      <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {nextTopic.title}
                      </div>
                    </div>
                    <ChevronRight size={14} />
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
