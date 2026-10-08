import React from 'react';
import { 
  Linkedin, 
  ExternalLink, 
  BookOpen, 
  TrendingUp, 
  Cpu, 
  Award, 
  Terminal, 
  PieChart, 
  Globe, 
  Compass,
  ArrowRight
} from 'lucide-react';

interface AboutViewProps {
  onExploreArticles: () => void;
  onOpenWritePortal?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onExploreArticles }) => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1c1917] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header Profile Section */}
        <section className="border-b border-[#e7e5e4] pb-12">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#1c1917] text-white flex items-center justify-center font-serif text-4xl font-bold shrink-0 shadow-sm">
              AV
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#78716c] mb-1">
                  <span>Research Profile</span>
                  <span aria-hidden="true">·</span>
                  <span>Portfolio Manager Candidate</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1c1917] tracking-tight">
                  Atiendriya Verma
                </h1>
                <p className="text-sm font-sans-clean text-[#57534e] mt-1">
                  Aspiring Equity Research Analyst & Portfolio Manager · MBA (Finance & Business Analysis)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="https://www.linkedin.com/in/atiendriya-verma/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-medium uppercase tracking-wider transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn Profile</span>
                </a>

                <a
                  href="https://medium.com/@atiendriyaverma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1c1917] hover:bg-black text-white text-xs font-medium uppercase tracking-wider transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Medium Publications</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Narrative Biography */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-[#1c1917] border-b border-[#e7e5e4] pb-3">
            Academic Trajectory & Professional Conviction
          </h2>

          <div className="font-serif text-[#292524] text-base sm:text-lg leading-[1.85] space-y-5">
            <p>
              I am pursuing my MBA in Finance & Business Analysis at IILM University. My academic and analytical journey is driven by an unyielding fascination with how capital allocators assess uncertainty, distinguish structural trends from cyclical noise, and price enterprise cash flows.
            </p>
            <p>
              Modern capital markets demand a dual mastery: deep qualitative grounding in business fundamentals, corporate governance, and macroeconomic policy, paired with modern quantitative data science tools (Python, statistical regression, cross-sectional factor models). I bridge both domains.
            </p>
            <blockquote className="border-l-3 border-[#1c1917] pl-5 italic text-[#44403c] bg-[#f5f4ef]/60 py-3 my-6 font-serif">
              "The discipline of equity research is ultimately the pursuit of intellectual honesty. It requires deconstructing management narratives, stress-testing reinvestment economics against cost of capital, and maintaining independent conviction when consensus leans toward euphoria or despair."
            </blockquote>
          </div>
        </section>

        {/* Core Competencies Matrix */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-[#1c1917] border-b border-[#e7e5e4] pb-3">
            Core Competencies & Analytical Toolkit
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-[#e7e5e4] space-y-3">
              <div className="w-10 h-10 bg-[#f5f5f4] flex items-center justify-center text-[#1c1917]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1c1917]">
                Fundamental Equity Valuation
              </h3>
              <ul className="text-xs font-sans-clean text-[#57534e] space-y-1.5 leading-relaxed">
                <li>• Two-stage & multi-stage DCF modeling</li>
                <li>• ROIC, WACC, and Economic Value Added (EVA)</li>
                <li>• Reverse DCF to uncover implicit expectations</li>
                <li>• Relative valuation & peer sum-of-the-parts (SOTP)</li>
                <li>• Capital expenditure cycle tracking</li>
              </ul>
            </div>

            <div className="p-6 bg-white border border-[#e7e5e4] space-y-3">
              <div className="w-10 h-10 bg-[#f5f5f4] flex items-center justify-center text-[#1c1917]">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1c1917]">
                Macroeconomic Analysis
              </h3>
              <ul className="text-xs font-sans-clean text-[#57534e] space-y-1.5 leading-relaxed">
                <li>• Indian corporate balance sheet clean-up & capex</li>
                <li>• Banking sector NPA & liquidity dynamics</li>
                <li>• Global supply chain shifts ("China+1" reality)</li>
                <li>• Energy transition & critical minerals bottleneck</li>
                <li>• Inflation, monetary policy & G-Sec yield curves</li>
              </ul>
            </div>

            <div className="p-6 bg-white border border-[#e7e5e4] space-y-3">
              <div className="w-10 h-10 bg-[#f5f5f4] flex items-center justify-center text-[#1c1917]">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1c1917]">
                Quantitative Data Science
              </h3>
              <ul className="text-xs font-sans-clean text-[#57534e] space-y-1.5 leading-relaxed">
                <li>• Python (Pandas, NumPy, Scipy, Statsmodels)</li>
                <li>• Cross-sectional multi-factor models (Fama-French)</li>
                <li>• Financial time series & volatility backtesting</li>
                <li>• Automated web-scraping & financial statement parsers</li>
                <li>• Machine learning classification in credit risks</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Writing Philosophy & Core Themes */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-[#1c1917] border-b border-[#e7e5e4] pb-3">
            Editorial Themes & Publications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white border border-[#e7e5e4]">
              <span className="font-mono text-[11px] text-[#78716c] uppercase block mb-1">Theme 01</span>
              <h4 className="font-serif font-bold text-sm text-[#1c1917] mb-1">Capital Markets & Indian Equities</h4>
              <p className="text-[#57534e] leading-relaxed">
                Deep dives into Nifty 500 constituents, manufacturing supercycles, ancillary industrial leaders, and defense value chains.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#e7e5e4]">
              <span className="font-mono text-[11px] text-[#78716c] uppercase block mb-1">Theme 02</span>
              <h4 className="font-serif font-bold text-sm text-[#1c1917] mb-1">Commodities & Energy Transition</h4>
              <p className="text-[#57534e] leading-relaxed">
                Examining grid transmission constraints, power equipment capex, copper/lithium mineral intensity, and storage economics.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#e7e5e4]">
              <span className="font-mono text-[11px] text-[#78716c] uppercase block mb-1">Theme 03</span>
              <h4 className="font-serif font-bold text-sm text-[#1c1917] mb-1">AI & Quantitative Systems in Finance</h4>
              <p className="text-[#57534e] leading-relaxed">
                Applying algorithmic statistical models to market returns, factor anomaly decay, and automated financial extraction.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#e7e5e4]">
              <span className="font-mono text-[11px] text-[#78716c] uppercase block mb-1">Theme 04</span>
              <h4 className="font-serif font-bold text-sm text-[#1c1917] mb-1">Epistemology & Market Reflections</h4>
              <p className="text-[#57534e] leading-relaxed">
                Exploring cognitive biases, reflexivity in price discovery, institutional herd mentality, and maintaining intellectual independence.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <section className="p-8 bg-[#1c1917] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-xl font-bold">Interested in discussing an investment thesis?</h3>
            <p className="text-xs text-[#a8a29e] mt-1">Connect on LinkedIn or explore my latest published memorandums.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onExploreArticles}
              className="px-4 py-2.5 bg-white hover:bg-[#faf9f6] text-[#1c1917] text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
            >
              Read Articles
            </button>
            <a
              href="https://www.linkedin.com/in/atiendriya-verma/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 border border-[#57534e] hover:border-white text-white text-xs font-medium uppercase tracking-wider transition-colors"
            >
              Connect on LinkedIn
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
