import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
export type StockFilter = 'all' | 'in-stock' | 'out-of-stock';

interface ProductFiltersProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export function applyProductFilters<T extends { name: string; stock: number }>(
  products: T[],
  sortBy: SortOption,
  stockFilter: StockFilter,
  getEffectivePrice: (p: T) => number,
  priceRange?: [number, number],
): T[] {
  let result = [...products];

  if (priceRange) {
    result = result.filter((p) => {
      const price = getEffectivePrice(p);
      return price >= priceRange[0] && price <= priceRange[1];
    });
  }

  if (stockFilter === 'in-stock') {
    result = result.filter((p) => p.stock > 0);
  } else if (stockFilter === 'out-of-stock') {
    result = result.filter((p) => p.stock <= 0);
  }

  switch (sortBy) {
    case 'name-asc':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-asc':
      result.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
      break;
    case 'price-desc':
      result.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
      break;
  }

  return result;
}

const ProductFilters = ({ sortBy, onSortChange }: ProductFiltersProps) => {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 w-full">
      <div className="flex items-center gap-2 shrink-0">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-[150px] h-9 rounded-full text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="name-asc">Name A → Z</SelectItem>
            <SelectItem value="name-desc">Name Z → A</SelectItem>
            <SelectItem value="price-asc">Price: Low → High</SelectItem>
            <SelectItem value="price-desc">Price: High → Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProductFilters;
