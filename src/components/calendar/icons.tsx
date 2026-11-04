// Ilustraciones SVG infantiles para el calendario.
// Vectoriales: nítidas en cualquier resolución.

export function PacifierIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="50" cy="60" r="22" fill="#BDE3F5" stroke="#5BA7D9" strokeWidth="3" />
      <circle cx="50" cy="60" r="9" fill="#5BA7D9" />
      <ellipse cx="50" cy="32" rx="9" ry="13" fill="#5BA7D9" />
      <ellipse cx="50" cy="32" rx="4" ry="7" fill="#3D4A5C" />
    </svg>
  )
}

export function CloudIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M 25,50 Q 8,50 8,38 Q 8,28 20,26 Q 22,14 38,14 Q 52,14 56,26 Q 70,22 76,32 Q 90,32 90,44 Q 90,52 80,52 Z"
        fill="#fff"
        stroke="#5BA7D9"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function RattleIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="50" cy="28" r="20" fill="#C7E8CE" stroke="#6BB58A" strokeWidth="3" />
      <circle cx="42" cy="22" r="4" fill="#6BB58A" />
      <circle cx="58" cy="22" r="4" fill="#6BB58A" />
      <circle cx="50" cy="34" r="4" fill="#6BB58A" />
      <line x1="50" y1="48" x2="50" y2="84" stroke="#5BA7D9" strokeWidth="6" strokeLinecap="round" />
      <circle cx="50" cy="88" r="6" fill="#BDE3F5" stroke="#5BA7D9" strokeWidth="3" />
    </svg>
  )
}

export function BabyFootIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="50" cy="65" rx="22" ry="28" fill="#FBD3DD" stroke="#E48BA3" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="6" fill="#FBD3DD" stroke="#E48BA3" strokeWidth="2" />
      <circle cx="48" cy="22" r="6" fill="#FBD3DD" stroke="#E48BA3" strokeWidth="2" />
      <circle cx="64" cy="22" r="6" fill="#FBD3DD" stroke="#E48BA3" strokeWidth="2" />
      <circle cx="76" cy="30" r="5" fill="#FBD3DD" stroke="#E48BA3" strokeWidth="2" />
    </svg>
  )
}

export function DuckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="-8 -8 116 116" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="50" cy="60" rx="28" ry="22" fill="#FFE9B1" stroke="#E0B865" strokeWidth="2.5" />
      <circle cx="58" cy="36" r="14" fill="#FFE9B1" stroke="#E0B865" strokeWidth="2.5" />
      <path d="M 70,36 L 84,32 L 80,42 Z" fill="#E0B865" />
      <circle cx="55" cy="33" r="2.5" fill="#3D4A5C" />
      <circle cx="62" cy="32" r="1" fill="#fff" />
      <path d="M 28,75 Q 22,80 28,82" fill="#E0B865" />
      <path d="M 72,75 Q 78,80 72,82" fill="#E0B865" />
    </svg>
  )
}

export function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M 12,2 L 14.6,8.6 L 22,9.2 L 16.4,13.8 L 18.2,21 L 12,17 L 5.8,21 L 7.6,13.8 L 2,9.2 L 9.4,8.6 Z"
        fill="#FFE066"
        stroke="#E0B865"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
