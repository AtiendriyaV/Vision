import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, ChevronDown, ChevronRight, CornerDownLeft } from 'lucide-react';

interface PythonConsoleProps {
  code: string;
  language?: string;
  title?: string;
}

export const PythonConsole: React.FC<PythonConsoleProps> = ({
  code,
  language = 'python',
  title = 'python3 interactive terminal',
}) => {
  const [copied, setCopied] = useState(false);
  const [showOutput, setShowOutput] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const cleanCode = code.replace(/```[a-z]*\n?/g, '').trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate simulated console output based on the script's theme
  const getSimulatedOutput = (source: string): string => {
    if (source.includes('simulate_us_bond_spillover') || source.includes('us_10y_yield') || source.includes('forex')) {
      return `>>> simulate_us_bond_spillover(us_10y_yield=4.75, spread_bps=210)
----------------------------------------------------------------------
[MACRO MODEL] Evaluating US 10Y Yield Transmission to Indian Accounts:
- US 10-Year Benchmark:       4.75% (+35 bps surge)
- India 10-Year G-Sec Yield:  6.85% (Spread compressed to 210 bps)
- Projected Monthly FPI Outflow: -$1.84 Billion (Debt + Equity)
- RBI Net Spot FX Intervention: -$3.20 Billion deployed to defend USD/INR
- Domestic Banking Liquidity:   -₹26,800 Cr (Intervention drained rupee liquidity)
- Nifty 50 Forward P/E Impact:  -0.85x multiple compression
>>> Transmission: Higher US risk-free rate hardens domestic cost of equity (Ke).`;
    }

    if (source.includes('compute_sugar_ethanol_tradeoff')) {
      return `>>> compute_sugar_ethanol_tradeoff(total_cane=330.0 MT, recovery=10.2%, diversion=18.0%)
----------------------------------------------------------------------
[STDOUT] Executing agricultural allocation matrix...
{
  'Net_Refined_Sugar_MT': 27.60,       # Below 28.5 MT domestic threshold
  'Ethanol_Yield_Million_L': 4158.00,  # ~4.16B Liters generated
  'Supply_Deficit_Trigger': True       # TRQ 1MT duty-free import triggered!
}
>>> Policy Signal: TRQ Tariff Exemption active through Oct 31, 2026.`;
    }

    if (source.includes('compute_solvency_matrix')) {
      return `>>> solvency_tracker.fit(nifty_500_capex_df)
----------------------------------------------------------------------
   Ticker   NetDebt_to_EBITDA  Interest_Coverage    Capacity_Signal
0    LT.NS              1.12x              6.85x  Prime Capex Ready
1   BHEL.NS             0.42x              4.91x  Prime Capex Ready
2  SIEMENS.NS          -0.85x             18.20x  Prime Capex Ready
3   ABB.NS             -1.10x             24.40x  Prime Capex Ready
----------------------------------------------------------------------
[INFO] 42/50 constituent industrials exhibit net debt/EBITDA < 1.5x.`;
    }

    if (source.includes('compute_audit_risk_score')) {
      return `>>> audit_engine.evaluate_batch(journal_entries_sample)
----------------------------------------------------------------------
[SCAN] 10,482 General Ledger entries analyzed via continuous audit model
Anomaly Detected:
- Entry #94812: Amount=₹4,500,000 | Timestamp=23:14:02 (Weekend=True)
- Computed Risk Score: 3.421 (Threshold: 2.500)
- Action: Flagged for mandatory statutory partner audit review.`;
    }

    if (source.includes('compute_raincoat_index_velocity') || source.includes('raincoat')) {
      return `>>> raincoat_analyzer.fit(retail_inventory_df, mandi_prices_df)
----------------------------------------------------------------------
[ALTERNATIVE DATA PIPELINE] Fast-Moving Consumer Goods vs. Mandi Arrivals:
- SKU Category: Waterproof Apparel & Protection (Monsoon Index)
- Observed Inventory Turnover: 4.8x weekly (Baseline: 1.1x)
- Cross-Correlation Lag: -12.4 Days (p < 0.001)
- Statistical Finding: Retail shelf stock-outs anticipate wholesale tomato/onion
  spikes by 12 days before official IMD meteorological release.
>>> Strategy: Long Agri-Logistics / Short Perishable Food Processors.`;
    }

    if (source.includes('evaluate_workplace_superagency') || source.includes('superagency')) {
      return `>>> org_analytics.simulate_instruct_and_review(team_size=40, task_portfolio)
----------------------------------------------------------------------
[SUPERAGENCY BENCHMARK] Work Architecture Transition Analysis:
- Traditional Task Assembly Hours/Week: 28.4 hrs/employee
- Gen AI Instruct-and-Review Hours/Week:  7.2 hrs/employee
- Bandwidth Re-allocated to Strategy:    +21.2 hrs (+74.6%)
- Critical Failure Mode Probability:     4.2% (Mitigated by Dual-Review)
>>> Management Directive: Implement Explainability Safeguards for Stage 2 Reviews.`;
    }

    if (source.includes('compute_attribution_and_clv') || source.includes('attribution')) {
      return `>>> attribution_engine.evaluate_models(conversion_data)
----------------------------------------------------------------------
[CONVERSION FUNNEL EFFICIENCY] Spatial AR vs. Traditional 2D Display:
- Interactive 3D Dwell Time:   142 seconds (+184% vs. 2D static)
- Qualified Lead Conversion:    4.82% (Benchmark: 1.65%)
- Post-Purchase Return Rate:    6.20% (Dampened from 18.50%)
- Incremental ROAS:             4.35x on spatial interactive media
>>> Budget Recommendation: Shift 35% ad spend to interactive experiential AR.`;
    }

    if (source.includes('FactorPipeline') || source.includes('Fama-French')) {
      return `>>> factor_pipeline.regress_asset(stock_returns, factor_df)
----------------------------------------------------------------------
                            OLS Regression Results                            
==============================================================================
Dep. Variable:          Excess_Return   R-squared:                       0.684
Model:                            OLS   Adj. R-squared:                  0.672
Method:                 Least Squares   F-statistic:                     58.21
==============================================================================
                 coef    std err          t      P>|t|      [0.025      0.975]
------------------------------------------------------------------------------
const          0.0038      0.001      3.454      0.001       0.002       0.006
MKT_RF         0.8840      0.042     21.047      0.000       0.801       0.967
SMB            0.4120      0.051      8.078      0.000       0.311       0.513
HML            0.1850      0.048      3.854      0.000       0.090       0.280
==============================================================================
Alpha (Annualized): +4.56% (p < 0.01)`;
    }

    if (source.includes('intrinsic_value_attribution') || source.includes('DCF')) {
      return `>>> intrinsic_value_attribution(nopat, roic, wacc=0.115, terminal_g=0.06)
----------------------------------------------------------------------
Enterprise Value:          ₹14,820.50 Cr
Explicit Period PV:         ₹2,964.10 Cr  (20.0%)
Terminal Value PV:         ₹11,856.40 Cr  (80.0%)
Terminal Value Share:      80.0%
----------------------------------------------------------------------
[WARNING] 80.0% value concentration in Terminal Value. Reverse DCF recommended.`;
    }

    return `>>> python3 script.py
----------------------------------------------------------------------
Process completed with returncode 0.
Memory usage: 42.8 MB | Execution time: 0.142s`;
  };

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setShowOutput(true);
    }, 400);
  };

  // Syntax colorizer for Python console
  const colorizeLine = (line: string) => {
    // Comment
    if (line.trim().startsWith('#')) {
      return <span className="text-zinc-500 italic">{line}</span>;
    }

    const tokens = line.split(/(\s+|[(),:[\]{}="'])/);

    return tokens.map((token, i) => {
      if (['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'in', 'and', 'or', 'not', 'as', 'with', 'lambda'].includes(token)) {
        return <span key={i} className="text-sky-400 font-semibold">{token}</span>;
      }
      if (['True', 'False', 'None'].includes(token)) {
        return <span key={i} className="text-purple-400 font-semibold">{token}</span>;
      }
      if (['pd', 'np', 'sm', 'pandas', 'numpy', 'statsmodels'].includes(token)) {
        return <span key={i} className="text-amber-300 font-semibold">{token}</span>;
      }
      if (['print', 'round', 'sum', 'len', 'max', 'min', 'range', 'enumerate', 'zip'].includes(token)) {
        return <span key={i} className="text-yellow-400">{token}</span>;
      }
      if (/^["'].*["']$/.test(token)) {
        return <span key={i} className="text-emerald-300">{token}</span>;
      }
      if (/^-?\d+(\.\d+)?$/.test(token)) {
        return <span key={i} className="text-orange-300">{token}</span>;
      }
      return <span key={i} className="text-zinc-200">{token}</span>;
    });
  };

  const lines = cleanCode.split('\n');

  return (
    <div className="my-8 rounded-lg overflow-hidden border border-zinc-800 bg-[#0d1117] shadow-xl font-mono text-xs not-prose">
      {/* Console Top Chrome / Title Bar */}
      <div className="bg-[#161b22] px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between select-none">
        {/* Terminal window buttons */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 cursor-pointer" title="Close" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 cursor-pointer" title="Minimize" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 cursor-pointer" title="Expand" />
          <span className="ml-3 text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>atiendriya@quant-terminal: ~/equity-models$</span>
            <span className="text-zinc-500 font-normal hidden sm:inline">({title})</span>
          </span>
        </div>

        {/* Console Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#238636] hover:bg-[#2ea043] text-white text-[11px] font-medium transition-colors cursor-pointer"
            title="Execute script and view terminal output"
          >
            <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Console'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] transition-colors cursor-pointer"
            title="Copy Python code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Body with Prompt / Line Numbers */}
      <div className="p-4 overflow-x-auto text-[12.5px] leading-relaxed bg-[#0d1117] text-zinc-200">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, index) => {
              const isComment = line.trim().startsWith('#');
              const promptSymbol = isComment ? '' : index === 0 ? '>>> ' : '... ';

              return (
                <tr key={index} className="hover:bg-zinc-900/40">
                  <td className="w-10 pr-3 text-right text-zinc-600 select-none align-top font-mono text-[11px]">
                    {index + 1}
                  </td>
                  <td className="w-8 pr-2 text-zinc-500 select-none align-top font-mono text-[11px]">
                    <span className="text-emerald-500/70">{promptSymbol}</span>
                  </td>
                  <td className="whitespace-pre font-mono align-top">
                    {colorizeLine(line)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Interactive Console Output Display */}
      {showOutput && (
        <div className="border-t border-zinc-800 bg-[#090d13] p-4 text-[12px] leading-relaxed text-zinc-300 font-mono">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>TERMINAL OUTPUT (STDOUT)</span>
            </div>
            <button
              onClick={() => setShowOutput(false)}
              className="text-zinc-500 hover:text-zinc-300 text-[10px] uppercase cursor-pointer"
            >
              Hide Output
            </button>
          </div>
          <pre className="text-emerald-400/90 whitespace-pre overflow-x-auto text-[11.5px] leading-relaxed">
            {getSimulatedOutput(cleanCode)}
          </pre>
        </div>
      )}
    </div>
  );
};
