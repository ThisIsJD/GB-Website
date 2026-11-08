import Markdown from 'react-markdown';

type MarkdownContentProps = { children: string };

export function MarkdownContent({ children }: MarkdownContentProps) {
  return (
    <div className="reading-content">
      <Markdown skipHtml>{children}</Markdown>
    </div>
  );
}
