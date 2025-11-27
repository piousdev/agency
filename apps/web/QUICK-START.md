# Quick Start Guide: Navigation & UX Features

## 🚀 Getting Started

All navigation and UX features are now live in your dashboard. Here's how to use
them:

## Command Palette (`⌘K`)

**Try it now:** Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)

### What you can do:

- 🔍 Search for any page
- ⚡ Execute quick actions
- ⭐ Star your favorite pages
- 🕐 Access recently viewed items
- 📂 Filter by category

### Tips:

- Star frequently used pages for instant access
- Recent items auto-update as you navigate
- Use tab to switch between "All", "Recent", and "Favorites"

## Keyboard Shortcuts (`⌘/`)

**Try it now:** Press `⌘/` (Mac) or `Ctrl+/` (Windows/Linux)

View all available shortcuts organized by category.

## Notification Center

**Location:** Bell icon in header (top right)

- View all notifications
- Filter by unread
- Mark as read/unread
- Delete notifications
- Quick actions

## Sidebar Customization

**Location:** Settings icon in sidebar footer

- Drag sections to reorder
- Toggle visibility with switches
- Reset to default layout
- Changes persist across sessions

## Security Features

### Two-Factor Authentication

1. Go to Dashboard
2. Scroll to "Security & Privacy"
3. Click "Enable 2FA"
4. Follow the setup wizard

### Active Sessions

View and manage all devices where you're signed in:

- See device type, location, IP
- Revoke individual sessions
- Sign out all other devices

## Component Usage

### For Developers

#### Use Recent Items Hook

```tsx
import { useRecentItems } from '@/hooks/use-track-recent';

const { recentItems, addRecentItem } = useRecentItems();

// Track a page visit
addRecentItem({
  id: 'project-123',
  type: 'project',
  title: 'Project Alpha',
  url: '/projects/123',
});
```

#### Use Favorites Hook

```tsx
import { useFavorites } from '@/hooks/use-manage-favorites';

const { favorites, toggleFavorite, isFavorited } = useFavorites();

// Check if favorited
const isStarred = isFavorited('page-id');

// Toggle favorite
toggleFavorite({
  id: 'page-id',
  type: 'page',
  title: 'Dashboard',
  url: '/dashboard',
});
```

#### Use Bulk Selection

```tsx
import { useBulkSelection, BulkActionsBar } from '@/components/default/dashboard/bulk-actions';

const items = [...]; // your data

const {
  selectedIds,
  selectedCount,
  toggleSelection,
  clearSelection,
  selectAll
} = useBulkSelection(items);

// In your render
<BulkActionsBar
  selectedCount={selectedCount}
  onClearSelection={clearSelection}
  actions={[
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash,
      variant: 'destructive',
      action: (ids) => handleDelete(ids)
    }
  ]}
/>
```

#### Use Saved Filters

```tsx
import {
  useSavedFilters,
  SaveFilterDialog,
  SavedFiltersList
} from '@/components/default/dashboard/filters';

const { addFilter } = useSavedFilters();

const currentFilters = [
  { field: 'status', operator: 'is', value: 'active' }
];

// Save button
<SaveFilterDialog
  currentFilters={currentFilters}
  onSave={(name) => addFilter(name, currentFilters)}
/>

// Load button
<SavedFiltersList
  onApplyFilter={(filter) => {
    // Apply the saved filters
    applyFilters(filter.filters);
  }}
/>
```

## Testing Your Integration

### Checklist:

- [ ] Command palette opens with `⌘K`
- [ ] Keyboard shortcuts dialog opens with `⌘/`
- [ ] Pages are tracked in recent items
- [ ] Favorites can be starred/unstarred
- [ ] Notifications show in header
- [ ] Sidebar can be customized
- [ ] 2FA setup works end-to-end
- [ ] Active sessions display correctly

## Troubleshooting

### Command Palette not opening?

- Ensure no other element is capturing the keyboard event
- Check browser console for errors

### localStorage not persisting?

- Check browser privacy settings
- Verify localStorage is not disabled
- Check for quota exceeded errors

### Drag & drop not working?

- Ensure draggable elements have `draggable` attribute
- Check for conflicting event handlers

## Support

For issues or questions:

1. Check `NAVIGATION-FEATURES.md` for detailed documentation
2. Review component source code in `src/components/default/dashboard/`
3. Check browser console for errors
4. Verify all dependencies are installed

## What's Next?

Explore the full feature set:

- Set up 2FA for enhanced security
- Customize your sidebar layout
- Save your frequently used filters
- Star your favorite pages
- Try keyboard shortcuts for faster navigation

Enjoy your enhanced productivity workspace! 🎉
