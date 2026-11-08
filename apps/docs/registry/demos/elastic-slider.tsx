'use client';

import ElasticSlider from '@/registry/tweenui/elastic-slider';

const ElasticSliderDemo = () => {
  return (
    <div className="flex w-full justify-center px-6 text-[#12161F] dark:text-white">
      <ElasticSlider
        label="Monthly budget"
        min={0}
        max={20000}
        step={100}
        buttonStep={100}
        defaultValue={7500}
        prefix="$"
      />
    </div>
  );
};

export default ElasticSliderDemo;
