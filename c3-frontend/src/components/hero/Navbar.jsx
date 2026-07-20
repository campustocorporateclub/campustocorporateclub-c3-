import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = ['About', 'Join Us', 'Events', 'Team', 'Contact'];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-6 font-body">
      <a href="/" className="font-display font-bold text-lg text-[#f3f1ee] tracking-wide">
        C3
      </a>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-full p-2 backdrop-blur-md">
        <a href="#home" className="px-4 py-2 text-sm font-semibold rounded-full bg-[#f3f1ee] text-[#0a0a0c]">Home</a>
        {NAV_LINKS.map((label) => (
          <motion.a
            key={label}
            href={`#${label.toLowerCase().replace(' ', '')}`}
            initial="rest"
            whileHover="hover"
            animate="rest"
            className="relative px-4 py-2 text-sm font-semibold rounded-full text-[#9a978f]"
          >
            <motion.span
              variants={{ rest: { color: '#9a978f' }, hover: { color: '#f3f1ee' } }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.span>
            <motion.span
              variants={{ rest: { scaleX: 0, opacity: 0 }, hover: { scaleX: 1, opacity: 1 } }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ originX: 0.5, background: 'linear-gradient(90deg, #ADEFD1, #4f9dbd)' }}
              className="absolute left-3 right-3 bottom-1.5 h-[1.5px] rounded-full"
            />
          </motion.a>
        ))}
      </nav>

      <motion.a
        href="/login"
        whileHover={{ scale: 1.05, boxShadow: '0 0 22px rgba(173,239,209,0.35)' }}
        transition={{ duration: 0.25 }}
        className="hidden sm:inline-block bg-white text-[#0a0a0c] text-sm font-bold px-6 py-3 rounded-full"
      >
        Member Login
      </motion.a>

      {/* Mobile hamburger - the previous version had nothing visible below
          the md breakpoint, so there was no way to reach the nav on phones */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="md:hidden flex flex-col gap-1.5 p-2"
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-[1.5px] bg-[#f3f1ee] transition-transform ${mobileOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
        <span className={`block w-6 h-[1.5px] bg-[#f3f1ee] transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-[1.5px] bg-[#f3f1ee] transition-transform ${mobileOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="md:hidden absolute top-full left-0 right-0 mx-6 mt-2 rounded-2xl bg-[#0a0a0c]/95 border border-white/[0.08] backdrop-blur-md p-4 flex flex-col gap-1"
          >
            {['Home', ...NAV_LINKS].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(' ', '')}`}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-[#f3f1ee] rounded-xl hover:bg-white/[0.06] transition"
              >
                {label}
              </a>
            ))}
            <a
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 text-center bg-white text-[#0a0a0c] text-sm font-bold px-6 py-3 rounded-xl"
            >
              Member Login
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
