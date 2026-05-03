'use client';

interface ProseContentProps {
  html: string;
  className?: string;
}

export default function ProseContent({ html, className = '' }: ProseContentProps) {
  return (
    <div
      className={'prose prose-invert max-w-none text-off-white ' + className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
