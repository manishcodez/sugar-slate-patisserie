import { motion } from 'framer-motion'
import { Heart, MessageCircle } from 'lucide-react'
import { SectionHeading, ScrollReveal } from './ui/Animations'
import { InstagramIcon } from './ui/SocialIcons'
import { INSTAGRAM_POSTS, INSTAGRAM_HANDLE, INSTAGRAM_PROFILE_URL } from '../data/instagramPosts'
import Button from './ui/Button'

export default function InstagramFeed() {
  return (
    <section id="instagram" className="section-padding bg-cream">
      <div className="section-container">
        <SectionHeading
          eyebrow="Follow Our Journey"
          title="On Instagram"
          subtitle="Fresh bakes, celebration moments, and behind-the-scenes from our Varanasi studio."
        />

        <ScrollReveal>
          <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-blush bg-blush/40 px-5 py-3 transition-colors hover:border-caramel"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-cream">
                <InstagramIcon size={20} />
              </div>
              <div>
                <p className="font-semibold text-cocoa">{INSTAGRAM_HANDLE}</p>
                <p className="text-xs text-espresso/60">Follow us for daily inspiration</p>
              </div>
            </a>
            <Button href={INSTAGRAM_PROFILE_URL} variant="secondary" magnetic>
              View on Instagram
            </Button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
          {INSTAGRAM_POSTS.map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 0.05}>
              <motion.a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-[var(--radius-sm)] bg-blush"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={post.image}
                  alt={post.caption}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-espresso/0 opacity-0 transition-all duration-300 group-hover:bg-espresso/50 group-hover:opacity-100">
                  <div className="flex items-center gap-4 text-cream">
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      <Heart size={18} fill="currentColor" /> {post.likes}
                    </span>
                    <MessageCircle size={18} />
                  </div>
                  <p className="px-3 text-center text-xs text-cream/90">{post.caption}</p>
                </div>
              </motion.a>
            </ScrollReveal>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-espresso/50">
          Instagram-style feed preview · Portfolio demo using curated celebration photos
        </p>
      </div>
    </section>
  )
}
