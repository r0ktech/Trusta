import {
  Zap,
  Droplet,
  SprayCan,
  Hammer,
  PaintRoller,
  Car,
  Shirt,
  Smartphone,
  Snowflake,
  Scissors,
  BrickWall,
  Brush,
  ChefHat,
  WashingMachine,
  Wrench,
} from 'lucide-react';
import { getCategory } from '../../data/categories';
import { cn } from '../../utils/format';

const ICONS = {
  zap: Zap,
  droplet: Droplet,
  spray: SprayCan,
  hammer: Hammer,
  roller: PaintRoller,
  car: Car,
  shirt: Shirt,
  smartphone: Smartphone,
  snowflake: Snowflake,
  scissors: Scissors,
  bricks: BrickWall,
  brush: Brush,
  chef: ChefHat,
  washer: WashingMachine,
};

export function CategoryIcon({ category, className, ...props }) {
  const Icon = ICONS[getCategory(category)?.icon] ?? Wrench;
  return <Icon className={cn('h-5 w-5', className)} aria-hidden="true" {...props} />;
}
