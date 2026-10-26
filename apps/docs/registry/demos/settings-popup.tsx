'use client';

import { Gauge, Moon, Sparkles, Volume2, Zap } from 'lucide-react';
import SettingsPopup from '@/registry/tweenui/settings-popup';

const toggles = [
  { label: 'Sound', icon: <Volume2 />, defaultChecked: true },
  { label: 'Dark mode', icon: <Moon /> },
];

const choice = {
  label: 'Quality',
  defaultValue: 'high',
  options: [
    { value: 'high', label: 'High', icon: <Sparkles />, hint: 'Recommended' },
    { value: 'low', label: 'Low', icon: <Zap /> },
    { value: 'auto', label: 'Auto', icon: <Gauge /> },
  ],
};

const SettingsPopupDemo = () => {
  return (
    <div className="text-tween-ink flex min-h-88 w-full items-start justify-center px-4 pt-16 dark:text-white">
      <SettingsPopup toggles={toggles} choice={choice} />
    </div>
  );
};

export default SettingsPopupDemo;
