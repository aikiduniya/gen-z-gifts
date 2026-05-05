import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

const GIFT_EMOJIS = ['🎁', '💄', '🧸', '📱', '👟', '🎮', '💎', '🌸', '🍫', '🎀'];

interface FlyingItem {
  id: number;
  emoji: string;
  startX: number;
  startY: number;
}

const AnimatedBasket = () => {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [itemsInBasket, setItemsInBasket] = useState<string[]>([]);
  const counterRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const spawnItem = () => {
      const id = counterRef.current++;
      const emoji = GIFT_EMOJIS[id % GIFT_EMOJIS.length];
      // spawn from random horizontal positions above
      const startX = Math.random() * 280 - 140;
      const startY = -180;

      setFlyingItems((prev) => [...prev, { id, emoji, startX, startY }]);

      // After animation completes, add to basket pile
      setTimeout(() => {
        setFlyingItems((prev) => prev.filter((i) => i.id !== id));
        setItemsInBasket((prev) => {
          const next = [...prev, emoji];
          return next.length > 6 ? next.slice(next.length - 6) : next;
        });
      }, 900);
    };

    spawnItem();
    intervalRef.current = setInterval(spawnItem, 1400);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="relative flex flex-col items-center select-none" style={{ height: 300 }}>
      {/* Flying items */}
      <AnimatePresence>
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            className="absolute text-3xl pointer-events-none z-20"
            initial={{
              x: item.startX,
              y: item.startY,
              scale: 1.2,
              opacity: 1,
              rotate: -20,
            }}
            animate={{
              x: [item.startX, item.startX * 0.3, 0],
              y: [item.startY, item.startY * 0.4, 60],
              scale: [1.2, 1, 0.6],
              opacity: [1, 1, 0],
              rotate: [-20, 10, 0],
            }}
            transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ top: '50%', left: '50%', marginLeft: -16, marginTop: -16 }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 3D Basket */}
      <motion.div
        className="relative z-10"
        style={{ marginTop: 80 }}
        animate={{
          rotateY: [0, 12, -12, 8, -8, 0],
          y: [0, -8, 0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Items peeking out of basket */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1 z-20">
          <AnimatePresence>
            {itemsInBasket.slice(-4).map((emoji, i) => (
              <motion.span
                key={`${emoji}-${i}`}
                className="text-lg"
                initial={{ y: 20, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {emoji}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* SVG Basket */}
        <svg
          width="160"
          height="130"
          viewBox="0 0 160 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 16px 32px rgba(120,40,200,0.25))' }}
        >
          {/* Basket handle */}
          <path
            d="M45 55 Q80 5 115 55"
            stroke="hsl(270,70%,55%)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Basket body */}
          <rect x="20" y="58" width="120" height="62" rx="12" fill="hsl(270,70%,55%)" opacity="0.15" />
          <rect x="20" y="58" width="120" height="62" rx="12" fill="none" stroke="hsl(270,70%,55%)" strokeWidth="3" />
          {/* Weave lines horizontal */}
          <line x1="20" y1="78" x2="140" y2="78" stroke="hsl(270,70%,55%)" strokeWidth="2" opacity="0.5" />
          <line x1="20" y1="98" x2="140" y2="98" stroke="hsl(270,70%,55%)" strokeWidth="2" opacity="0.5" />
          {/* Weave lines vertical */}
          <line x1="50" y1="58" x2="50" y2="120" stroke="hsl(270,70%,55%)" strokeWidth="2" opacity="0.4" />
          <line x1="80" y1="58" x2="80" y2="120" stroke="hsl(270,70%,55%)" strokeWidth="2" opacity="0.4" />
          <line x1="110" y1="58" x2="110" y2="120" stroke="hsl(270,70%,55%)" strokeWidth="2" opacity="0.4" />
          {/* Basket rim */}
          <rect x="15" y="54" width="130" height="14" rx="7" fill="hsl(330,70%,60%)" />
          {/* Shine */}
          <ellipse cx="55" cy="62" rx="18" ry="4" fill="white" opacity="0.25" />
        </svg>

        {/* Glow under basket */}
        <motion.div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 120,
            height: 16,
            background: 'radial-gradient(ellipse, hsl(270,70%,55%,0.35) 0%, transparent 70%)',
          }}
          animate={{ scaleX: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Sparkle particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xs pointer-events-none"
          style={{
            left: `${20 + i * 17}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedBasket;
