'use client';

import { useState } from 'react';
import VoiceSamplePlayer from '@/registry/tweenui/voice-sample-player';

const SAMPLE_AUDIO = '/audio/tween-ui-voice-sample.mp3';

const SAMPLES = [
  {
    id: 'ada',
    name: 'Ada Lovelace',
    description: 'British female · warm & precise',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=112&h=112&fit=crop&crop=faces',
    src: SAMPLE_AUDIO,
  },
  {
    id: 'grace',
    name: 'Grace Hopper',
    description: 'American female · clear & confident',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=112&h=112&fit=crop&crop=faces',
    src: SAMPLE_AUDIO,
  },
  {
    id: 'alan',
    name: 'Alan Turing',
    description: 'British male · calm & thoughtful',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=112&h=112&fit=crop&crop=faces',
    src: SAMPLE_AUDIO,
  },
];

export default function VoiceSamplePlayerDemo() {
  // Only one sample plays at a time.
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="w-full max-w-[420px] space-y-3">
      {SAMPLES.map((sample) => (
        <VoiceSamplePlayer
          key={sample.id}
          name={sample.name}
          description={sample.description}
          avatar={sample.avatar}
          src={sample.src}
          playing={activeId === sample.id}
          onPlayingChange={(next) => setActiveId(next ? sample.id : null)}
        />
      ))}
    </div>
  );
}
