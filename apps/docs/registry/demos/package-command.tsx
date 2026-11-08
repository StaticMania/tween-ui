'use client';

import PackageCommand from '@/registry/tweenui/package-command';

const PackageCommandDemo = () => {
  return (
    <div className="flex w-full justify-center px-6 text-[#12161F] dark:text-white">
      <PackageCommand packages={['gsap', '@gsap/react']} />
    </div>
  );
};

export default PackageCommandDemo;
