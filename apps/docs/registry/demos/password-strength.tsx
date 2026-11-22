'use client';

import PasswordStrength from '@/registry/tweenui/password-strength';

const PasswordStrengthDemo = () => {
  return (
    <div className="flex w-full justify-center px-6 text-[#12161F] dark:text-white">
      <PasswordStrength />
    </div>
  );
};

export default PasswordStrengthDemo;
