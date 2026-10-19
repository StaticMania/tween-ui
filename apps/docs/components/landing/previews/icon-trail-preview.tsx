import { StackedChevron } from './stacked-chevron';

export const IconTrailPreview = () => {
  return (
    <div className="bg-tween-teal text-tween-lime relative flex h-10 w-[150px] items-center rounded-full p-[3px]">
      <span className="bg-tween-lime animate-preview-pill absolute top-[3px] bottom-[3px] left-[3px] grid w-[34px] place-items-center rounded-full motion-reduce:animate-none">
        <StackedChevron className="fill-tween-teal size-[18px]" />
      </span>
      <span className="animate-preview-label relative z-10 ml-11 text-[13px] whitespace-nowrap motion-reduce:animate-none">
        Get started
      </span>
    </div>
  );
};
