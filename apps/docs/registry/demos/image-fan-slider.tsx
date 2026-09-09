'use client';

import ImageFanSlider from '@/registry/tweenui/image-fan-slider';

const IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
    alt: 'Portrait one',
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
    alt: 'Portrait two',
  },
  {
    src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
    alt: 'Portrait three',
  },
  {
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
    alt: 'Portrait four',
  },
  {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
    alt: 'Portrait five',
  },
];

export default function ImageFanSliderDemo() {
  return <ImageFanSlider images={IMAGES} />;
}
