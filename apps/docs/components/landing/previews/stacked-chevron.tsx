export const StackedChevron = ({ className }: Readonly<{ className?: string }>) => {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8 5H10V7H8V5Z" />
      <path d="M11 8H13V10H11V8Z" />
      <path d="M14 11H16V13H14V11Z" />
      <path d="M11 14H13V16H11V14Z" />
      <path d="M8 17H10V19H8V17Z" />
    </svg>
  );
};
