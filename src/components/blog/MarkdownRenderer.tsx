interface MarkdownRendererProps {
  html: string;
}

export default function MarkdownRenderer({ html }: MarkdownRendererProps) {
  return (
    <div
      className="prose prose-zinc max-w-none font-sans
        prose-headings:font-bold prose-headings:text-cBlack
        prose-a:text-cBlack prose-a:no-underline hover:prose-a:underline
        prose-code:font-mono prose-code:text-cBlack prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5
        prose-pre:bg-zinc-100 prose-pre:border prose-pre:border-zinc-200
        prose-blockquote:border-zinc-300 prose-blockquote:text-zinc-500"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
