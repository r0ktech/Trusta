import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { tone } from '../ui/tones';
import { CategoryIcon } from '../artisans/CategoryIcon';

// A slow band of painted trade names, like the lettering on a danfo.
// The list is rendered twice so the -50% loop is seamless; the copy is hidden
// from screen readers and the tab order. Hover or focus pauses it.
export function TradeTicker() {
  const row = (copy) =>
    CATEGORIES.map((c) => (
      <li key={`${copy}-${c.id}`} aria-hidden={copy ? true : undefined} className="flex shrink-0 items-center">
        <Link
          to={`/explore?category=${c.id}`}
          tabIndex={copy ? -1 : undefined}
          className="font-sign group flex items-center gap-3 px-6 text-[1.7rem] font-extrabold uppercase leading-none text-[#F3F1E7] transition-colors hover:text-[#F2B705] sm:text-[2.1rem]"
        >
          <span
            className="trade-icon flex h-9 w-9 items-center justify-center rounded-full"
            data-icon={c.icon}
            style={{ backgroundColor: tone(c.tone).board, color: tone(c.tone).ink }}
          >
            <CategoryIcon category={c.id} className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </span>
          {c.board}
        </Link>
        <span className="h-2 w-2 rotate-45 bg-[#C98A1E]" aria-hidden="true" />
      </li>
    ));

  return (
    <nav aria-label="Browse trades" className="ticker relative overflow-hidden border-y border-black/20 bg-[#1F2523] py-5">
      <ul className="anim-ticker flex w-max">
        {row(0)}
        {row(1)}
      </ul>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#1F2523] to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#1F2523] to-transparent" aria-hidden="true" />
    </nav>
  );
}
