/**
 * Scroll behavior for virtualized lists
 * - stick-to-start: Item stays at start of viewport
 * - stick-to-end: Item stays at end of viewport  
 * - jump-on-scroll: Jump to show full pages
 * - center: Keep item centered in viewport (hybrid of start and end)
 */
export type ScrollBehavior = 'stick-to-start' | 'stick-to-end' | 'jump-on-scroll' | 'center';

