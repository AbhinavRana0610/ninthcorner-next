'use client';

declare global {
  interface Window {
    toggleMenu?: () => void;
  }
}

// header.php used onclick="toggleMenu()"; toggleMenu itself is still defined by js/9th.min.js.
export default function MenuButton({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <button className={className} onClick={() => window.toggleMenu?.()}>
      {children}
    </button>
  );
}
