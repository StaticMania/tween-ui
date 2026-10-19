import DotBloomButton from '@/registry/tweenui/dot-bloom-button';

const DotBloomButtonDemo = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <DotBloomButton>Get started</DotBloomButton>
      <DotBloomButton variant="secondary">Book a call</DotBloomButton>
    </div>
  );
};

export default DotBloomButtonDemo;
