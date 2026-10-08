import React, { useState, useMemo } from 'react';
import { Search, Clock, Calendar, ArrowUpRight, RefreshCw, Filter, Edit3 } from 'lucide-react';
import { Article } from '@/lib/types';

interface ArticleListProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onEditArticle?: (article: Article) => void;
  isAdmin?: boolean;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  onSelectArticle,
  isLoading,
  onRefresh,
  onEditArticle,
  isAdmin = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Extract unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      a.tags?.forEach((t) => set.add(t));
    });
    return ['All', ...Array.from(set)];
  }, [articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === 'All' || article.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [articles, searchQuery, selectedTag]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Controls Header: Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#e7e5e4]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equity theses, valuation, DCF, macro..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#d6d3d1] focus:outline-none focus:border-[#1c1917] text-xs font-sans-clean transition-colors"
          />
        </div>

        {/* Sync / Refresh Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#d6d3d1] hover:border-[#1c1917] text-xs font-mono text-[#57534e] hover:text-[#1c1917] transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh research articles"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Interactive Segmented Filter Tabs (Allowed by Zero-Pill rules) */}
      <div className="flex items-center gap-1 py-4 overflow-x-auto border-b border-[#e7e5e4] text-xs">
        <span className="text-[11px] font-mono text-[#78716c] uppercase tracking-wider mr-2 shrink-0">
          Topics:
        </span>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 text-xs transition-colors shrink-0 cursor-pointer ${
              selectedTag === tag
                ? 'bg-[#1c1917] text-white font-medium'
                : 'bg-[#f5f5f4] text-[#57534e] hover:text-[#1c1917] hover:bg-[#e7e5e4]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Articles Feed */}
      <div className="divide-y divide-[#e7e5e4]">
        {filteredArticles.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-serif text-lg text-[#78716c] mb-2">No research articles match your query.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('All');
              }}
              className="text-xs font-mono text-[#1c1917] underline cursor-pointer"
            >
              Reset search filters
            </button>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <article
              key={article.slug}
              onClick={() => onSelectArticle(article)}
              className="py-10 group cursor-pointer transition-colors"
            >
              {/* Zero-Pill Unboxed Metadata Header */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#78716c] mb-3">
                <span>{article.date}</span>
                <span aria-hidden="true">·</span>
                <span>{article.readTime}</span>
                <span aria-hidden="true">·</span>
                <span>By {article.author || 'Atiendriya Verma'}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#1c1917] group-hover:text-black leading-snug mb-3">
                <span className="group-hover:underline underline-offset-4 decoration-[#78716c]">
                  {article.title}
                </span>
              </h2>

              {/* Excerpt */}
              <p className="text-sm sm:text-base font-serif text-[#57534e] leading-relaxed mb-4 line-clamp-3">
                {article.excerpt}
              </p>

              {/* Unboxed Tags & Read Link */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#78716c]">
                  {article.tags?.map((tag, i) => (
                    <span key={tag}>
                      #{tag}
                      {i < (article.tags?.length || 0) - 1 && <span className="ml-3 text-[#d6d3d1]">·</span>}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {isAdmin && onEditArticle && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditArticle(article);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#44403c] bg-[#f5f5f4] hover:bg-[#e7e5e4] border border-[#d6d3d1] hover:text-[#1c1917] cursor-pointer transition-colors"
                      title="Edit this article in Admin Editor"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Article</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-[#1c1917] group-hover:translate-x-1 transition-transform">
                    <span>Read Thesis</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
