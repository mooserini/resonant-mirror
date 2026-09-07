import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BOOT_SEQUENCE_STEPS } from '../data/portfolioData';
import { retroAudio } from '../utils/audio';

interface BootSequenceProps {
  onComplete: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    if (currentIndex < BOOT_SEQUENCE_STEPS.length && !isSkipped) {
      const step = BOOT_SEQUENCE_STEPS[currentIndex];
      const timer = setTimeout(() => {
        setLines((prev) => [...prev, step.text]);
        retroAudio.playKeyclick();
        setCurrentIndex((prev) => prev + 1);
      }, step.delay);

      return () => clearTimeout(timer);
    } else if (currentIndex >= BOOT_SEQUENCE_STEPS.length && !isSkipped) {
      retroAudio.playBootSuccess();
      const endTimer = setTimeout(() => {
        onComplete();
      }, 700);
      return () => clearTimeout(endTimer);
    }
  }, [currentIndex, isSkipped, onComplete]);

  // Keyboard shortcut: ESC skips
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSkip = () => {
    setIsSkipped(true);
    retroAudio.playPostBeep(1200, 0.05);
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        id="boot-sequence-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-50 bg-[#0c0d0e] text-[#55ff55] p-4 sm:p-8 md:p-12 overflow-hidden flex flex-col justify-between select-none"
        style={{ textShadow: '0 0 4px rgba(85, 255, 85, 0.4)' }}
      >
        {/* Top BIOS Banner */}
        <div className="border-b border-[#2d552d] pb-3 mb-4 flex flex-wrap justify-between items-center text-xs sm:text-sm text-[#88cc88]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-[#55ff55] rounded-none animate-pulse"></span>
            <span>AT&amp;T PC6300 CGA ROM BIOS // VERSION 2.2</span>
          </div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span className="hidden sm:inline">BASE MEM: 640 KB</span>
            <button
              id="boot-skip-btn"
              onClick={handleSkip}
              className="px-2.5 py-1 text-xs border border-[#55ff55] text-[#55ff55] hover:bg-[#55ff55] hover:text-[#0c0d0e] transition-colors cursor-pointer"
            >
              [ SKIP SEQUENCE: ESC ]
            </button>
          </div>
        </div>

        {/* Boot Terminal Output */}
        <div className="flex-1 font-mono text-xs sm:text-sm md:text-base leading-relaxed overflow-y-auto space-y-1.5 py-2">
          {lines.map((line, idx) => (
            <div key={idx} className="flex items-start">
              <span className="text-[#3b82f6] mr-2">&gt;</span>
              <span className={line.includes('OK') || line.includes('LOADED') || line.includes('VERIFIED') ? 'text-[#a3ffa3]' : ''}>
                {line}
              </span>
            </div>
          ))}
          <div className="inline-block">
            <span className="text-[#3b82f6] mr-2">&gt;</span>
            <span className="cga-cursor bg-[#55ff55]"></span>
          </div>
        </div>

        {/* Bottom Hardware Diagnostics Bar */}
        <div className="border-t border-[#2d552d] pt-3 mt-4 text-[11px] sm:text-xs text-[#66aa66] flex flex-wrap justify-between items-center">
          <div>BUS: 8086-2 (8 MHz) | CGA MODE: 640x400 | CRYPTO: SHA-256 / FIDO2</div>
          <div className="text-right text-[#88cc88]">
            PRESS [ESC] OR [SPACE] TO FAST BOOT
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
