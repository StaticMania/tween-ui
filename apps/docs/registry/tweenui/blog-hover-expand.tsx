'use client';

import { useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BlogHoverExpandPost {
  /** Post title. */
  title: string;
  /** Display date. */
  date: string;
  /** Tags shown as pills. */
  tags: string[];
  /** Cover image URL. */
  image: string;
  /** Alt text for the cover. */
  imageAlt: string;
  /** Link target for the card. */
  href: string;
}

export interface BlogHoverExpandProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting line under the heading. */
  description?: string;
  /** Posts shown in the row. Defaults to a 3-post sample. */
  posts?: BlogHoverExpandPost[];
}

const DEFAULT_TITLE = "Learn what's working now in motion";

const DEFAULT_POSTS: BlogHoverExpandPost[] = [
  {
    title: 'How to brief an AI creative team in one page',
    date: 'March 12, 2026',
    tags: ['Ads', 'Creative'],
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    imageAlt: 'Team reviewing a campaign brief',
    href: '#',
  },
  {
    title: 'SEO playbooks that still work with AI search',
    date: 'March 4, 2026',
    tags: ['SEO', 'Content'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    imageAlt: 'Analytics dashboard for SEO',
    href: '#',
  },
  {
    title: 'Funnel automation without losing the human tone',
    date: 'February 21, 2026',
    tags: ['Funnels', 'Automation'],
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
    imageAlt: 'Team collaborating on a funnel',
    href: '#',
  },
];

export default function BlogHoverExpand({
  title = DEFAULT_TITLE,
  description = 'Playbooks, trends, and real tactics for ads, SEO, funnels, and automation—built for growth-focused teams.',
  posts = DEFAULT_POSTS,
  className,
  ...props
}: BlogHoverExpandProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      data-blog-hover-expand
      data-active-post={activeIndex}
      className={cn('w-full py-14 md:py-20', className)}
      {...props}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-10 px-4 md:space-y-12">
        <div className="space-y-3 text-center">
          <h2 className="text-2xl leading-[1.15] font-normal tracking-tight text-[#12161F] md:text-3xl lg:text-4xl dark:text-white">
            {title}
          </h2>
          <p className="mx-auto max-w-[520px] text-sm leading-relaxed text-[#045f64]/70 dark:text-[#9fd4d6]/80">
            {description}
          </p>
        </div>

        <div className="flex flex-col items-stretch justify-center gap-8 lg:flex-row lg:gap-[30px]">
          {posts.map((post, index) => {
            const active = activeIndex === index;

            return (
              <article
                key={post.href + post.title}
                data-blog-card
                data-active={active ? 'true' : undefined}
                onMouseEnter={() => setActiveIndex(index)}
                onFocusCapture={() => setActiveIndex(index)}
                className={cn(
                  'underline-hover-effect-black group w-full space-y-4 transition-[width] duration-700 ease-in-out motion-reduce:transition-none lg:w-[260px]',
                  active && 'lg:w-[420px]'
                )}
              >
                <a href={post.href} className="block outline-none">
                  <figure className="h-56 w-full overflow-hidden rounded-lg md:h-64">
                    <img
                      src={post.image}
                      alt={post.imageAlt}
                      className="size-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:rotate-2 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0"
                    />
                  </figure>
                </a>
                <div className="space-y-3 px-1">
                  <p className="text-xs text-[#12161F]/70 dark:text-white/60">{post.date}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#045f64]/10 px-3 py-1 text-[11px] text-[#045f64]/70 dark:bg-[#045f64]/20 dark:text-[#9fd4d6]/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a href={post.href} className="blog-title-black no-underline">
                    <h3 className="inline w-full cursor-pointer bg-[linear-gradient(transparent_calc(100%-1px),currentColor_1px)] bg-size-[0%_100%] bg-no-repeat pb-px text-lg font-normal text-[#12161F] transition-all duration-500 ease-[cubic-bezier(0.645,0.045,0.355,1)] group-hover:bg-size-[100%_100%] motion-reduce:transition-none dark:text-white">
                      {post.title}
                    </h3>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
