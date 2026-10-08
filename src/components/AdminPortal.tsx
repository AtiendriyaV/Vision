import React, { useState, useMemo, useEffect } from 'react';
import { 
  Lock, 
  Send, 
  Eye, 
  EyeOff,
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  ArrowLeft, 
  Quote, 
  Table, 
  ShieldCheck, 
  Trash2, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { Article } from '@/lib/types';
import { PythonConsole } from './PythonConsole';

interface AdminPortalProps {
  onArticlePublished: (article?: Article) => void;
  onReturnHome: () => void;
  onDeleteArticle?: (slug: string) => void;
  initialArticle?: Article | null;
  isAdmin: boolean;
  onSetAdmin: (val: boolean) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onArticlePublished,
  onReturnHome,
  onDeleteArticle,
  initialArticle,
  isAdmin,
  onSetAdmin,
}) => {
  // Form states - initialized with initialArticle if provided
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [tagsInput, setTagsInput] = useState(
    initialArticle?.tags ? initialArticle.tags.join(', ') : 'Indian Economy, Finance, Macroeconomics'
  );
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || '');
  const [content, setContent] = useState(
    initialArticle?.content || `# Enter Your Research Thesis Title Here

### Executive Summary & Context
Frame the core macroeconomic thesis or valuation question clearly for the reader...

---

## 1. Ground Reality & Capital Allocation Dynamics
Analyze the business fundamentals, corporate governance, balance sheet capacity, and operating margins...

> "Markets are shaped not just by mathematical balance sheets, but by human confidence and the collective decisions of capital allocators."

## 2. Quantitative Sensitivity & Risk Scenarios
Examine cash flow sensitivities, cost of capital assumptions, and downside buffers...

## Key Takeaways
Summarize your variants perceptions and conclusions in three clear points.
`
  );

  const isEditingExisting = Boolean(initialArticle);

  const [activeTab, setActiveTab] = useState<'split' | 'edit' | 'preview'>('split');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
    slug?: string;
  }>({ type: 'idle', message: '' });

  // Password gate states for unauthenticated access
  const [gatePassword, setGatePassword] = useState('');
  const [showGatePassword, setShowGatePassword] = useState(false);
  const [gateError, setGateError] = useState('');
  const [isVerifyingGate, setIsVerifyingGate] = useState(false);
  const [isSyncingMedium, setIsSyncingMedium] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSyncMedium = async () => {
    setIsSyncingMedium(true);
    setSyncStatus(null);
    try {
      const res = await fetch('/api/sync-medium', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`Exported ${data.totalMediumArticles} Medium stories! Total: ${data.totalArticlesCount}`);
        if (onArticlePublished) onArticlePublished();
      } else {
        setSyncStatus(`Sync failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setSyncStatus(`Sync error: ${err.message}`);
    } finally {
      setIsSyncingMedium(false);
      setTimeout(() => setSyncStatus(null), 6000);
    }
  };

  const handleVerifyGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatePassword.trim()) {
      setGateError('Please enter the admin password.');
      return;
    }

    setIsVerifyingGate(true);
    setGateError('');

    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: gatePassword.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('atiendriya_admin_auth', 'Vermakk@1972');
        onSetAdmin(true);
      } else {
        setGateError(data.message || 'Incorrect password. Access denied.');
      }
    } catch {
      if (gatePassword.trim() === 'Vermakk@1972') {
        localStorage.setItem('atiendriya_admin_auth', 'Vermakk@1972');
        onSetAdmin(true);
      } else {
        setGateError('Incorrect password. Access denied.');
      }
    } finally {
      setIsVerifyingGate(false);
    }
  };

  // Word count & read time
  const stats = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return {
      words,
      readTime: `${minutes} min read`,
    };
  }, [content]);

  // Update slug automatically when title changes if it's a new article
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditingExisting && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setPublishResult({ type: 'error', message: 'Article title is required.' });
      return;
    }
    if (!content.trim()) {
      setPublishResult({ type: 'error', message: 'Article content cannot be empty.' });
      return;
    }

    setIsPublishing(true);
    setPublishResult({ type: 'idle', message: '' });

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const cleanSlug =
        slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') ||
        title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: cleanSlug,
          originalSlug: initialArticle?.slug,
          content: content.trim(),
          tags,
          excerpt: excerpt.trim() || content.slice(0, 160).replace(/[#*`_]/g, '') + '...',
          readTime: stats.readTime,
          passcode: 'Vermakk@1972',
          author: 'Atiendriya Verma',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPublishResult({
          type: 'success',
          message: data.message || (isEditingExisting ? 'Article updated successfully!' : 'Article published successfully!'),
          slug: data.slug || cleanSlug,
        });

        if (data.article) {
          onArticlePublished(data.article);
        }
      } else {
        setPublishResult({
          type: 'error',
          message: data.message || 'Failed to save article.',
        });
      }
    } catch (err: any) {
      setPublishResult({
        type: 'error',
        message: err.message || 'Network error encountered during publishing.',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!initialArticle?.slug) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${initialArticle.title}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/articles/${initialArticle.slug}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (onDeleteArticle) {
          onDeleteArticle(initialArticle.slug);
        }
        onReturnHome();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete article.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting article.');
    } finally {
      setIsDeleting(false);
    }
  };

  const insertSnippet = (snippet: string) => {
    setContent((prev) => prev + '\n\n' + snippet);
  };

  // If not admin, require password verification first
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#e7e5e4] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1c1917] text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#1c1917]">
                Admin Authentication
              </h2>
              <p className="text-xs text-[#78716c]">
                Enter administrator password to access editor
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyGate} className="space-y-4">
            {gateError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{gateError}</span>
              </div>
            )}

            <div>
              <label 
                htmlFor="portal-gate-password"
                className="block text-[11px] font-mono uppercase tracking-wider text-[#78716c] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="portal-gate-password"
                  type={showGatePassword ? 'text' : 'password'}
                  value={gatePassword}
                  onChange={(e) => {
                    setGatePassword(e.target.value);
                    if (gateError) setGateError('');
                  }}
                  autoFocus
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 text-sm text-[#1c1917] bg-[#faf9f6] border border-[#d6d3d1] focus:outline-none focus:border-[#1c1917] focus:bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGatePassword(!showGatePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#1c1917] cursor-pointer"
                  title={showGatePassword ? "Hide password" : "Show password"}
                >
                  {showGatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#f5f5f4]">
              <button
                type="button"
                onClick={onReturnHome}
                className="flex items-center gap-1.5 text-xs text-[#78716c] hover:text-[#1c1917] cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Articles</span>
              </button>
              <button
                type="submit"
                disabled={isVerifyingGate}
                className="px-5 py-2 bg-[#1c1917] hover:bg-black disabled:bg-[#78716c] text-white text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              >
                {isVerifyingGate ? 'Verifying...' : 'Unlock Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Full Composer / Editor View for Authenticated Admin
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1c1917] pb-24">
      {/* Sub-Header Actions */}
      <div className="sticky top-16 z-30 bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#e7e5e4] px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onReturnHome}
              className="flex items-center gap-1.5 text-xs text-[#78716c] hover:text-[#1c1917] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Articles</span>
            </button>
            <span className="text-[#d6d3d1]">|</span>
            {isEditingExisting ? (
              <>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[11px] font-mono font-medium border border-amber-300">
                  Editing Article: {initialArticle?.title.slice(0, 36)}...
                </span>
                <span className="text-[#d6d3d1]">|</span>
              </>
            ) : (
              <>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[11px] font-mono font-medium border border-emerald-300">
                  Drafting New Article
                </span>
                <span className="text-[#d6d3d1]">|</span>
              </>
            )}
            <div className="text-xs font-mono text-[#57534e]">
              <span>{stats.words} words</span> · <span>{stats.readTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Switchers */}
            <div className="hidden sm:flex items-center bg-[#f5f5f4] p-0.5 border border-[#e7e5e4] text-xs">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  activeTab === 'edit' ? 'bg-white font-medium text-[#1c1917]' : 'text-[#78716c]'
                }`}
              >
                Write
              </button>
              <button
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  activeTab === 'split' ? 'bg-white font-medium text-[#1c1917]' : 'text-[#78716c]'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 cursor-pointer transition-colors ${
                  activeTab === 'preview' ? 'bg-white font-medium text-[#1c1917]' : 'text-[#78716c]'
                }`}
              >
                Preview
              </button>
            </div>

            {/* Delete button (if editing existing) */}
            {isEditingExisting && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-2 cursor-pointer transition-colors"
                title="Delete this article permanently"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}

            {/* Sync Medium Button */}
            <button
              onClick={handleSyncMedium}
              disabled={isSyncingMedium}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#f5f5f4] border border-[#d6d3d1] hover:border-[#1c1917] text-[#1c1917] text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
              title="Export and sync all public articles from https://medium.com/@atiendriyaverma"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#15803d] ${isSyncingMedium ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isSyncingMedium ? 'Syncing...' : 'Sync Medium'}</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-5 py-2 bg-[#1c1917] hover:bg-black disabled:bg-[#78716c] text-white text-xs font-medium uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEditingExisting ? 'Saving Changes...' : 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEditingExisting ? 'Save & Update Article' : 'Publish Article'}</span>
                </>
              )}
            </button>

            {/* Logout Admin */}
            <button
              onClick={() => {
                localStorage.removeItem('atiendriya_admin_auth');
                onSetAdmin(false);
              }}
              title="Lock Admin mode"
              className="p-2 text-[#78716c] hover:text-[#1c1917] border border-[#d6d3d1] bg-white cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="px-6 py-3 border-b text-xs flex items-center justify-between bg-emerald-50 border-emerald-200 text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{syncStatus}</span>
          </div>
          <button
            onClick={() => setSyncStatus(null)}
            className="underline text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status Bar */}
      {publishResult.type !== 'idle' && (
        <div
          className={`px-6 py-3 border-b text-xs flex items-center justify-between ${
            publishResult.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {publishResult.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{publishResult.message}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPublishResult({ type: 'idle', message: '' })}
              className="underline text-[11px] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Editor Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Metadata Fields */}
        <div className="bg-white border border-[#e7e5e4] p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716c] mb-1">
                Article Title
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Unpacking India's Manufacturing Supercycle..."
                className="w-full text-xl md:text-2xl font-serif font-bold text-[#1c1917] px-3 py-2 border border-[#d6d3d1] focus:outline-none focus:border-[#1c1917]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716c] mb-1">
                URL Identifier / Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. unpacking-indias-manufacturing-supercycle"
                className="w-full text-xs font-mono text-[#44403c] px-3 py-2.5 border border-[#d6d3d1] focus:outline-none focus:border-[#1c1917]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716c] mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Indian Macro, Capital Markets, Valuation"
                className="w-full text-xs text-[#44403c] px-3 py-2 border border-[#d6d3d1] focus:outline-none focus:border-[#1c1917]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716c] mb-1">
                Executive Excerpt (1-2 sentences)
              </label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary of the investment thesis..."
                className="w-full text-xs text-[#44403c] px-3 py-2 border border-[#d6d3d1] focus:outline-none focus:border-[#1c1917]"
              />
            </div>
          </div>

          {/* Quick formatting toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f5f5f4] text-xs">
            <span className="text-[11px] font-mono text-[#78716c] mr-2">Quick Inserts:</span>
            <button
              onClick={() => insertSnippet('### Key Takeaway\nSummarize the main insight or conclusion here in 1-2 clear sentences...')}
              className="px-2 py-1 bg-[#f5f5f4] hover:bg-[#e7e5e4] text-[#44403c] text-[11px] font-sans-clean flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3" /> Key Takeaway
            </button>
            <button
              onClick={() => insertSnippet('> "Quote or variant perception thesis note here..."')}
              className="px-2 py-1 bg-[#f5f5f4] hover:bg-[#e7e5e4] text-[#44403c] text-[11px] font-serif flex items-center gap-1 cursor-pointer"
            >
              <Quote className="w-3 h-3" /> Quote Callout
            </button>
            <button
              onClick={() => insertSnippet('| Metric | 2024A | 2025E | 2026E |\n| :--- | :--- | :--- | :--- |\n| Revenue (Cr) | 1,200 | 1,540 | 1,920 |\n| ROIC (%) | 18.5% | 21.0% | 23.4% |')}
              className="px-2 py-1 bg-[#f5f5f4] hover:bg-[#e7e5e4] text-[#44403c] text-[11px] font-mono flex items-center gap-1 cursor-pointer"
            >
              <Table className="w-3 h-3" /> Valuation Table
            </button>
            <button
              onClick={() => insertSnippet('```python\n# Calculate implied cost of equity using CAPM\nrisk_free = 0.071  # 10-Yr Indian G-Sec\nmarket_risk_premium = 0.055\nbeta = 1.15\n\ncost_of_equity = risk_free + (beta * market_risk_premium)\nprint(f"Cost of Equity: {cost_of_equity:.2%}")\n```')}
              className="px-2 py-1 bg-[#f5f5f4] hover:bg-[#e7e5e4] text-[#44403c] text-[11px] font-mono flex items-center gap-1 cursor-pointer"
            >
              <span className="font-bold text-emerald-700">Py</span> Python Model
            </button>
          </div>
        </div>

        {/* Composer Workspace */}
        <div className="min-h-[550px] grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Markdown Input */}
          {(activeTab === 'split' || activeTab === 'edit') && (
            <div className={`flex flex-col bg-white border border-[#e7e5e4] ${activeTab === 'edit' ? 'md:col-span-2' : ''}`}>
              <div className="bg-[#f5f5f4] border-b border-[#e7e5e4] px-4 py-2.5 flex items-center justify-between text-xs text-[#78716c]">
                <div className="flex items-center gap-1.5 font-medium text-[#1c1917]">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Markdown Editor</span>
                </div>
                <span className="text-[11px] font-mono">Supports Markdown & Python snippets</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your research thesis in Markdown..."
                className="w-full flex-1 p-5 font-mono text-sm leading-relaxed text-[#1c1917] resize-none focus:outline-none min-h-[500px]"
              />
            </div>
          )}

          {/* Live Editorial Preview */}
          {(activeTab === 'split' || activeTab === 'preview') && (
            <div className={`flex flex-col bg-white border border-[#e7e5e4] overflow-y-auto ${activeTab === 'preview' ? 'md:col-span-2' : ''}`}>
              <div className="bg-[#f5f5f4] border-b border-[#e7e5e4] px-4 py-2.5 flex items-center justify-between text-xs text-[#78716c]">
                <div className="flex items-center gap-1.5 font-medium text-[#1c1917]">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </div>
                <span className="text-[11px]">Editorial Newsreader Font</span>
              </div>

              <div className="p-8 max-w-prose mx-auto w-full">
                <div className="text-xs font-mono text-[#78716c] mb-2">
                  {stats.readTime} · By Atiendriya Verma
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1c1917] leading-tight mb-4">
                  {title || 'Untitled Thesis'}
                </h1>
                {excerpt && (
                  <p className="text-sm font-serif italic text-[#57534e] border-l-2 border-[#1c1917] pl-3 mb-6">
                    {excerpt}
                  </p>
                )}

                <div className="font-serif text-[#292524] text-base leading-relaxed space-y-4">
                  {content.split('\n\n').map((block, i) => {
                    if (block.startsWith('# ')) {
                      return <h1 key={i} className="text-xl font-serif font-bold text-[#1c1917] mt-6 mb-2">{block.replace('# ', '')}</h1>;
                    }
                    if (block.startsWith('## ')) {
                      return <h2 key={i} className="text-lg font-serif font-bold text-[#1c1917] mt-5 mb-2">{block.replace('## ', '')}</h2>;
                    }
                    if (block.startsWith('### ')) {
                      return <h3 key={i} className="text-base font-serif font-semibold text-[#1c1917] mt-4 mb-2">{block.replace('### ', '')}</h3>;
                    }
                    if (block.startsWith('> ')) {
                      return (
                        <blockquote key={i} className="border-l-2 border-[#1c1917] pl-4 italic text-[#57534e] my-3">
                          {block.replace(/^>\s*/, '')}
                        </blockquote>
                      );
                    }
                    if (block.startsWith('```')) {
                      return <PythonConsole key={i} code={block} />;
                    }
                    return <p key={i} className="leading-relaxed whitespace-pre-line">{block}</p>;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
