'use client';

import {
  Bold,
  Italic,
  Link2,
  MessageSquarePlus,
  RemoveFormatting,
  Strikethrough,
} from 'lucide-react';
import SpringTooltip from '@/registry/tweenui/spring-tooltip';

const items = [
  { label: 'Bold', shortcut: 'Ctrl B', icon: <Bold /> },
  { label: 'Italic', shortcut: 'Ctrl I', icon: <Italic /> },
  { label: 'Strikethrough', icon: <Strikethrough /> },
  { label: 'Insert link', shortcut: 'Ctrl K', icon: <Link2 /> },
  { label: 'Comment', icon: <MessageSquarePlus /> },
  { label: 'Clear formatting', icon: <RemoveFormatting /> },
];

const SpringTooltipDemo = () => {
  return (
    <div className="flex w-full justify-center px-4 py-16">
      <SpringTooltip items={items} aria-label="Text formatting" />
    </div>
  );
};

export default SpringTooltipDemo;
