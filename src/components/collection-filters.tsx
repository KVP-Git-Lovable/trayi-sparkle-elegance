import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { formatINR } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";
import {
  type Facets,
  type Filters,
  isActive,
  optionCount,
} from "@/lib/product-filters";
import { ChevronUp } from "lucide-react";

type ListKey = keyof Omit<Filters, "min" | "max">;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border/60 py-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="font-display text-xl text-foreground">{title}</span>
        <ChevronUp
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "" : "rotate-180"
          }`}
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function OptionList({
  options,
  selected,
  onToggle,
  counts,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  counts: Record<string, number>;
}) {
  return (
    <ul className="space-y-2.5">
      {options.map((o) => {
        const checked = selected.includes(o);
        const count = counts[o] ?? 0;
        return (
          <li key={o}>
            <button
              onClick={() => onToggle(o)}
              disabled={count === 0 && !checked}
              className={`flex w-full items-center gap-3 text-left text-sm transition-colors disabled:opacity-40 ${
                checked ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                aria-hidden
                className={`grid h-4 w-4 shrink-0 place-items-center border ${
                  checked ? "border-foreground bg-foreground" : "border-border"
                }`}
              >
                {checked && (
                  <span className="h-1.5 w-1.5 bg-background" />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate">{o}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{count}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function CollectionFilters({
  products,
  facets,
  filters,
  onChange,
  onClear,
}: {
  products: Product[];
  facets: Facets;
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
  onClear: () => void;
}) {
  const max = facets.maxPrice;
  const currentMax = filters.max > 0 ? Math.min(filters.max, max) : max;
  const [range, setRange] = useState<[number, number]>([filters.min, currentMax]);

  useEffect(() => {
    setRange([filters.min, currentMax]);
  }, [filters.min, currentMax]);

  const counts = (key: ListKey, options: string[]) =>
    Object.fromEntries(
      options.map((o) => [o, optionCount(products, filters, max, key, o)]),
    ) as Record<string, number>;

  const toggle = (key: ListKey) => (value: string) => {
    const list = filters[key];
    onChange({
      [key]: list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value],
    } as Partial<Filters>);
  };

  const commitRange = (next: [number, number]) =>
    onChange({ min: next[0], max: next[1] });

  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-border/60 pb-4">
        <span className="eyebrow">Refine</span>
        {isActive(filters, max) && (
          <button
            onClick={onClear}
            className="text-[11px] uppercase tracking-[0.2em] text-accent hover:underline underline-offset-4"
          >
            Clear all
          </button>
        )}
      </div>

      {max > 0 && (
        <Section title="Price">
          <p className="text-sm text-muted-foreground">
            The highest price is {formatINR(max)}
          </p>
          <div className="mt-5 grid grid-cols-2 items-center gap-3">
            <label className="flex items-center gap-2 border border-border px-3 py-2">
              <span className="text-sm text-muted-foreground">₹</span>
              <input
                type="number"
                min={0}
                max={max}
                value={range[0]}
                onChange={(e) =>
                  setRange([Math.max(0, Number(e.target.value) || 0), range[1]])
                }
                onBlur={() => commitRange([Math.min(range[0], range[1]), range[1]])}
                className="w-full min-w-0 bg-transparent text-sm outline-none"
                aria-label="Minimum price"
              />
            </label>
            <label className="flex items-center gap-2 border border-border px-3 py-2">
              <span className="text-sm text-muted-foreground">₹</span>
              <input
                type="number"
                min={0}
                max={max}
                value={range[1]}
                onChange={(e) => setRange([range[0], Number(e.target.value) || 0])}
                onBlur={() => commitRange([range[0], Math.max(range[0], range[1])])}
                className="w-full min-w-0 bg-transparent text-sm outline-none"
                aria-label="Maximum price"
              />
            </label>
          </div>
          <Slider
            className="mt-6"
            min={0}
            max={max}
            step={Math.max(1, Math.round(max / 200))}
            value={range}
            onValueChange={(v) => setRange([v[0], v[1]] as [number, number])}
            onValueCommit={(v) => commitRange([v[0], v[1]] as [number, number])}
          />
        </Section>
      )}


      {facets.color.length > 0 && (
        <Section title="Colour">
          <OptionList
            options={facets.color}
            selected={filters.color}
            onToggle={toggle("color")}
            counts={counts("color", facets.color)}
          />
        </Section>
      )}

      {facets.size.length > 0 && (
        <Section title="Size">
          <OptionList
            options={facets.size}
            selected={filters.size}
            onToggle={toggle("size")}
            counts={counts("size", facets.size)}
          />
        </Section>
      )}

      {facets.shopFor.length > 0 && (
        <Section title="Shop For">
          <OptionList
            options={facets.shopFor}
            selected={filters.shopFor}
            onToggle={toggle("shopFor")}
            counts={counts("shopFor", facets.shopFor)}
          />
        </Section>
      )}
    </div>
  );
}
