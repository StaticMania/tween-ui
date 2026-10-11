'use client';

import NavbarCornerPanel from '@/registry/tweenui/navbar-corner-panel';

export default function NavbarCornerPanelDemo() {
  return (
    <div className="w-full overflow-hidden rounded-xl">
      <NavbarCornerPanel className="h-[600px] [[data-block-stage]_&]:h-svh" />
    </div>
  );
}
