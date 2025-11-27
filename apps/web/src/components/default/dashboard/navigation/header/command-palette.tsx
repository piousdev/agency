'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';

import {
  IconBolt,
  IconClock,
  IconFileText,
  IconStack,
  IconSearch,
  IconSettings,
  IconStar,
  IconX,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { sidebarNavigationWithIcons } from '@/config/navigation-with-icons';
import { useFavorites } from '@/hooks/use-manage-favorites';
import { useRecentItems } from '@/hooks/use-track-recent';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'page' | 'action' | 'recent' | 'favorite';
  title: string;
  subtitle?: string;
  url?: string;
  action?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  group?: string;
  keywords?: string[];
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
          id: `page-${String(id++)}`,
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
              id: `page-${String(id++)}`,
              type: 'page',
              title: subItem.title,
              subtitle: subItem.description,
              url: subItem.url,
              icon: item.icon,
              group: group.title,
            });
          }
        });
      }
    });
  });

  return results;
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const router = useRouter();

  const { favorites, toggleFavorite, isFavorited } = useFavorites();
  const { recentItems, addRecentItem } = useRecentItems();

  // Get all pages from navigation
  const allPages = React.useMemo(() => flattenNavigation(), []);

  // Global actions
  const actions: SearchResult[] = React.useMemo(
    () => [
      {
        id: 'action-shortcuts',
        type: 'action',
        title: 'Keyboard Shortcuts',
        subtitle: 'View all keyboard shortcuts',
        icon: IconBolt,
        group: 'Actions',
        keywords: ['keyboard', 'shortcuts', 'hotkeys', 'commands'],
        action: () => {
          // TODO: Open shortcuts dialog
          console.log('Open shortcuts dialog');
        },
      },
      {
        id: 'action-settings',
        type: 'action',
        title: 'Settings',
        subtitle: 'Open application settings',
        icon: IconSettings,
        group: 'Actions',
        keywords: ['settings', 'preferences', 'config'],
        action: () => router.push('/settings'),
      },
      {
        id: 'action-theme',
        type: 'action',
        title: 'Toggle Theme',
        subtitle: 'Switch between light and dark mode',
        icon: IconStack,
        group: 'Actions',
        keywords: ['theme', 'dark', 'light', 'mode'],
        action: () => {
          // Theme toggle is handled by the header component
          const event = new KeyboardEvent('keydown', { key: 't', ctrlKey: true });
          document.dispatchEvent(event);
        },
      },
    ],
    [router]
  );

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

  // Combine all searchable items
  const allItems = React.useMemo(() => {
    return [...allPages, ...actions];
  }, [allPages, actions]);

  // Filter results based on search query
  const filteredResults = React.useMemo(() => {
    if (!searchQuery) return allItems;

    const query = searchQuery.toLowerCase();
    return allItems.filter((item) => {
      const matchesTitle = item.title.toLowerCase().includes(query);
      const matchesSubtitle = item.subtitle?.toLowerCase().includes(query) ?? false;
      const matchesGroup = item.group?.toLowerCase().includes(query) ?? false;
      const matchesKeywords = item.keywords?.some((k) => k.toLowerCase().includes(query)) ?? false;
      return matchesTitle || matchesSubtitle || matchesGroup || matchesKeywords;
    });
  }, [searchQuery, allItems]);

  // Get unique groups from filtered results
  const availableGroups = React.useMemo(() => {
    const groups = new Set(filteredResults.map((r) => r.group).filter(Boolean));
    return Array.from(groups);
  }, [filteredResults]);

  // Filter by active tab (group)
  const displayedResults = React.useMemo(() => {
    if (activeTab === 'all') return filteredResults;
    if (activeTab === 'recent') {
      return recentItems.map(
        (item): SearchResult => ({
          id: `recent-${item.id}`,
          type: 'recent',
          title: item.title,
          url: item.url,
          icon: IconClock,
          group: 'Recent',
        })
      );
    }
    if (activeTab === 'favorites') {
      return favorites.map(
        (item): SearchResult => ({
          id: `favorite-${item.id}`,
          type: 'favorite',
          title: item.title,
          url: item.url,
          icon: IconStar,
          group: 'Favorites',
        })
      );
    }
    return filteredResults.filter((r) => r.group === activeTab);
  }, [activeTab, filteredResults, recentItems, favorites]);

  const handleSelect = (result: SearchResult) => {
    if (result.action) {
      result.action();
    } else if (result.url) {
      // Add to recent items
      addRecentItem({
        id: result.id,
        type: result.type === 'page' ? 'page' : 'page',
        title: result.title,
        url: result.url,
      });
      router.push(result.url);
    }
    setOpen(false);
    setSearchQuery('');
  };

  const handleToggleFavorite = (result: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    if (result.url) {
      toggleFavorite({
        id: result.id,
        type: result.type === 'page' ? 'page' : 'page',
        title: result.title,
        url: result.url,
      });
    }
  };

  // Reset active tab when opening if it's not valid
  React.useEffect(() => {
    if (open && activeTab !== 'all' && activeTab !== 'recent' && activeTab !== 'favorites') {
      if (!availableGroups.includes(activeTab)) {
        setActiveTab('all');
      }
    }
  }, [open, activeTab, availableGroups]);

  // Show recent/favorites tabs based on content
  const showRecentTab = recentItems.length > 0;
  const showFavoritesTab = favorites.length > 0;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <IconSearch className="mr-2 size-4" />
        <span className="hidden lg:inline-flex">Search or jump to...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <KbdGroup className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <kbd className="text-xs">⌘</kbd>
          <kbd>K</kbd>
        </KbdGroup>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-2xl gap-4 border-none bg-transparent p-6 shadow-none"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          {/* Search Input - Separate rounded container */}
          <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3 shadow-sm">
            <IconSearch className="size-4 shrink-0 text-muted-foreground" />
            <input
              className="flex h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search pages, actions, or jump to..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Clear search"
              >
                <IconX className="size-4" />
              </button>
            )}
          </div>

          {/* Results Container - Separate rounded container */}
          <div className="rounded-lg border bg-background shadow-sm">
            <Command className="rounded-lg bg-transparent" shouldFilter={false}>
              {/* Tabs Section */}
              {!searchQuery && (
                <div className="relative border-b px-4 pt-4">
                  <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      onMouseDown={(e) => e.preventDefault()}
                      className={cn(
                        'relative shrink-0 pb-3 text-xs font-semibold transition-colors whitespace-nowrap',
                        activeTab === 'all'
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      All
                      {activeTab === 'all' && (
                        <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-t-sm bg-foreground" />
                      )}
                    </button>
                    {showRecentTab && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('recent')}
                        onMouseDown={(e) => e.preventDefault()}
                        className={cn(
                          'relative shrink-0 pb-3 text-xs font-semibold transition-colors whitespace-nowrap',
                          activeTab === 'recent'
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <IconClock className="mr-1.5 inline-block size-3" />
                        Recent
                        {activeTab === 'recent' && (
                          <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-t-sm bg-foreground" />
                        )}
                      </button>
                    )}
                    {showFavoritesTab && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('favorites')}
                        onMouseDown={(e) => e.preventDefault()}
                        className={cn(
                          'relative shrink-0 pb-3 text-xs font-semibold transition-colors whitespace-nowrap',
                          activeTab === 'favorites'
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <IconStar className="mr-1.5 inline-block size-3" />
                        Favorites
                        {activeTab === 'favorites' && (
                          <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-t-sm bg-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Results List */}
              <CommandList className="max-h-[400px] overflow-y-auto scroll-smooth p-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:transition-colors [&::-webkit-scrollbar-thumb]:hover:bg-primary/30">
                <CommandEmpty className="py-6 text-center text-sm">No results found.</CommandEmpty>

                {!searchQuery && activeTab === 'all' && showRecentTab && (
                  <>
                    <CommandGroup heading="Recent">
                      {recentItems.slice(0, 5).map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.title}
                          onSelect={() =>
                            handleSelect({
                              id: item.id,
                              type: 'recent',
                              title: item.title,
                              url: item.url,
                              icon: IconClock,
                            })
                          }
                          className="flex items-start gap-3 rounded-lg px-3 py-3 aria-selected:bg-accent aria-selected:text-accent-foreground"
                        >
                          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <IconClock className="size-5" />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="font-semibold text-foreground">{item.title}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                {!searchQuery && activeTab === 'all' && showFavoritesTab && (
                  <>
                    <CommandGroup heading="Favorites">
                      {favorites.slice(0, 5).map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.title}
                          onSelect={() =>
                            handleSelect({
                              id: item.id,
                              type: 'favorite',
                              title: item.title,
                              url: item.url,
                              icon: IconStar,
                            })
                          }
                          className="flex items-start gap-3 rounded-lg px-3 py-3 aria-selected:bg-accent aria-selected:text-accent-foreground"
                        >
                          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <IconStar className="size-5 fill-current" />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="font-semibold text-foreground">{item.title}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                <CommandGroup>
                  {displayedResults.map((result) => {
                    const IconComponent = result.icon;
                    const isResultFavorited = result.url ? isFavorited(result.id) : false;

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
                          {'subtitle' in result && result.subtitle && (
                            <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                          )}
                          {result.group && (
                            <span className="text-xs text-muted-foreground/70">{result.group}</span>
                          )}
                        </div>
                        {result.url && (
                          <button
                            type="button"
                            onClick={(e) => handleToggleFavorite(result, e)}
                            className="ml-auto flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label={
                              isResultFavorited ? 'Remove from favorites' : 'Add to favorites'
                            }
                          >
                            <IconStar
                              className={cn(
                                'size-4',
                                isResultFavorited && 'fill-current text-yellow-500'
                              )}
                            />
                          </button>
                        )}
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
                      <span>navigate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Kbd>↵</Kbd>
                      <span>select</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Kbd>esc</Kbd>
                    <span>close</span>
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
