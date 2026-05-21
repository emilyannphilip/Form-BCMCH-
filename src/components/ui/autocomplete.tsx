import { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectOption?: (value: string) => void;
  options: { value: string; label: string }[];
  isLoading?: boolean;
  placeholder?: string;
  error?: boolean;
  className?: string;
}

export function Autocomplete({
  value,
  onChange,
  onSelectOption,
  options,
  isLoading = false,
  placeholder = 'Search...',
  error = false,
  className,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    if (onSelectOption) {
      onSelectOption(selectedValue);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && value && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
          <div className="p-1">
            {isLoading ? (
              <div className="py-6 flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            ) : options.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No matching employee IDs found.
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{option.value}</span>
                    <span className="text-xs text-muted-foreground">{option.label}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
