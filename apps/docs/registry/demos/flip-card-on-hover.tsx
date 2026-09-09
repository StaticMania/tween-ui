'use client';

import FlipCardOnHover from '@/registry/tweenui/flip-card-on-hover';

export default function FlipCardOnHoverDemo() {
  return (
    <FlipCardOnHover
      title="Web Design"
      subtitle="Interfaces that convert"
      description="Research-led product and marketing design, from first wireframe to a polished, accessible UI."
      image="https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=640&h=480&fit=crop"
      imageAlt="Designer working at a desk"
      features={['UX & UI design', 'Design systems', 'Prototyping']}
      href="#"
      ctaText="Explore service"
    />
  );
}
