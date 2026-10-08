import React from 'react';
import { Linkedin, ExternalLink, ArrowRight, TrendingUp, Cpu, Award } from 'lucide-react';

interface HeroProps {
  onExploreArticles: () => void;
  onViewAbout: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreArticles, onViewAbout }) => {
  return (
    <section className="border-b border-[#e7e5e4] pt-12 pb-14 bg-gradient-to-b from-[#faf9f6] to-[#f5f4ef]/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Kicker / Subheading */}
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#78716c] mb-4">
          <span>Investment Analysis</span>
          <span aria-hidden="true">·</span>
          <span>Capital Markets</span>
          <span aria-hidden="true">·</span>
          <span>Quantitative Research</span>
        </div>

        {/* Masthead Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1c1917] tracking-tight leading-[1.18] mb-6">
          Rigorous equity valuation, Indian macro shifts, and data science in capital allocation.
        </h1>

        {/* Narrative Bio */}
        <p className="text-base sm:text-lg font-serif text-[#44403c] leading-relaxed max-w-3xl mb-8">
          Welcome to my research memorandums and writing portfolio. I am <strong className="text-[#1c1917] font-semibold">Atiendriya Verma</strong>. I am pursuing my MBA in Finance & Business Analysis at IILM University. My academic and analytical journey is driven by an unyielding fascination with how capital allocators assess uncertainty, distinguish structural trends from cyclical noise, and price enterprise cash flows.
        </p>

        {/* Core Pillars / Unboxed Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#e7e5e4] text-xs text-[#57534e] mb-8">
          <div className="flex items-start gap-2.5">
            <TrendingUp className="w-4 h-4 text-[#1c1917] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#1c1917]">Fundamental Valuation</div>
              <div className="text-[11px] text-[#78716c]">Two-stage DCF, ROIC-WACC spreads, & reverse DCF models</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Cpu className="w-4 h-4 text-[#1c1917] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#1c1917]">Data Science in Finance</div>
              <div className="text-[11px] text-[#78716c]">Python factor pipelines, Nifty 500 regressions, & risk attribution</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Award className="w-4 h-4 text-[#1c1917] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#1c1917]">MBA & Business Analysis</div>
              <div className="text-[11px] text-[#78716c]">Finance & Analytics at IILM University</div>
            </div>
          </div>
        </div>

        {/* Action Controls & External Links */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onExploreArticles}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1c1917] hover:bg-black text-white text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span>Read Research Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onViewAbout}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#d6d3d1] hover:border-[#1c1917] text-[#1c1917] text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span>Background & Bio</span>
          </button>

          <div className="flex items-center gap-3 sm:ml-auto pt-2 sm:pt-0">
            <a
              href="https://www.linkedin.com/in/atiendriya-verma/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#0a66c2] hover:underline font-mono"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
            <span className="text-[#d6d3d1]">·</span>
            <a
              href="https://medium.com/@atiendriyaverma"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#1c1917] hover:underline font-mono"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Medium (@atiendriyaverma)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
