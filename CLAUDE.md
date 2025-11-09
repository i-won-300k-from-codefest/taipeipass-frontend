# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaipeiPass Frontend is a Next.js 16 emergency shelter tracking application for Taipei and New Taipei City. The app displays an interactive map showing shelter locations and emergency contact positions during disaster situations. Built with React 19, TypeScript, and Tailwind CSS 4.

## Development Commands

### Running the Application

- `bun run dev` - Start development server (default: http://localhost:3000). Never run `next dev` directly.
- `bun run build` - Build production bundle
- `bun start` - Start production server
- `bun run lint` - Run ESLint

### Adding UI Components

- **ALWAYS use shadcn/ui CLI** to add new components
- `bunx shadcn@latest add <component-name>` - Add new shadcn/ui component
- Never manually create UI components in `components/ui/` - always use the CLI
- Available components: https://ui.shadcn.com/docs/components

## Architecture

### Core Technologies

- **Framework**: Next.js 16 with App Router
- **React**: Version 19.2.0
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS 4 with CSS variables
- **UI Components**: Radix UI primitives with shadcn/ui (New York style)
- **Animation**: Motion library (framer-motion successor)
- **Maps**: Mapbox GL JS

### Project Structure

```
app/
  ├── layout.tsx          # Root layout with PingFang font configuration
  ├── page.tsx            # Main page with map and news components
  ├── globals.css         # Global styles with CSS variables
  └── assets/fonts/       # PingFang font family (weights: 200-900)

components/
  ├── map.tsx             # Main Mapbox component with shelter/contact visualization
  ├── contactDrawer.tsx   # Emergency contacts drawer
  ├── hamburgerMenu.tsx   # Right-side drawer menu with user profile
  ├── addMemberDrawer.tsx # Add family member interface
  ├── NewsBanner.tsx      # Scrolling news ticker
  ├── NewsDialog.tsx      # News details dialog
  ├── UserStatusDialog.tsx    # User status management
  ├── StatusReportDialog.tsx  # Emergency status reporting
  └── ui/                 # shadcn/ui components

public/
  ├── json/               # Shelter data for 新北市 and 臺北市
  ├── emergency-contacts.json  # Emergency contact data
  ├── current-user.json   # Current user profile
  ├── news.json           # News feed data
  └── avatar/             # User avatars
```

### Key Architectural Patterns

#### Map Component (`components/map.tsx`)

- Loads shelter data from `/public/json/新北市.json` and `/public/json/臺北市.json`
- Uses GeoJSON FeatureCollection format for both shelters and emergency contacts
- Implements clustering for shelters (Mapbox cluster configuration)
- Color coding: Primary (#5ab4c5) for shelters, status-based colors for emergency contacts
- Avatars rendered as circular images with colored borders (primary if at shelter, red if outside)
- Contacts matched to shelters within ~10 meters using coordinate distance calculation
- Popups use custom CSS with dark mode support via `.dark` class detection

#### Data Flow

- Static JSON files in `/public` directory for mock data
- Emergency contacts have `coordinates` field for map placement
- Shelters have properties: `類別`, `地址`, `經度`, `緯度`, `可容納人數`, etc.
- Contact status determined by proximity to shelter coordinates

#### UI Component System

- Uses shadcn/ui with "New York" style variant
- Path alias `@/` points to project root
- Components use `cn()` utility from `lib/utils.ts` for className merging
- Radix UI primitives for: Avatar, Dialog, Drawer, Dropdown Menu, Label, Separator
- Vaul library for drawer implementation

#### Styling Approach

- Tailwind CSS 4 with CSS variables defined in `globals.css`
- Design system colors: primary (cyan), secondary (yellow), orange, grey scales
- Dark mode support via CSS variable switching
- PingFang font loaded via Next.js localFont with 6 weight variants

#### Client Components

All interactive components use `"use client"` directive:

- Map rendering (Mapbox requires browser APIs)
- Drawers and dialogs (interactive state)
- News banner with auto-scroll

## Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox access token (currently set in repo)

## TypeScript Configuration

- Target: ES2017
- Module resolution: bundler (Next.js 16 default)
- JSX: react-jsx (React 19)
- Strict mode enabled
- Path alias: `@/*` maps to project root

## Important Implementation Details

### Adding New Shelters

1. Update JSON files in `/public/json/` following GeoJSON Feature format
2. Required properties: `類別`, `地址`, `經度`, `緯度`, `可容納人數`, `地下樓層數`
3. Coordinates must be in [longitude, latitude] format

### Adding Emergency Contacts

1. Add to `/public/emergency-contacts.json`
2. Required fields: `id`, `name`, `avatar`, `phone`, `relation`, `coordinates`
3. Avatar images in `/public/avatar/`
4. Coordinates determine map placement and shelter matching

### Working with the Map

- Map initialization happens in `useEffect` with cleanup
- All map layers added after `map.on("load")` event
- Shelter clustering configured: max zoom 14, radius 50
- Custom popup styling requires both light and dark mode CSS

### Component Development

- **ALWAYS use shadcn/ui CLI** to add UI components: `bunx shadcn@latest add <component-name>`
- Never manually create components in `components/ui/` directory
- Follow shadcn/ui patterns for new feature components
- Use `cn()` for conditional classNames
- Implement dark mode support via `.dark` selector
- Prefer Radix UI primitives for accessibility

## Common Patterns

### Mock Data Pattern

Currently using static JSON files in `/public`. When integrating real APIs:

- Replace `fetch("/emergency-contacts.json")` calls in components
- Maintain the same data shape for compatibility
- Update TypeScript interfaces if schema changes

### Drawer Pattern

Right-side drawers use Vaul (`direction="right"`):

```tsx
<Drawer direction="right">
    <DrawerTrigger>...</DrawerTrigger>
    <DrawerContent>...</DrawerContent>
</Drawer>
```

### Dialog Pattern

Uses Radix Dialog with controlled state:

```tsx
const [isOpen, setIsOpen] = useState(false);
<Dialog open={isOpen} onOpenChange={setIsOpen}>
```

## Color System

Design system colors (defined in CSS variables):

- Primary: `#5ab4c5` (cyan) - shelters, safe status
- Secondary: `#f5ba4b` (yellow) - medium alert
- Orange: `#fd853a` - contacts, high alert
- Grey scales: 50-900 for UI elements
- Destructive/Red: `#ef4444` - outside shelter status

## Internationalization

Currently Chinese (Traditional) UI text:

- All user-facing strings are in Traditional Chinese
- No i18n library implemented
- Consider next-intl if adding multiple languages
