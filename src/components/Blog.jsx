import { useState } from 'react'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { BLOG_POSTS } from '../data/blogPosts'
import { SectionHeading, ScrollReveal } from './ui/Animations'
import Modal from './ui/Modal'
import Button from './ui/Button'

function BlogCard({ post, onRead }) {
  return (
    <ScrollReveal>
      <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-blush bg-cream shadow-warm transition-shadow hover:shadow-warm-lg">
        <div className="aspect-[16/10] overflow-hidden bg-blush">
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <span className="mb-2 inline-block w-fit rounded-full bg-caramel/10 px-3 py-0.5 text-xs font-medium text-caramel">
            {post.category}
          </span>
          <h3 className="mb-2 font-display text-xl text-cocoa">{post.title}</h3>
          <p className="mb-4 flex-1 text-sm leading-relaxed text-espresso/70">{post.excerpt}</p>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-espresso/50">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {post.readTime}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRead(post)}
            className="flex items-center gap-1 text-sm font-semibold text-caramel transition-colors hover:text-champagne"
          >
            Read More <ArrowRight size={14} />
          </button>
        </div>
      </article>
    </ScrollReveal>
  )
}

export default function Blog() {
  const [activePost, setActivePost] = useState(null)

  return (
    <section id="blog" className="section-padding bg-blush/40">
      <div className="section-container">
        <SectionHeading
          eyebrow="From Our Kitchen"
          title="Bakery Blog"
          subtitle="Tips, festival guides, and behind-the-scenes stories from Sugar & Slate Patisserie."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {BLOG_POSTS.map((post) => (
            <BlogCard key={post.id} post={post} onRead={setActivePost} />
          ))}
        </div>
      </div>

      <Modal
        isOpen={!!activePost}
        onClose={() => setActivePost(null)}
        ariaLabel={activePost?.title}
      >
        {activePost && (
          <div className="p-6 md:p-8">
            <div className="mb-4 aspect-[16/9] overflow-hidden rounded-[var(--radius-md)] bg-blush">
              <img
                src={activePost.image}
                alt={activePost.title}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="mb-2 inline-block rounded-full bg-caramel/10 px-3 py-0.5 text-xs font-medium text-caramel">
              {activePost.category}
            </span>
            <h2 className="mb-2 font-display text-2xl text-cocoa md:text-3xl">
              {activePost.title}
            </h2>
            <div className="mb-4 flex flex-wrap gap-3 text-xs text-espresso/50">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {activePost.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> {activePost.readTime}
              </span>
            </div>
            <div className="prose-sm space-y-4 text-sm leading-relaxed text-espresso/80 whitespace-pre-line">
              {activePost.content}
            </div>
            <Button className="mt-6" variant="secondary" onClick={() => setActivePost(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </section>
  )
}
