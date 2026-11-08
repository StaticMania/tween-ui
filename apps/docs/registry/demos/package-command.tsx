'use client';

import PackageCommand from '@/registry/tweenui/package-command';

const PackageCommandDemo = () => {
  return (
    <div className="flex w-full flex-col items-center gap-4 px-6 text-[#12161F] dark:text-white">
      <PackageCommand packages={['gsap', '@gsap/react']} />
      <PackageCommand packages="vitest @testing-library/react" dev />
    </div>
  );
};

export default PackageCommandDemo;
