import type { HelpContent } from './types';

interface ContentProps {
  content: HelpContent;
}

/**
 * Content Component
 * Server component for rendering help documentation content
 * Processes markdown-style content into HTML
 */
export function Content({ content }: ContentProps) {
  // Simple markdown-to-HTML conversion for demonstration
  // TODO: Replace with proper MDX rendering when MDX is integrated
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks
      if (line?.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre key={`code-${i}`} className="my-6 w-full overflow-x-auto rounded-lg bg-muted p-4">
              <code className="text-sm font-mono">{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line ?? '');
        continue;
      }

      // Headings
      if (line?.startsWith('# ')) {
        const text = line.slice(2);
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        elements.push(
          <h1 key={`h1-${i}`} id={id} className="mb-4 mt-8 scroll-mt-20 text-3xl font-bold">
            {text}
          </h1>
        );
      } else if (line?.startsWith('## ')) {
        const text = line.slice(3);
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        elements.push(
          <h2 key={`h2-${i}`} id={id} className="mb-3 mt-6 scroll-mt-20 text-2xl font-semibold">
            {text}
          </h2>
        );
      } else if (line?.startsWith('### ')) {
        const text = line.slice(4);
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        elements.push(
          <h3 key={`h3-${i}`} id={id} className="mb-2 mt-5 scroll-mt-20 text-xl font-semibold">
            {text}
          </h3>
        );
      } else if (line?.startsWith('#### ')) {
        const text = line.slice(5);
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        elements.push(
          <h4 key={`h4-${i}`} id={id} className="mb-2 mt-4 scroll-mt-20 text-lg font-semibold">
            {text}
          </h4>
        );
      }
      // Lists
      else if (line?.match(/^[-*]\s/)) {
        const text = line.slice(2);
        elements.push(
          <li key={`li-${i}`} className="ml-6 list-disc text-muted-foreground">
            {text}
          </li>
        );
      }
      // Inline code
      else if (line?.includes('`')) {
        const parts = line.split('`');
        const formatted = parts.map((part, idx) =>
          idx % 2 === 0 ? (
            part
          ) : (
            <code
              key={`${i}-code-${part}`}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
            >
              {part}
            </code>
          )
        );
        elements.push(
          <p key={`p-${i}`} className="mb-4 leading-7 text-foreground">
            {formatted}
          </p>
        );
      }
      // Regular paragraphs
      else if (line?.trim()) {
        elements.push(
          <p key={`p-${i}`} className="mb-4 leading-7 text-foreground">
            {line}
          </p>
        );
      }
      // Empty lines
      else {
        elements.push(<div key={`space-${i}`} className="h-2" />);
      }
    }

    return elements;
  };

  return <article className="space-y-4">{renderContent(content.content)}</article>;
}
