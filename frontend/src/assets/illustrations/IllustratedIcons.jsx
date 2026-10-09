import React from 'react';

/**
 * Cute, hand-drawn vector illustrations for CampusFind AI.
 * Warm coral, terracotta, peach, sage, dusty blue, cream tones.
 */

export const BackpackIllustration = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Backpack body shadow */}
    <ellipse cx="50" cy="92" rx="36" ry="6" fill="#44261C" fillOpacity="0.08" />
    {/* Top handle */}
    <path d="M40 24V14C40 10.7 44.5 8 50 8C55.5 8 60 10.7 60 14V24" stroke="#C9563E" strokeWidth="4.5" strokeLinecap="round" />
    {/* Main backpack shape */}
    <rect x="22" y="22" width="56" height="66" rx="22" fill="#E06D53" />
    <path d="M26 40C26 30.06 34.06 22 44 22H56C65.94 22 74 30.06 74 40V46H26V40Z" fill="#F4A261" fillOpacity="0.4" />
    {/* Front pouch */}
    <rect x="30" y="52" width="40" height="30" rx="10" fill="#F4A261" />
    {/* Front pouch flap */}
    <path d="M30 58C30 54 34 50 38 50H62C66 50 70 54 70 58V62H30V58Z" fill="#E76F51" />
    {/* Zipper details */}
    <line x1="36" y1="56" x2="64" y2="56" stroke="#FAF7F2" strokeWidth="2.5" strokeDasharray="3 2" strokeLinecap="round" />
    {/* Cute zipper pull */}
    <circle cx="65" cy="56" r="3.5" fill="#FAF7F2" />
    <circle cx="65" cy="56" r="1.5" fill="#E06D53" />
    {/* Side water bottle pocket */}
    <rect x="18" y="52" width="6" height="24" rx="3" fill="#C9563E" />
    <rect x="76" y="52" width="6" height="24" rx="3" fill="#C9563E" />
    {/* Cute pin badge on pouch */}
    <circle cx="42" cy="70" r="5" fill="#FAF7F2" />
    <circle cx="42" cy="70" r="3.5" fill="#6D9775" />
    {/* Subtle highlight */}
    <path d="M32 28C36 25 42 24 50 24" stroke="#FAF7F2" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.6" />
  </svg>
);

export const WaterBottleIllustration = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="50" cy="92" rx="22" ry="5" fill="#44261C" fillOpacity="0.08" />
    {/* Cap Handle */}
    <path d="M43 14C43 9 46 6 50 6C54 6 57 9 57 14" stroke="#466E82" strokeWidth="4" strokeLinecap="round" />
    {/* Cap */}
    <rect x="41" y="14" width="18" height="12" rx="4" fill="#5D859A" />
    <line x1="43" y1="20" x2="57" y2="20" stroke="#FAF7F2" strokeWidth="1.5" strokeOpacity="0.6" />
    {/* Neck */}
    <rect x="44" y="26" width="12" height="6" fill="#D8E7EE" />
    {/* Body */}
    <rect x="34" y="32" width="32" height="58" rx="14" fill="#5D859A" />
    {/* Silicone sleeve / band */}
    <rect x="34" y="52" width="32" height="24" rx="6" fill="#F4A261" />
    {/* Cute sticker on sleeve */}
    <circle cx="50" cy="64" r="6" fill="#FAF7F2" />
    <path d="M48 64L50 66L53 62" stroke="#E06D53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Light reflection */}
    <path d="M39 36V84" stroke="#FAF7F2" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" />
    {/* Cute water droplet doodle */}
    <path d="M72 38C72 42 68 45 68 45C68 45 64 42 64 38C64 35.8 65.8 34 68 34C70.2 34 72 35.8 72 38Z" fill="#D8E7EE" />
  </svg>
);

export const HeadphonesIllustration = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="50" cy="92" rx="28" ry="5" fill="#44261C" fillOpacity="0.08" />
    {/* Headband arch */}
    <path d="M25 55C25 32 36 14 50 14C64 14 75 32 75 55" stroke="#2C3240" strokeWidth="6" strokeLinecap="round" />
    <path d="M30 40C34 24 42 17 50 17C58 17 66 24 70 40" stroke="#E06D53" strokeWidth="3" strokeLinecap="round" />
    {/* Ear cushions */}
    {/* Left */}
    <rect x="16" y="50" width="16" height="30" rx="8" fill="#F4A261" />
    <rect x="23" y="53" width="7" height="24" rx="3.5" fill="#2C3240" />
    {/* Right */}
    <rect x="68" y="50" width="16" height="30" rx="8" fill="#F4A261" />
    <rect x="70" y="53" width="7" height="24" rx="3.5" fill="#2C3240" />
    {/* Little audio wave doodle */}
    <path d="M88 60C90 63 90 67 88 70" stroke="#6D9775" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M92 56C96 61 96 69 92 74" stroke="#6D9775" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.6" />
    <circle cx="50" cy="14" r="3" fill="#F4A261" />
  </svg>
);

export const KeysIllustration = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="52" cy="90" rx="26" ry="5" fill="#44261C" fillOpacity="0.08" />
    {/* Key ring */}
    <circle cx="42" cy="36" r="16" stroke="#E39D38" strokeWidth="5" />
    {/* Keychain Tag */}
    <rect x="18" y="42" width="22" height="42" rx="7" fill="#E06D53" transform="rotate(-15 18 42)" />
    <circle cx="27" cy="46" r="3" fill="#FAF7F2" />
    <line x1="28" y1="56" x2="36" y2="76" stroke="#FAF7F2" strokeWidth="3" strokeLinecap="round" />
    {/* Key 1 (Long Brass) */}
    <path d="M52 46L76 74" stroke="#E39D38" strokeWidth="6" strokeLinecap="round" />
    <path d="M72 70L76 66" stroke="#E39D38" strokeWidth="5" strokeLinecap="round" />
    <path d="M66 64L70 60" stroke="#E39D38" strokeWidth="5" strokeLinecap="round" />
    {/* Key 2 (Short Silver) */}
    <path d="M46 50L58 84" stroke="#7E8696" strokeWidth="5" strokeLinecap="round" />
    <path d="M54 74L58 73" stroke="#7E8696" strokeWidth="4" strokeLinecap="round" />
    <path d="M51 66L55 65" stroke="#7E8696" strokeWidth="4" strokeLinecap="round" />
    {/* Sparkle */}
    <path d="M74 24L76 18L78 24L84 26L78 28L76 34L74 28L68 26L74 24Z" fill="#F4A261" />
  </svg>
);

export const BooksIllustration = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="50" cy="90" rx="34" ry="6" fill="#44261C" fillOpacity="0.08" />
    {/* Bottom Book (Sage) */}
    <path d="M18 70C28 66 72 66 82 70V84C72 80 28 80 18 84V70Z" fill="#6D9775" />
    <path d="M22 72C30 69 70 69 78 72V81C70 78 30 78 22 81V72Z" fill="#FAF7F2" />
    <rect x="16" y="70" width="7" height="14" rx="3.5" fill="#537B5B" />
    {/* Middle Book (Peach) */}
    <path d="M22 52C30 48 70 48 78 52V65C70 61 30 61 22 65V52Z" fill="#F4A261" />
    <path d="M25 54C32 51 68 51 75 54V62C68 59 32 59 25 62V54Z" fill="#FAF7F2" />
    <rect x="20" y="52" width="6" height="13" rx="3" fill="#C9563E" />
    {/* Top Book (Terracotta) */}
    <path d="M26 34C34 30 66 30 74 34V46C66 42 34 42 26 46V34Z" fill="#E06D53" />
    <path d="M29 36C36 33 64 33 71 36V43C64 40 36 40 29 43V36Z" fill="#FAF7F2" />
    <rect x="24" y="34" width="6" height="12" rx="3" fill="#C9563E" />
    {/* Bookmark hanging out */}
    <path d="M60 44V56L64 53L68 56V44" fill="#E39D38" />
    {/* Cute apple or coffee cup topper */}
    <circle cx="50" cy="24" r="8" fill="#C9563E" />
    <path d="M50 16C50 13 52 11 54 11" stroke="#537B5B" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="54" cy="13" rx="3" ry="1.5" fill="#6D9775" />
  </svg>
);

export const PhoneIllustration = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="50" cy="92" rx="20" ry="5" fill="#44261C" fillOpacity="0.08" />
    {/* Phone case */}
    <rect x="28" y="14" width="44" height="74" rx="14" fill="#F4A261" />
    <rect x="31" y="17" width="38" height="68" rx="11" fill="#FAF7F2" />
    {/* Screen */}
    <rect x="33" y="21" width="34" height="60" rx="8" fill="#1E222D" />
    {/* Speaker notch */}
    <rect x="44" y="17" width="12" height="3" rx="1.5" fill="#C9563E" />
    {/* Cute lockscreen graphic */}
    <circle cx="50" cy="42" r="10" fill="#E06D53" fillOpacity="0.3" />
    <path d="M46 42C46 39.8 47.8 38 50 38C52.2 38 54 39.8 54 42V45H46V42Z" fill="#FAF7F2" />
    <rect x="44" y="44" width="12" height="8" rx="2" fill="#FAF7F2" />
    {/* Time clock */}
    <text x="50" y="34" fill="#FAF7F2" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">10:42</text>
    {/* Cute notification banner */}
    <rect x="36" y="58" width="28" height="12" rx="4" fill="#E06D53" />
    <text x="50" y="66" fill="#FAF7F2" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Item Match! ✨</text>
  </svg>
);

export const IDCardIllustration = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="50" cy="92" rx="26" ry="5" fill="#44261C" fillOpacity="0.08" />
    {/* Lanyard Strap */}
    <path d="M50 6V20" stroke="#E06D53" strokeWidth="6" strokeLinecap="round" />
    <rect x="44" y="18" width="12" height="7" rx="2" fill="#7E8696" />
    <circle cx="50" cy="27" r="3" fill="#7E8696" />
    {/* Badge Card */}
    <rect x="22" y="28" width="56" height="60" rx="10" fill="#FAF7F2" stroke="#E4DACB" strokeWidth="2.5" />
    {/* Header bar */}
    <path d="M24 38C24 32.5 28.5 28 34 28H66C71.5 28 76 32.5 76 38V42H24V38Z" fill="#5D859A" />
    <text x="50" y="37" fill="#FAF7F2" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">CAMPUS ID</text>
    {/* Avatar photo box */}
    <rect x="30" y="48" width="16" height="20" rx="4" fill="#FCE8DB" />
    <circle cx="38" cy="55" r="4" fill="#E06D53" />
    <path d="M33 67C33 63 35 62 38 62C41 62 43 63 43 67" fill="#E06D53" />
    {/* Text lines */}
    <rect x="50" y="50" width="22" height="4" rx="2" fill="#2C3240" />
    <rect x="50" y="58" width="18" height="3" rx="1.5" fill="#7E8696" />
    <rect x="50" y="64" width="14" height="3" rx="1.5" fill="#7E8696" />
    {/* Barcode */}
    <rect x="30" y="74" width="40" height="8" rx="2" fill="#FAF7F2" stroke="#E4DACB" strokeWidth="1" />
    <line x1="34" y1="76" x2="34" y2="80" stroke="#2C3240" strokeWidth="2" />
    <line x1="38" y1="76" x2="38" y2="80" stroke="#2C3240" strokeWidth="1.5" />
    <line x1="42" y1="76" x2="42" y2="80" stroke="#2C3240" strokeWidth="2.5" />
    <line x1="47" y1="76" x2="47" y2="80" stroke="#2C3240" strokeWidth="1" />
    <line x1="51" y1="76" x2="51" y2="80" stroke="#2C3240" strokeWidth="2" />
    <line x1="56" y1="76" x2="56" y2="80" stroke="#2C3240" strokeWidth="3" />
    <line x1="62" y1="76" x2="62" y2="80" stroke="#2C3240" strokeWidth="1.5" />
  </svg>
);

export const UmbrellaIllustration = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="50" cy="92" rx="24" ry="5" fill="#44261C" fillOpacity="0.08" />
    {/* Canopy */}
    <path d="M16 52C16 32 30 16 50 16C70 16 84 32 84 52C84 54 82 55 80 55C76 55 74 52 70 52C66 52 64 55 60 55C56 55 54 52 50 52C46 52 44 55 40 55C36 55 34 52 30 52C26 52 24 55 20 55C18 55 16 54 16 52Z" fill="#E06D53" />
    {/* Stripes */}
    <path d="M30 52C34 35 44 20 50 16C40 22 28 36 20 55C24 55 26 52 30 52Z" fill="#F4A261" />
    <path d="M60 55C56 36 53 20 50 16C60 22 72 36 80 55C76 55 74 52 70 52C66 52 64 55 60 55Z" fill="#F4A261" />
    {/* Tip */}
    <line x1="50" y1="10" x2="50" y2="16" stroke="#2C3240" strokeWidth="3" strokeLinecap="round" />
    {/* Handle shaft */}
    <line x1="50" y1="52" x2="50" y2="78" stroke="#2C3240" strokeWidth="4" />
    {/* Curved handle */}
    <path d="M50 78C50 84 54 88 60 88C66 88 70 84 70 78" stroke="#F4A261" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    {/* Rain droplets */}
    <circle cx="20" cy="24" r="2" fill="#5D859A" />
    <circle cx="82" cy="26" r="2.5" fill="#5D859A" />
  </svg>
);

export const CampusMascot = ({ size = 96, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Findy: The Friendly Campus Owl Mascot */}
    <ellipse cx="60" cy="110" rx="36" ry="6" fill="#44261C" fillOpacity="0.1" />
    {/* Body */}
    <ellipse cx="60" cy="68" rx="34" ry="38" fill="#E06D53" />
    {/* Cute Ears / Feathers */}
    <path d="M34 38L44 48L32 54Z" fill="#C9563E" />
    <path d="M86 38L76 48L88 54Z" fill="#C9563E" />
    {/* Cream Tummy */}
    <ellipse cx="60" cy="74" rx="22" ry="24" fill="#FAF7F2" />
    {/* Tummy feather chevrons */}
    <path d="M54 70L60 74L66 70" stroke="#F4A261" strokeWidth="2" strokeLinecap="round" />
    <path d="M54 78L60 82L66 78" stroke="#F4A261" strokeWidth="2" strokeLinecap="round" />
    {/* Big Cute Eyes */}
    <circle cx="48" cy="54" r="12" fill="#FAF7F2" stroke="#2C3240" strokeWidth="2.5" />
    <circle cx="72" cy="54" r="12" fill="#FAF7F2" stroke="#2C3240" strokeWidth="2.5" />
    {/* Pupils looking curiously */}
    <circle cx="50" cy="54" r="6" fill="#2C3240" />
    <circle cx="70" cy="54" r="6" fill="#2C3240" />
    {/* Eye sparkles */}
    <circle cx="52" cy="52" r="2" fill="#FAF7F2" />
    <circle cx="72" cy="52" r="2" fill="#FAF7F2" />
    {/* Cheerful Blush */}
    <ellipse cx="38" cy="62" rx="4" ry="2.5" fill="#F4A261" />
    <ellipse cx="82" cy="62" rx="4" ry="2.5" fill="#F4A261" />
    {/* Beak */}
    <polygon points="56,60 64,60 60,67" fill="#E39D38" />
    {/* Tiny Detective / Student Hat */}
    <ellipse cx="60" cy="34" rx="20" ry="4" fill="#2C3240" />
    <rect x="48" y="24" width="24" height="10" rx="3" fill="#2C3240" />
    <rect x="48" y="31" width="24" height="3" fill="#E06D53" />
    {/* Magnifying Glass held in hand */}
    <line x1="82" y1="74" x2="102" y2="88" stroke="#F4A261" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="98" cy="74" r="13" stroke="#E39D38" strokeWidth="4" fill="#FAF7F2" fillOpacity="0.7" />
    {/* Lens reflection */}
    <path d="M92 70C94 66 98 65 102 67" stroke="#5D859A" strokeWidth="2" strokeLinecap="round" />
    {/* Little yellow feet */}
    <ellipse cx="48" cy="106" rx="6" ry="3" fill="#E39D38" />
    <ellipse cx="72" cy="106" rx="6" ry="3" fill="#E39D38" />
  </svg>
);

export const EmptyBackpackIllustration = ({ size = 120, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="70" cy="126" rx="46" ry="7" fill="#44261C" fillOpacity="0.08" />
    {/* Soft glowing aura */}
    <circle cx="70" cy="70" r="54" fill="#FCE8DB" fillOpacity="0.4" />
    {/* Cute open backpack */}
    <rect x="36" y="44" width="68" height="74" rx="24" fill="#E06D53" />
    {/* Interior lining showing empty clean space */}
    <ellipse cx="70" cy="46" rx="30" ry="14" fill="#FAF7F2" stroke="#E4DACB" strokeWidth="2.5" />
    <ellipse cx="70" cy="47" rx="24" ry="10" fill="#FCE8DB" />
    {/* Front pouch with sleepy cute eyes */}
    <rect x="46" y="74" width="48" height="36" rx="12" fill="#F4A261" />
    <path d="M56 88C57 91 61 91 62 88" stroke="#2C3240" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M78 88C79 91 83 91 84 88" stroke="#2C3240" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Smile */}
    <path d="M68 94Q70 96 72 94" stroke="#2C3240" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Soft floating sparkle stars */}
    <path d="M108 34L110 28L112 34L118 36L112 38L110 44L108 38L102 36L108 34Z" fill="#F4A261" />
    <path d="M26 62L27 58L28 62L32 63L28 64L27 68L26 64L22 63L26 62Z" fill="#6D9775" />
    <circle cx="114" cy="62" r="3" fill="#E06D53" fillOpacity="0.4" />
    <circle cx="28" cy="38" r="2.5" fill="#E39D38" fillOpacity="0.5" />
  </svg>
);

export const MatchSparkleIllustration = ({ size = 80, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="42" fill="#FEF8EC" />
    {/* Sparkle burst */}
    <path d="M50 16L53 38L75 41L55 52L62 74L47 59L30 73L39 52L20 45L42 38L50 16Z" fill="#E39D38" />
    <circle cx="50" cy="48" r="10" fill="#FAF7F2" />
    <circle cx="50" cy="48" r="6" fill="#E06D53" />
    <circle cx="24" cy="24" r="4" fill="#F4A261" />
    <circle cx="78" cy="26" r="3" fill="#6D9775" />
    <circle cx="76" cy="74" r="4" fill="#E06D53" />
  </svg>
);

export const ClothingIllustration = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="50" cy="92" rx="28" ry="5" fill="#44261C" fillOpacity="0.08" />
    {/* Hanger / neck collar */}
    <path d="M38 22C42 16 58 16 62 22" stroke="#C9563E" strokeWidth="3" strokeLinecap="round" />
    {/* Hoodie / Sweater body */}
    <path d="M34 24L16 38L24 50L32 44V86H68V44L76 50L84 38L66 24C60 28 40 28 34 24Z" fill="#E06D53" />
    {/* Chest color block / stripe */}
    <path d="M32 42H68V58H32V42Z" fill="#F4A261" />
    {/* Front kangaroo pouch */}
    <path d="M38 64H62V78C62 82 58 84 50 84C42 84 38 82 38 78V64Z" fill="#FCE8DB" />
    {/* Pouch pocket stitch lines */}
    <line x1="42" y1="68" x2="58" y2="68" stroke="#E06D53" strokeWidth="2" strokeDasharray="2 2" strokeLinecap="round" />
    {/* Ribbed bottom hem */}
    <rect x="32" y="82" width="36" height="5" rx="2" fill="#C9563E" />
    {/* Ribbed cuff left and right */}
    <rect x="18" y="44" width="7" height="6" rx="2" fill="#C9563E" transform="rotate(-35 18 44)" />
    <rect x="76" y="48" width="7" height="6" rx="2" fill="#C9563E" transform="rotate(35 76 48)" />
    {/* Cute star badge */}
    <circle cx="50" cy="50" r="4.5" fill="#FAF7F2" />
    <path d="M50 48L51 50L53 50.5L51.5 52L52 54L50 53L48 54L48.5 52L47 50.5L49 50L50 48Z" fill="#E39D38" />
    {/* Subtle highlight */}
    <path d="M36 28L40 32" stroke="#FAF7F2" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
  </svg>
);

export const GeneralItemIllustration = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="50" cy="92" rx="30" ry="5" fill="#44261C" fillOpacity="0.08" />
    {/* Lost and found package / mystery box */}
    <rect x="24" y="38" width="52" height="50" rx="12" fill="#FAF7F2" stroke="#E4DACB" strokeWidth="2" />
    {/* Lid / Top border */}
    <rect x="20" y="32" width="60" height="14" rx="7" fill="#E06D53" />
    {/* Ribbon vertical */}
    <rect x="46" y="32" width="8" height="56" fill="#F4A261" />
    {/* Bow on top */}
    <circle cx="50" cy="30" r="5" fill="#E39D38" />
    <path d="M48 30C40 24 38 34 46 32" stroke="#E39D38" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M52 30C60 24 62 34 54 32" stroke="#E39D38" strokeWidth="3" strokeLinecap="round" fill="none" />
    {/* Tag attached */}
    <rect x="56" y="52" width="18" height="24" rx="4" fill="#6D9775" />
    <circle cx="65" cy="56" r="2" fill="#FAF7F2" />
    {/* Question / Sparkle on tag */}
    <text x="65" y="70" fill="#FAF7F2" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">?</text>
    {/* Sparkles floating */}
    <path d="M78 22L79 17L80 22L85 23L80 24L79 29L78 24L73 23L78 22Z" fill="#E39D38" />
    <circle cx="22" cy="26" r="3" fill="#F4A261" />
    <circle cx="78" cy="74" r="2.5" fill="#6D9775" />
  </svg>
);

/**
 * Returns the matching cute illustrated SVG component for a given category.
 * Preserves the warm, consistent CampusFind AI visual identity across all listings.
 */
export function getCategoryIllustration(category, size = 48, className = '') {
  const cat = (category || '').toLowerCase().trim();

  // Bags & Backpacks
  if (cat.includes('bag') || cat.includes('backpack') || cat.includes('tote') || cat.includes('luggage')) {
    return <BackpackIllustration size={size} className={className} />;
  }

  // Accessories (Bottles, flasks, jewelry, watches, etc.)
  if (
    cat.includes('bottle') ||
    cat.includes('drink') ||
    cat.includes('flask') ||
    cat.includes('water') ||
    cat.includes('accessory') ||
    cat.includes('accessories') ||
    cat.includes('watch')
  ) {
    return <WaterBottleIllustration size={size} className={className} />;
  }

  // Electronics (Earphones, phones, mobile, calculator, chargers)
  if (cat.includes('earphone') || cat.includes('headphone') || cat.includes('audio') || cat.includes('airpod')) {
    return <HeadphonesIllustration size={size} className={className} />;
  }
  if (
    cat.includes('phone') ||
    cat.includes('mobile') ||
    cat.includes('electronic') ||
    cat.includes('calculator') ||
    cat.includes('laptop') ||
    cat.includes('charger') ||
    cat.includes('gadget')
  ) {
    return <PhoneIllustration size={size} className={className} />;
  }

  // Keys
  if (cat.includes('key')) {
    return <KeysIllustration size={size} className={className} />;
  }

  // Books & Stationery
  if (
    cat.includes('book') ||
    cat.includes('stationery') ||
    cat.includes('note') ||
    cat.includes('study') ||
    cat.includes('pen') ||
    cat.includes('pencil') ||
    cat.includes('file')
  ) {
    return <BooksIllustration size={size} className={className} />;
  }

  // Documents & Cards
  if (
    cat.includes('id') ||
    cat.includes('card') ||
    cat.includes('document') ||
    cat.includes('wallet') ||
    cat.includes('lanyard') ||
    cat.includes('license')
  ) {
    return <IDCardIllustration size={size} className={className} />;
  }

  // Clothing
  if (
    cat.includes('cloth') ||
    cat.includes('jacket') ||
    cat.includes('hoodie') ||
    cat.includes('shirt') ||
    cat.includes('sweater') ||
    cat.includes('wear') ||
    cat.includes('cap') ||
    cat.includes('hat') ||
    cat.includes('shoe')
  ) {
    return <ClothingIllustration size={size} className={className} />;
  }

  // Umbrella
  if (cat.includes('umbrella') || cat.includes('rain')) {
    return <UmbrellaIllustration size={size} className={className} />;
  }

  // Others / General Fallback
  return <GeneralItemIllustration size={size} className={className} />;
}
