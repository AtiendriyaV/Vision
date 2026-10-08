import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Share2, 
  Bookmark, 
  Heart, 
  Copy, 
  Check, 
  Type, 
  Linkedin, 
  ArrowUp,
  Edit3,
  Save,
  X,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Article } from '@/lib/types';
import { PythonConsole } from './PythonConsole';

interface ArticleReaderProps {
  article: Article;
  onBack: () => void;
  onSelectTag?: (tag: string) => void;
  onEditArticle?: (article: Article) => void;
  onArticleUpdated?: (article: Article) => void;
  isAdmin?: boolean;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ 
  article, 
  onBack, 
  onSelectTag,
  onEditArticle,
  onArticleUpdated,
  isAdmin = false,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSizeClass, setFontSizeClass] = useState<'text-base' | 'text-lg' | 'text-xl'>('text-lg');
  const [copiedLink, setCopiedLink] = useState(false);
  const [claps, setClaps] = useState(14);
  const [hasClapped, setHasClapped] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Inline Quick Edit state
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(article.title);
  const [editExcerpt, setEditExcerpt] = useState(article.excerpt);
  const [editContent, setEditContent] = useState(article.content);
  const [isSavingInline, setIsSavingInline] = useState(false);
  const [saveToast, setSaveToast] = useState('');

  // Update inline form when active article changes
  useEffect(() => {
    setEditTitle(article.title);
    setEditExcerpt(article.excerpt);
    setEditContent(article.content);
    setIsInlineEditing(false);
  }, [article]);

  // Track scroll progress for the top sticky reading indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = () => {
    const url = window.location.origin + `/blog/${article.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleClap = () => {
    setClaps((prev) => prev + 1);
    setHasClapped(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveInline = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Title and content are required.');
      return;
    }

    setIsSavingInline(true);
    setSaveToast('');

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          slug: article.slug,
          originalSlug: article.slug,
          content: editContent.trim(),
          tags: article.tags || ['Equity Research'],
          excerpt: editExcerpt.trim() || editContent.slice(0, 160).replace(/[#*`_]/g, '') + '...',
          author: article.author || 'Atiendriya Verma',
          passcode: 'Vermakk@1972',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.article) {
        setSaveToast('Article updated successfully!');
        setIsInlineEditing(false);
        if (onArticleUpdated) {
          onArticleUpdated(data.article);
        }
        setTimeout(() => setSaveToast(''), 3000);
      } else {
        alert(data.message || 'Failed to save changes.');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving article.');
    } finally {
      setIsSavingInline(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1c1917] relative">
      {/* Sticky Reading Progress Indicator Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-[#e7e5e4]">
        <div
          className="h-full bg-[#1c1917] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Sub-Header Toolbar */}
      <div className="sticky top-16 z-30 bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#e7e5e4] px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#78716c] hover:text-[#1c1917] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Articles</span>
          </button>

          {/* Reader Controls */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#78716c]">
            {/* Font size toggle */}
            {!isInlineEditing && (
              <div className="flex items-center border border-[#d6d3d1] bg-white p-0.5">
                <button
                  onClick={() => setFontSizeClass('text-base')}
                  className={`px-2 py-0.5 text-xs cursor-pointer ${fontSizeClass === 'text-base' ? 'bg-[#1c1917] text-white' : 'text-[#78716c]'}`}
                  title="Standard typography size"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSizeClass('text-lg')}
                  className={`px-2 py-0.5 text-sm font-medium cursor-pointer ${fontSizeClass === 'text-lg' ? 'bg-[#1c1917] text-white' : 'text-[#78716c]'}`}
                  title="Medium typography size"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSizeClass('text-xl')}
                  className={`px-2 py-0.5 text-base font-semibold cursor-pointer ${fontSizeClass === 'text-xl' ? 'bg-[#1c1917] text-white' : 'text-[#78716c]'}`}
                  title="Large typography size"
                >
                  A++
                </button>
              </div>
            )}

            {/* Share / Copy Link */}
            <button
              onClick={handleCopyLink}
              className="p-1.5 hover:text-[#1c1917] border border-[#d6d3d1] bg-white transition-colors cursor-pointer flex items-center gap-1"
              title="Copy link to thesis"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-mono hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-1.5 border border-[#d6d3d1] bg-white transition-colors cursor-pointer ${isBookmarked ? 'text-[#1c1917] border-[#1c1917]' : 'hover:text-[#1c1917]'}`}
              title="Save for later"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Direct Edit Trigger (Admin Only) */}
            {isAdmin && (
              !isInlineEditing ? (
                <div className="flex items-center gap-1.5 ml-1">
                  <button
                    onClick={() => setIsInlineEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1917] hover:bg-black text-white text-[11px] font-mono transition-colors cursor-pointer shadow-xs"
                    title="Quickly edit article text inline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Article</span>
                  </button>

                  {onEditArticle && (
                    <button
                      onClick={() => onEditArticle(article)}
                      className="p-1.5 border border-[#d6d3d1] bg-white hover:bg-[#f5f5f4] text-[#1c1917] transition-colors cursor-pointer"
                      title="Open in Full Studio Markdown Composer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveInline}
                    disabled={isSavingInline}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-mono cursor-pointer transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    <span>{isSavingInline ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsInlineEditing(false);
                      setEditTitle(article.title);
                      setEditExcerpt(article.excerpt);
                      setEditContent(article.content);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 border border-[#d6d3d1] bg-white hover:bg-[#f5f5f4] text-[11px] font-mono cursor-pointer transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Cancel</span>
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {saveToast && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{saveToast}</span>
          </div>
        </div>
      )}

      {/* Article Content / Inline Editor */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-24">
        {/* Unboxed Metadata (Zero-Pill Compliance) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-2 border-b border-[#e7e5e4]">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#78716c]">
            <span>{article.date}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readTime}</span>
            <span aria-hidden="true">·</span>
            <span>By {article.author || 'Atiendriya Verma'}</span>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3">
              {!isInlineEditing && (
                <button
                  onClick={() => setIsInlineEditing(true)}
                  className="text-xs font-mono text-[#1c1917] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Quick Edit</span>
                </button>
              )}

              {onEditArticle && (
                <button
                  onClick={() => onEditArticle(article)}
                  className="text-xs font-mono text-[#57534e] hover:text-[#1c1917] flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                >
                  <span>Full Studio</span>
                </button>
              )}
            </div>
          )}
        </div>

        {isInlineEditing ? (
          /* INLINE EDIT MODE */
          <div className="space-y-6 bg-white p-6 border border-[#e7e5e4] shadow-xs">
            <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#1c1917] font-semibold">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <span>Editing Article Directly</span>
              </div>
              {onEditArticle && (
                <button
                  onClick={() => onEditArticle(article)}
                  className="text-xs font-mono text-[#57534e] hover:text-[#1c1917] flex items-center gap-1 underline cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Switch to Full Split Studio</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716c] mb-1">
                Article Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-2xl font-serif font-bold text-[#1c1917] p-2 border border-[#d6d3d1] focus:outline-none focus:border-[#1c1917]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716c] mb-1">
                Executive Excerpt
              </label>
              <textarea
                value={editExcerpt}
                onChange={(e) => setEditExcerpt(e.target.value)}
                rows={2}
                className="w-full text-sm font-serif italic text-[#44403c] p-2 border border-[#d6d3d1] focus:outline-none focus:border-[#1c1917]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716c] mb-1">
                Markdown Body Content
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={16}
                className="w-full font-mono text-sm leading-relaxed p-3 border border-[#d6d3d1] focus:outline-none focus:border-[#1c1917]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e7e5e4]">
              <button
                onClick={() => setIsInlineEditing(false)}
                className="px-4 py-2 border border-[#d6d3d1] hover:bg-[#f5f5f4] text-xs font-mono cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInline}
                disabled={isSavingInline}
                className="px-5 py-2 bg-[#1c1917] hover:bg-black text-white text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSavingInline ? 'Saving Changes...' : 'Save & Publish Changes'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD READER VIEW */
          <>
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1c1917] tracking-tight leading-[1.16] mb-8">
              {article.title}
            </h1>

            {/* Executive Excerpt */}
            <p className="text-lg sm:text-xl font-serif text-[#57534e] leading-relaxed italic border-l-2 border-[#1c1917] pl-5 my-8">
              {article.excerpt}
            </p>

            {/* Unboxed Tag Categories */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#78716c] pb-8 mb-8 border-b border-[#e7e5e4]">
              <span className="font-semibold text-[#1c1917]">Research Focus:</span>
              {article.tags?.map((t, idx) => (
                <React.Fragment key={t}>
                  <span className="hover:text-[#1c1917] cursor-pointer">#{t}</span>
                  {idx < (article.tags?.length || 0) - 1 && <span className="text-[#d6d3d1]">·</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Body Rendered with Clean Markdown Formatting */}
            <div className={`font-serif text-[#292524] ${fontSizeClass} leading-[1.85] space-y-6`}>
              {article.content.split('\n\n').map((block, idx) => {
                const trimmed = block.trim();

                if (trimmed.startsWith('# ')) {
                  return (
                    <h1 key={idx} className="text-2xl sm:text-3xl font-serif font-bold text-[#1c1917] mt-12 mb-4 pt-6 border-t border-[#e7e5e4]">
                      {trimmed.replace('# ', '')}
                    </h1>
                  );
                }
                if (trimmed.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-xl sm:text-2xl font-serif font-bold text-[#1c1917] mt-10 mb-3">
                      {trimmed.replace('## ', '')}
                    </h2>
                  );
                }
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-lg sm:text-xl font-serif font-semibold text-[#1c1917] mt-8 mb-2">
                      {trimmed.replace('### ', '')}
                    </h3>
                  );
                }
                if (trimmed.startsWith('> ')) {
                  return (
                    <blockquote key={idx} className="border-l-3 border-[#1c1917] pl-6 my-6 font-serif italic text-[#44403c] bg-[#f5f4ef]/50 py-3">
                      {trimmed.replace(/^>\s*/, '')}
                    </blockquote>
                  );
                }
                if (trimmed.startsWith('```')) {
                  return <PythonConsole key={idx} code={trimmed} />;
                }
                if (trimmed.startsWith('|')) {
                  const rows = trimmed.split('\n').filter(r => !r.includes('---'));
                  return (
                    <div key={idx} className="my-8 overflow-x-auto">
                      <table className="w-full text-left font-sans-clean text-xs border border-[#e7e5e4]">
                        <tbody>
                          {rows.map((row, rIdx) => {
                            const cols = row.split('|').filter(c => c.trim().length > 0);
                            return (
                              <tr key={rIdx} className={rIdx === 0 ? 'bg-[#f5f5f4] font-semibold text-[#1c1917] border-b border-[#e7e5e4]' : 'border-b border-[#e7e5e4] hover:bg-white'}>
                                {cols.map((col, cIdx) => (
                                  <td key={cIdx} className="p-3">
                                    {col.trim()}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
                  const listItems = trimmed.split('\n');
                  return (
                    <ul key={idx} className="space-y-2 text-[#44403c] my-4 pl-4 list-disc font-serif">
                      {listItems.map((li, lIdx) => (
                        <li key={lIdx} className="leading-relaxed">
                          {li.replace(/^(\*|-|\d+\.)\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (trimmed === '---') {
                  return <hr key={idx} className="my-10 border-[#e7e5e4]" />;
                }

                // Parse inline markdown
                const formatted = trimmed
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#0a66c2] underline hover:text-[#084e96] font-medium">$1</a>')
                  .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-[#1c1917]">$1</strong>')
                  .replace(/\*([^*]+)\*/g, '<em class="italic text-[#44403c]">$1</em>')
                  .replace(/`([^`]+)`/g, '<code class="bg-[#e7e5e4] px-1 py-0.5 text-xs font-mono text-[#1c1917]">$1</code>');

                return (
                  <p
                    key={idx}
                    className="leading-relaxed text-[#292524]"
                    dangerouslySetInnerHTML={{ __html: formatted }}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Reader Claps & Engagement Section */}
        <div className="mt-16 pt-8 border-t border-[#e7e5e4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClap}
              className={`flex items-center gap-2 px-4 py-2 border transition-all cursor-pointer ${
                hasClapped
                  ? 'bg-[#1c1917] text-white border-[#1c1917]'
                  : 'bg-white hover:bg-[#f5f5f4] border-[#d6d3d1] text-[#1c1917]'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasClapped ? 'fill-white' : ''}`} />
              <span className="text-xs font-mono font-medium">{claps} Applauds</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-[#f5f5f4] border border-[#d6d3d1] text-xs font-mono text-[#57534e] transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs font-mono text-[#78716c] hover:text-[#1c1917] cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Author Bio Box */}
        <div className="mt-12 p-8 bg-white border border-[#e7e5e4]">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-16 h-16 bg-[#1c1917] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0">
              AV
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-lg text-[#1c1917]">Atiendriya Verma</h4>
                <a
                  href="https://www.linkedin.com/in/atiendriya-verma/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-[#0a66c2] hover:underline flex items-center gap-1"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn Profile</span>
                </a>
              </div>
              <p className="text-xs font-serif text-[#57534e] leading-relaxed">
                Aspiring Equity Research Analyst and Portfolio Manager. Pursuing MBA in Finance & Business Analysis at IILM University. Researches fundamental valuation models (DCF & relative multiples), Indian macro dynamics, and data science applications in capital markets.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-[#78716c]">
                <a
                  href="https://medium.com/@atiendriyaverma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1c1917] underline"
                >
                  Medium Articles (@atiendriyaverma)
                </a>
                <span>·</span>
                <button
                  onClick={onBack}
                  className="hover:text-[#1c1917] underline cursor-pointer"
                >
                  Explore More Theses
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
