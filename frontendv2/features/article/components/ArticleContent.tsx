interface ArticleContentProps {
  content: string
  className?: string
}

export default function ArticleContent({ content, className = "" }: ArticleContentProps) {
  return (
    <div
      className={`article-content prose prose-lg max-w-none prose-headings:text-grayscale-90 prose-p:text-grayscale-70 prose-a:text-primary-40 prose-img:rounded-lg ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

