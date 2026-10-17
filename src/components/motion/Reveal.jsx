import { useInView } from '../../hooks/useInView';
import { cn } from '../../utils/format';

// Fades content up as it scrolls into view. With `stagger`, direct children
// arrive one after another instead of all at once.
export function Reveal({ as: Tag = 'div', variant = 'up', stagger = false, delay = 0, className, style, children, ...props }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      data-stagger={stagger || undefined}
      data-visible={inView || undefined}
      style={delay ? { ...style, '--reveal-delay': `${delay}ms` } : style}
      className={cn('reveal', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
