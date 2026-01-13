import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScrollIndicatorProps {
  targetId?: string;
  className?: string;
}

export function ScrollIndicator({ targetId, className = '' }: ScrollIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Hide scroll indicator after scrolling down a bit
      if (scrollPosition > 200) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    
    // Default: scroll to next section
    window.scrollTo({
      top: window.innerHeight * 0.8,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.button
        onClick={handleClick}
        className="group relative flex flex-col items-center gap-2.5 px-5 py-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200/80 shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-[#1e3a5f]/40 hover:bg-white"
        whileHover={{ scale: 1.05, y: -3 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Scroll down"
      >
        {/* Animated mouse scroll indicator */}
        <div className="relative w-6 h-10 border-2 border-[#1e3a5f]/50 rounded-full flex items-start justify-center pt-1.5 group-hover:border-[#1e3a5f]/70 transition-colors duration-300">
          <motion.div
            className="w-1.5 h-1.5 bg-[#1e3a5f] rounded-full"
            animate={{
              y: [0, 16, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: [0.4, 0, 0.6, 1],
              delay: 0.3
            }}
          />
        </div>
        
        {/* Double chevron for emphasis */}
        <div className="flex flex-col items-center -space-y-1">
          <motion.div
            animate={{
              y: [0, 3, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0
            }}
          >
            <ChevronDown 
              className="w-4 h-4 text-[#1e3a5f]/80 group-hover:text-[#1e3a5f] transition-colors duration-300" 
              strokeWidth={2.5}
            />
          </motion.div>
          <motion.div
            animate={{
              y: [0, 3, 0],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          >
            <ChevronDown 
              className="w-4 h-4 text-[#1e3a5f]/60 group-hover:text-[#1e3a5f]/80 transition-colors duration-300" 
              strokeWidth={2.5}
            />
          </motion.div>
        </div>
        
        {/* Elegant text label */}
        <motion.span
          className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-400 group-hover:text-[#1e3a5f] transition-colors duration-300"
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Scroll
        </motion.span>
        
        {/* Subtle gradient glow on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1e3a5f]/0 via-[#1e3a5f]/0 to-[#1e3a5f]/0 group-hover:from-[#1e3a5f]/5 group-hover:via-[#1e3a5f]/3 group-hover:to-transparent transition-all duration-700 pointer-events-none -z-10" />
      </motion.button>
    </motion.div>
  );
}
