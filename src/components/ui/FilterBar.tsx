"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface SelectOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  options: readonly SelectOption[];
  defaultValue?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  showSearch?: boolean;
  searchPlaceholder?: string;
}

const selectClass =
  "border border-vc-border bg-white px-3 py-2 text-xs font-mono tracking-tight text-vc-primary focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer";

export function FilterBar({
  filters,
  showSearch = false,
  searchPlaceholder = "Search...",
}: FilterBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const getParamValue = (key: string, defaultValue = "all") => {
    return searchParams.get(key) ?? defaultValue;
  };

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-vc-border bg-white">
      {filters.map((filter) => (
        <select
          key={filter.key}
          value={getParamValue(filter.key, filter.defaultValue)}
          onChange={(e) => updateParam(filter.key, e.target.value)}
          className={selectClass}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
      {showSearch && (
        <input
          type="text"
          value={getParamValue("q", "")}
          onChange={(e) => updateParam("q", e.target.value)}
          placeholder={searchPlaceholder}
          className="border border-vc-border bg-white px-3 py-2 text-xs font-mono tracking-tight text-vc-primary placeholder:text-vc-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 flex-1 min-w-40"
        />
      )}
    </div>
  );
}
