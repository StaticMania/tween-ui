'use client';

import { useRef } from 'react';
import ThemeToggleReveal, { type Theme } from '@/registry/tweenui/theme-toggle-reveal';

const ThemeToggleRevealSparksDemo = () => {
  const frameRef = useRef<HTMLDivElement>(null);

  const applyTheme = (theme: Theme) => {
    if (frameRef.current) frameRef.current.dataset.theme = theme;
  };

  return (
    <div
      ref={frameRef}
      data-theme="light"
      className="flex h-full w-full items-center justify-center rounded-xl bg-[#f7f8f8] px-4 text-[#0b1f20] data-[theme=dark]:bg-[#0b1415] data-[theme=dark]:text-[#eef4f4] [[data-block-stage]_&]:fixed [[data-block-stage]_&]:inset-0 [[data-block-stage]_&]:rounded-none"
    >
      <ThemeToggleReveal defaultTheme="light" applyTheme={applyTheme} reveal="sparks" />
    </div>
  );
};

export default ThemeToggleRevealSparksDemo;
