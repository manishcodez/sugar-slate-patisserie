import { motion, useScroll } from 'framer-motion'

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 right-0 z-[100] h-1 origin-left bg-gradient-to-r from-caramel via-champagne to-rose"
      style={{ scaleX: scrollYProgress }}
      aria-hidden="true"
    />
  )
}

export default function ScrollProgress() {
  return <ScrollProgressBar />
}
