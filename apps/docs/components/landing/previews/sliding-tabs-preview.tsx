export const SlidingTabsPreview = () => {
  return (
    <div className="bg-tween-ink relative flex gap-0.5 rounded-[10px] p-1">
      <span className="bg-tween-lime animate-preview-tabs absolute top-1 h-[calc(100%-8px)] w-14 rounded-md motion-reduce:animate-none" />
      {['Home', 'Docs', 'Blocks'].map((label) => (
        <span key={label} className="relative z-10 w-14 py-1.5 text-center text-xs text-white">
          {label}
        </span>
      ))}
    </div>
  );
};
