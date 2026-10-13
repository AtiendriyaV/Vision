import React from 'react';
import { ExternalLink } from 'lucide-react';
import { PythonConsole } from './PythonConsole';

interface MarkdownRendererProps {
  content: string;
  fontFamily?: string;
  fontSize?: string;
  className?: string;
}

/**
 * Maps font family keys to corresponding CSS classes / style rules
 */
export function getFontFamilyClass(fontKey?: string): string {
  switch (fontKey?.toLowerCase()) {
    case 'inter':
    case 'sans':
      return 'font-sans';
    case 'merriweather':
      return 'font-serif [font-family:Merriweather,Georgia,serif]';
    case 'lora':
      return 'font-serif [font-family:Lora,Georgia,serif]';
    case 'georgia':
      return 'font-serif [font-family:Georgia,serif]';
    case 'fira-code':
    case 'mono':
      return 'font-mono [font-family:"Fira_Code",monospace]';
    case 'newsreader':
    default:
      return 'font-serif [font-family:Newsreader,Georgia,serif]';
  }
}

/**
 * Maps font size keys to corresponding Tailwind typography sizing classes
 */
export function getFontSizeClass(sizeKey?: string): string {
  switch (sizeKey?.toLowerCase()) {
    case 'sm':
    case 'compact':
      return 'text-sm leading-relaxed';
    case 'lg':
    case 'reading':
      return 'text-lg leading-[1.85]';
    case 'xl':
    case 'large':
      return 'text-xl leading-[1.85]';
    case 'base':
    case 'standard':
    default:
      return 'text-base leading-relaxed';
  }
}

/**
 * Replaces inline markdown syntax including:
 * - <Link url="..." title="..." /> and <Link href="..." title="..." />
 * - <Link url="...">Text</Link> and <Link href="...">Text</Link>
 * - [Text](url)
 * - <a href="...">Text</a>
 * - **bold** and <b> / <strong>
 * - *italic* and <i> / <em>
 * - `code`
 * - raw URLs
 */
function renderFormattedInline(text: string): React.ReactNode {
  // Extract and replace all links with unique placeholders so they are not damaged by bold/italic replacement
  const linkStore: { id: string; url: string; label: string }[] = [];
  let linkCounter = 0;

  let processed = text;

  // Normalize legacy or raw token markers if present in user draft
  processed = processed.replace(/_{2,4}BOLD_START_{2,4}([\s\S]*?)_{2,4}BOLD_END_{2,4}/gi, '@@BOLD_START@@$1@@BOLD_END@@');
  processed = processed.replace(/_{2,4}ITALIC_START_{2,4}([\s\S]*?)_{2,4}ITALIC_END_{2,4}/gi, '@@ITALIC_START@@$1@@ITALIC_END@@');
  processed = processed.replace(/_{2,4}CODE_START_{2,4}([\s\S]*?)_{2,4}CODE_END_{2,4}/gi, '@@CODE_START@@$1@@CODE_END@@');
  processed = processed.replace(/_{2,4}(BOLD|ITALIC|CODE)_(START|END)_{2,4}/gi, '');

  // 1. Match custom <Link ... /> tags (self-closing or with children)
  processed = processed.replace(/<Link\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/Link>)/gi, (fullMatch, attrs, innerText) => {
    const urlMatch = attrs.match(/(?:url|href)=["']([^"']+)["']/i);
    const titleMatch = attrs.match(/title=["']([^"']*)["']/i);
    const url = urlMatch ? urlMatch[1] : '';
    const label = (titleMatch && titleMatch[1]) || (innerText && innerText.trim()) || url;

    if (!url) return fullMatch;
    const token = `@@LINK_${linkCounter++}@@`;
    linkStore.push({ id: token, url, label });
    return token;
  });

  // 2. Match standard HTML <a href="...">...</a> tags
  processed = processed.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_match, url, label) => {
    const token = `@@LINK_${linkCounter++}@@`;
    linkStore.push({ id: token, url, label: label || url });
    return token;
  });

  // 3. Match Markdown links [label](url)
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const token = `@@LINK_${linkCounter++}@@`;
    linkStore.push({ id: token, url, label });
    return token;
  });

  // 4. Match raw unlinked URLs (e.g. https://... or http://...)
  processed = processed.replace(/(^|[\s(])((https?:\/\/[^\s<)]+))/gi, (match, prefix, rawUrl) => {
    const token = `@@LINK_${linkCounter++}@@`;
    linkStore.push({ id: token, url: rawUrl, label: rawUrl });
    return `${prefix}${token}`;
  });

  // 5. Replace bold: **text** or __text__ or <b> / <strong>
  processed = processed.replace(/\*\*([^*]+?)\*\*/g, '@@BOLD_START@@$1@@BOLD_END@@');
  processed = processed.replace(/(?<!\w)__([^_]+?)__(?!\w)/g, '@@BOLD_START@@$1@@BOLD_END@@');
  processed = processed.replace(/<b>([\s\S]*?)<\/b>/gi, '@@BOLD_START@@$1@@BOLD_END@@');
  processed = processed.replace(/<strong>([\s\S]*?)<\/strong>/gi, '@@BOLD_START@@$1@@BOLD_END@@');

  // 6. Replace italic: *text* or _text_ or <i> / <em>
  processed = processed.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '@@ITALIC_START@@$1@@ITALIC_END@@');
  processed = processed.replace(/(?<!\w)_([^_]+?)_(?!\w)/g, '@@ITALIC_START@@$1@@ITALIC_END@@');
  processed = processed.replace(/<i>([\s\S]*?)<\/i>/gi, '@@ITALIC_START@@$1@@ITALIC_END@@');
  processed = processed.replace(/<em>([\s\S]*?)<\/em>/gi, '@@ITALIC_START@@$1@@ITALIC_END@@');

  // 7. Code: `code`
  processed = processed.replace(/`([^`]+)`/g, '@@CODE_START@@$1@@CODE_END@@');

  // Split into segments and construct React elements
  const segments = processed.split(/(@@(?:LINK_\d+|BOLD_START|BOLD_END|ITALIC_START|ITALIC_END|CODE_START|CODE_END)@@)/g);

  const elements: React.ReactNode[] = [];
  let isBold = false;
  let isItalic = false;
  let isCode = false;

  segments.forEach((seg, index) => {
    if (!seg) return;

    if (seg === '@@BOLD_START@@') {
      isBold = true;
      return;
    }
    if (seg === '@@BOLD_END@@') {
      isBold = false;
      return;
    }
    if (seg === '@@ITALIC_START@@') {
      isItalic = true;
      return;
    }
    if (seg === '@@ITALIC_END@@') {
      isItalic = false;
      return;
    }
    if (seg === '@@CODE_START@@') {
      isCode = true;
      return;
    }
    if (seg === '@@CODE_END@@') {
      isCode = false;
      return;
    }

    const matchedLink = linkStore.find((l) => l.id === seg);
    if (matchedLink) {
      elements.push(
        <a
          key={`link-${index}`}
          href={matchedLink.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0a66c2] hover:text-[#084e96] underline underline-offset-2 font-medium inline-flex items-center gap-0.5 break-all cursor-pointer transition-colors"
          title={matchedLink.label}
        >
          <span>{matchedLink.label}</span>
          <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-70 ml-0.5" />
        </a>
      );
      return;
    }

    // Standard text node with active inline formatting
    let content: React.ReactNode = seg;
    if (isCode) {
      content = (
        <code key={`code-${index}`} className="bg-[#f5f5f4] text-[#1c1917] px-1.5 py-0.5 rounded-xs font-mono text-xs border border-[#e7e5e4]">
          {content}
        </code>
      );
    }
    if (isItalic) {
      content = <em key={`em-${index}`} className="italic text-[#44403c]">{content}</em>;
    }
    if (isBold) {
      content = <strong key={`strong-${index}`} className="font-bold text-[#1c1917]">{content}</strong>;
    }

    elements.push(<React.Fragment key={`text-${index}`}>{content}</React.Fragment>);
  });

  return elements;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  fontFamily = 'newsreader',
  fontSize = 'base',
  className = '',
}) => {
  if (!content) return null;

  const fontClass = getFontFamilyClass(fontFamily);
  const sizeClass = getFontSizeClass(fontSize);

  // Split into top-level blocks by double newline
  const blocks = content.split(/\n\n+/);

  return (
    <div className={`${fontClass} ${sizeClass} text-[#292524] space-y-5 ${className}`}>
      {blocks.map((rawBlock, blockIdx) => {
        const block = rawBlock.trim();
        if (!block) return null;

        // Clean up accidental typo 'th#' and normalize any legacy tokens in the block
        let cleanBlock = block;
        if (/^th#+\s*/i.test(cleanBlock)) {
          cleanBlock = cleanBlock.replace(/^th#+\s*/i, '# ');
        }
        cleanBlock = cleanBlock.replace(/_{2,4}BOLD_START_{2,4}([\s\S]*?)_{2,4}BOLD_END_{2,4}/gi, '**$1**');
        cleanBlock = cleanBlock.replace(/_{2,4}(BOLD|ITALIC|CODE)_(START|END)_{2,4}/gi, '');

        // If the entire heading is wrapped in outer asterisks: e.g. **# Title**
        if (cleanBlock.startsWith('**') && cleanBlock.endsWith('**') && cleanBlock.length > 4) {
          cleanBlock = cleanBlock.slice(2, -2).trim();
        }

        // Check for Headings: supports '# ', '## ', '### ', '#### ', and '#**Title**'
        const headingMatch = cleanBlock.match(/^(#{1,6})(?:\s+|\s*(?=\*\*))([\s\S]+)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const headingText = headingMatch[2].trim();

          if (level === 1) {
            return (
              <h1
                key={blockIdx}
                className="text-2xl sm:text-3xl font-serif font-bold text-[#1c1917] mt-8 mb-4 pt-4 border-t border-[#e7e5e4] first:mt-0 first:pt-0 first:border-t-0"
              >
                {renderFormattedInline(headingText)}
              </h1>
            );
          }
          if (level === 2) {
            return (
              <h2
                key={blockIdx}
                className="text-xl sm:text-2xl font-serif font-bold text-[#1c1917] mt-7 mb-3"
              >
                {renderFormattedInline(headingText)}
              </h2>
            );
          }
          if (level === 3) {
            return (
              <h3
                key={blockIdx}
                className="text-lg sm:text-xl font-serif font-semibold text-[#1c1917] mt-6 mb-2"
              >
                {renderFormattedInline(headingText)}
              </h3>
            );
          }
          if (level === 4) {
            return (
              <h4
                key={blockIdx}
                className="text-base sm:text-lg font-serif font-semibold text-[#1c1917] mt-5 mb-2"
              >
                {renderFormattedInline(headingText)}
              </h4>
            );
          }
          if (level >= 5) {
            return (
              <h5
                key={blockIdx}
                className="text-sm sm:text-base font-serif font-semibold text-[#1c1917] mt-4 mb-2"
              >
                {renderFormattedInline(headingText)}
              </h5>
            );
          }
        }

        // Blockquote
        if (block.startsWith('>')) {
          const quoteLines = block
            .split('\n')
            .map((l) => l.replace(/^>\s*/, ''))
            .join(' ');
          return (
            <blockquote
              key={blockIdx}
              className="border-l-3 border-[#1c1917] pl-5 my-5 font-serif italic text-[#44403c] bg-[#f5f4ef]/50 py-3 rounded-xs"
            >
              {renderFormattedInline(quoteLines)}
            </blockquote>
          );
        }

        // Python Console / Code Blocks
        if (block.startsWith('```')) {
          return <PythonConsole key={blockIdx} code={block} />;
        }

        // Horizontal Divider
        if (block === '---' || block === '***' || block === '___') {
          return <hr key={blockIdx} className="my-8 border-[#e7e5e4]" />;
        }

        // Table
        if (block.startsWith('|')) {
          const rows = block.split('\n').filter((r) => !r.includes('---'));
          return (
            <div key={blockIdx} className="my-6 overflow-x-auto">
              <table className="w-full text-left font-sans-clean text-xs border border-[#e7e5e4] bg-white">
                <tbody>
                  {rows.map((row, rIdx) => {
                    const cols = row.split('|').filter((c) => c.trim().length > 0);
                    return (
                      <tr
                        key={rIdx}
                        className={
                          rIdx === 0
                            ? 'bg-[#f5f5f4] font-semibold text-[#1c1917] border-b border-[#e7e5e4]'
                            : 'border-b border-[#e7e5e4] hover:bg-[#faf9f6]'
                        }
                      >
                        {cols.map((col, cIdx) => (
                          <td key={cIdx} className="p-3">
                            {renderFormattedInline(col.trim())}
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

        // Image ![alt](url)
        if (block.startsWith('![')) {
          const imgMatch = block.match(/!\[([^\]]*)\]\(([^)]+)\)/);
          if (imgMatch) {
            const [, alt, src] = imgMatch;
            return (
              <figure key={blockIdx} className="my-6">
                <img
                  src={src}
                  alt={alt || 'Article visual'}
                  className="w-full max-h-[500px] object-cover border border-[#e7e5e4]"
                />
                {alt && (
                  <figcaption className="text-xs font-mono text-center text-[#78716c] mt-2">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          }
        }

        // Bullet list
        if (block.startsWith('* ') || block.startsWith('- ') || block.startsWith('+ ')) {
          const items = block.split('\n').filter(Boolean);
          return (
            <ul key={blockIdx} className="space-y-2 text-[#44403c] my-4 pl-5 list-disc">
              {items.map((item, iIdx) => (
                <li key={iIdx} className="leading-relaxed">
                  {renderFormattedInline(item.replace(/^[*+-]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        // Numbered list
        if (/^\d+\.\s+/.test(block)) {
          const items = block.split('\n').filter(Boolean);
          return (
            <ol key={blockIdx} className="space-y-2 text-[#44403c] my-4 pl-5 list-decimal">
              {items.map((item, iIdx) => (
                <li key={iIdx} className="leading-relaxed">
                  {renderFormattedInline(item.replace(/^\d+\.\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        // Standard Paragraph
        return (
          <p key={blockIdx} className="leading-relaxed whitespace-pre-line">
            {renderFormattedInline(block)}
          </p>
        );
      })}
    </div>
  );
};
