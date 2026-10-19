import ArrowTileButton from '@/registry/tweenui/arrow-tile-button';

const ArrowTileButtonDemo = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <ArrowTileButton>Get started</ArrowTileButton>
      <ArrowTileButton variant="swap">Book a call</ArrowTileButton>
    </div>
  );
};

export default ArrowTileButtonDemo;
