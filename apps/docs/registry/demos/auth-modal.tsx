'use client';

import { useState } from 'react';
import AuthModal from '@/registry/tweenui/auth-modal';

export default function AuthModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 cursor-pointer items-center rounded-full bg-[#045f64] px-6 text-sm font-medium text-[#c6f56f] shadow-[0_1px_1px_rgba(16,24,40,0.16)]"
      >
        Sign in
      </button>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
