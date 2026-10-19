export const FlipCardPreview = () => {
  return (
    <div className="h-[92px] w-[70px] [perspective:600px]">
      <div className="animate-preview-flip relative size-full [transform-style:preserve-3d] motion-reduce:animate-none">
        <div className="bg-tween-teal absolute inset-0 flex flex-col gap-1.5 rounded-lg p-2.5 [backface-visibility:hidden]">
          <span className="h-[5px] w-3/5 rounded-[3px] bg-white/55" />
          <span className="h-[5px] w-2/5 rounded-[3px] bg-white/55" />
        </div>
        <div className="bg-tween-lime absolute inset-0 flex [transform:rotateY(180deg)] flex-col gap-1.5 rounded-lg p-2.5 [backface-visibility:hidden]">
          <span className="bg-tween-teal/50 h-[5px] w-[70%] rounded-[3px]" />
          <span className="bg-tween-teal/50 h-[5px] w-1/2 rounded-[3px]" />
          <span className="bg-tween-teal/50 h-[5px] w-3/5 rounded-[3px]" />
        </div>
      </div>
    </div>
  );
};
