export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return <div>Blog Detail Page: {params.slug}</div>
}

