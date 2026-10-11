'use client';

import NavbarPushMenu from '@/registry/tweenui/navbar-push-menu';

export default function NavbarPushMenuDemo() {
  return (
    <div className="w-full overflow-hidden rounded-xl">
      <NavbarPushMenu className="h-[600px] [[data-block-stage]_&]:h-svh" />
    </div>
  );
}
