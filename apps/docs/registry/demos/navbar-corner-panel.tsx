'use client';

import NavbarCornerPanel from '@/registry/tweenui/navbar-corner-panel';

const NavbarCornerPanelDemo = () => {
  return (
    <div className="w-full overflow-hidden rounded-xl [[data-block-stage]_&]:rounded-none">
      <NavbarCornerPanel className="h-[600px] [[data-block-stage]_&]:h-svh" />
    </div>
  );
};

export default NavbarCornerPanelDemo;
