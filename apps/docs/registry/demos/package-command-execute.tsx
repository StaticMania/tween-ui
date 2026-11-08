'use client';

import PackageCommand from '@/registry/tweenui/package-command';

const PackageCommandExecuteDemo = () => {
  return (
    <div className="flex w-full justify-center px-6 text-[#12161F] dark:text-white">
      <PackageCommand kind="execute" packages="shadcn@latest init" />
    </div>
  );
};

export default PackageCommandExecuteDemo;
