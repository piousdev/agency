'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';

import { IconFileText, IconSearch, IconX } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { sidebarNavigationWithIcons } from '@/config/navigation-with-icons';

interface SearchResult {
  id: string;
  type: 'page';
  title: string;
  subtitle?: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  group?: string;
}

// Flatten navigation structure to get all pages
function flattenNavigation(): SearchResult[] {
  const results: SearchResult[] = [];
  let id = 0;

  sidebarNavigationWithIcons.forEach((group) => {
    group.items.forEach((item) => {
      // Add main item if it has a URL
      if (item.url) {
        results.push({
          id: String(id++),
          type: 'page',
          title: item.title,
          subtitle: item.description,
          url: item.url,
          icon: item.icon,
          group: group.title,
        });
      }

      // Add sub-items if they exist
      if (item.items) {
        item.items.forEach((subItem) => {
          if (subItem.url) {
            results.push({
              id: String(id++),
              type: 'page',
              title: subItem.title,
              subtitle: subItem.description,
              url: subItem.url,
              icon: item.icon, // Use parent icon
              group: group.title,
            });
          }
        });
      }
    });
  });

  return results;
}

export function CommandSearchBar() {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const router = useRouter();

  // Get all pages from navigation
  const allPages = React.useMemo(() => flattenNavigation(), []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Filter results based on search query
  const filteredResults = React.useMemo(() => {
    if (!searchQuery) return allPages;

    const query = searchQuery.toLowerCase();
    return allPages.filter((page) => {
      const matchesTitle = page.title.toLowerCase().includes(query);
      const matchesSubtitle = page.subtitle?.toLowerCase().includes(query) ?? false;
      const matchesGroup = page.group?.toLowerCase().includes(query) ?? false;
      return matchesTitle || matchesSubtitle || matchesGroup;
    });
  }, [searchQuery, allPages]);

  // Get unique groups from filtered results
  const availableGroups = React.useMemo(() => {
    const groups = new Set(filteredResults.map((r) => r.group).filter(Boolean));
    return Array.from(groups);
  }, [filteredResults]);

  // Filter by active tab (group)
  const displayedResults = React.useMemo(() => {
    if (activeTab === 'all') return filteredResults;
    return filteredResults.filter((r) => r.group === activeTab);
  }, [activeTab, filteredResults]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setSearchQuery('');
    router.push(result.url);
  };

  // Reset active tab when opening if it's not valid
  React.useEffect(() => {
    if (open && activeTab !== 'all' && !availableGroups.includes(activeTab)) {
      setActiveTab('all');
    }
  }, [open, activeTab, availableGroups]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <IconSearch className="mr-2 size-4" />
        <span className="hidden lg:inline-flex">Search by keyword</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <KbdGroup className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <kbd className="text-xs">⌘</kbd>
          <kbd>K</kbd>
        </KbdGroup>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-2xl gap-4 bg-transparent border-none shadow-none p-6"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Search</DialogTitle>
          {/* Search Input - Separate rounded container */}
          <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3 shadow-sm">
            <IconSearch className="size-4 shrink-0 text-muted-foreground" />
            <input
              className="flex h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search by keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="flex size-5 items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <IconX className="size-4" />
              </button>
            )}
          </div>

          {/* Results Container - Separate rounded container */}
          <div className="rounded-lg border bg-background shadow-sm">
            <Command className="rounded-lg bg-transparent" shouldFilter={false}>
              {/* Tabs Section with bottom border attached */}
              <div className="relative border-b px-4 pt-4">
                <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`relative shrink-0 pb-3 text-xs font-semibold transition-colors whitespace-nowrap ${
                      activeTab === 'all'
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All results{' '}
                    <span className="ml-1.5 text-[10px] opacity-75">{filteredResults.length}</span>
                    {activeTab === 'all' && (
                      <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-foreground rounded-t-sm" />
                    )}
                  </button>
                  {availableGroups.map((group) => {
                    if (!group) return null;

                    // Shorten group names for better display
                    const shortName = group
                      .replace(' Management', '')
                      .replace('Client & Service', 'Client & Service')
                      .replace('Collaboration & Content', 'Collaboration')
                      .replace('Insights & Administration', 'Admin');

                    const count = filteredResults.filter((r) => r.group === group).length;
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setActiveTab(group)}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`relative shrink-0 pb-3 text-xs font-semibold transition-colors whitespace-nowrap ${
                          activeTab === group
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {shortName} <span className="ml-1.5 text-[10px] opacity-75">{count}</span>
                        {activeTab === group && (
                          <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-foreground rounded-t-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags Section */}
              <div className="flex flex-wrap gap-2 px-4 py-3 border-b">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === 'all' ? 'bg-accent' : 'bg-background hover:bg-accent'
                  }`}
                >
                  All
                </button>
                {availableGroups.map(
                  (group) =>
                    group && (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setActiveTab(group)}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          activeTab === group ? 'bg-accent' : 'bg-background hover:bg-accent'
                        }`}
                      >
                        {group}
                      </button>
                    )
                )}
              </div>

              {/* Results List with custom scrollbar */}
              <CommandList className="max-h-[400px] overflow-y-auto p-2 scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary/30 [&::-webkit-scrollbar-thumb]:transition-colors">
                <CommandEmpty className="py-6 text-center text-sm">No results found.</CommandEmpty>
                <CommandGroup>
                  {displayedResults.map((result) => {
                    const IconComponent = result.icon;
                    return (
                      <CommandItem
                        key={result.id}
                        value={result.title}
                        onSelect={() => handleSelect(result)}
                        className="flex items-start gap-3 rounded-lg px-3 py-3 aria-selected:bg-accent aria-selected:text-accent-foreground scroll-mt-2"
                      >
                        {IconComponent ? (
                          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <IconComponent className="size-5" />
                          </div>
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <IconFileText className="size-5" />
                          </div>
                        )}
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="font-semibold text-foreground">{result.title}</span>
                          {result.subtitle && (
                            <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                          )}
                          {result.group && (
                            <span className="text-xs text-muted-foreground/70">{result.group}</span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>

              {/* Footer with keyboard shortcuts */}
              <div className="border-t bg-muted/30 px-4 py-3">
                <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <KbdGroup>
                        <Kbd>↑</Kbd>
                        <Kbd>↓</Kbd>
                      </KbdGroup>
                      <span>to navigate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Kbd>↵</Kbd>
                      <span>to select</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Kbd>esc</Kbd>
                    <span>to close</span>
                  </div>
                </div>
              </div>
            </Command>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
