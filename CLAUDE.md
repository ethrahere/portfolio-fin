# CLAUDE.md - Project Documentation

## Project Overview
**PortfolioFin** is a minimalist React/TypeScript portfolio website for "ETHRA" showcasing creative work across multiple categories.

## Tech Stack & Dependencies
- **Frontend Framework**: React 18.3.1 + TypeScript 5.5.3
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1 (minimal black/white theme)
- **Routing**: React Router DOM 7.6.3
- **Database**: Supabase 2.50.5 (PostgreSQL)
- **Icons**: Lucide React 0.344.0
- **Linting**: ESLint 9.9.1 with TypeScript support

## Project Structure
```
/
├── src/
│   ├── App.tsx              # Main router configuration
│   ├── main.tsx             # React app entry point
│   ├── components/
│   │   └── ImageGallery.tsx # Reusable image carousel component
│   ├── pages/
│   │   ├── Home.tsx         # Landing page with category grid
│   │   ├── ThreeD.tsx       # 3D projects listing
│   │   ├── Design.tsx       # Design projects listing
│   │   ├── Music.tsx        # Music projects listing
│   │   ├── Essays.tsx       # Essays listing
│   │   └── Project.tsx      # Individual project detail page
│   └── lib/
│       └── supabase.ts      # Database client & type definitions
├── supabase/
│   └── migrations/          # Database schema migrations
├── public/                  # Static assets
├── package.json            # Dependencies & scripts
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite build configuration
└── tsconfig.*.json         # TypeScript configurations
```

## Database Schema (Supabase)

### Core Tables
1. **categories**
   - `id` (uuid, primary key)
   - `name` (text) - Display name
   - `slug` (text, unique) - URL-friendly identifier
   - `display_order` (integer) - Sort order
   - `created_at` (timestamp)

2. **projects**
   - `id` (uuid, primary key)
   - `title` (text)
   - `slug` (text, unique) - URL-friendly identifier
   - `description` (text)
   - `year` (integer)
   - `medium` (text) - Material/medium used
   - `dimensions` (text) - Physical dimensions
   - `display_order` (integer) - Sort order within category
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

3. **project_categories** (Junction table)
   - `project_id` (uuid, foreign key)
   - `category_id` (uuid, foreign key)
   - `display_order` (integer) - Sort order within category

4. **project_images**
   - `id` (uuid, primary key)
   - `project_id` (uuid, foreign key)
   - `image_url` (text) - Full URL to image
   - `alt_text` (text) - Accessibility description
   - `display_order` (integer) - Order in gallery
   - `is_thumbnail` (boolean) - Used for category listings
   - `created_at` (timestamp)

5. **project_audio**
   - `id` (uuid, primary key)
   - `project_id` (uuid, foreign key)
   - `audio_url` (text) - Full URL to audio file
   - `title` (text) - Track title
   - `display_order` (integer) - Order in playlist
   - `created_at` (timestamp)

## Routing Structure
- `/` - Home page (category grid)
- `/3d` - 3D projects listing
- `/design` - Design projects listing  
- `/music` - Music projects listing
- `/essays` - Essays listing
- `/project/:category/:id` - Individual project detail page

## Key Components

### ImageGallery Component
**Location**: `src/components/ImageGallery.tsx`
**Purpose**: Displays project images with navigation
**Props**:
- `images: string[]` - Array of image URLs
- `projectTitle: string` - For alt text generation

**Features**:
- Thumbnail strip navigation
- Keyboard/click navigation
- Image counter overlay
- Responsive design

### Page Components Pattern
All category pages (3D, Design, Music, Essays) follow the same pattern:
1. Fetch projects using `getProjectsByCategory(categorySlug)`
2. Display loading state
3. Render project grid with thumbnails
4. Link to individual project pages

## Database Helper Functions

### Location: `src/lib/supabase.ts`

**Key Functions**:
- `getCategories()` - Fetch all categories ordered by display_order
- `getProjectsByCategory(categorySlug)` - Get projects for a specific category
- `getProject(categorySlug, projectSlug)` - Get single project with all media
- `getThumbnailForProject(project)` - Get thumbnail URL for project listings

**Environment Variables Required**:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Design System

### Colors
- Primary: Black (`#000000`)
- Background: White (`#ffffff`) 
- Accent: Gray (`#f5f5f5`)
- Hover states: Inverted (black background, white text)

### Typography
- Font Family: Monospace (`font-mono`)
- Headers: `text-2xl md:text-3xl` with `tracking-wide`
- Body: `text-sm` with `tracking-widest` for emphasis
- All caps for navigation and labels

### Layout Patterns
- Max width container: `max-w-6xl mx-auto`
- Padding: `p-8 md:p-16`
- Grid layouts: Responsive with `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Aspect ratios: `aspect-square` for project thumbnails

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Important Notes for Future Changes

1. **Adding New Categories**: 
   - Create entry in `categories` table
   - Create corresponding page component following existing pattern
   - Add route in `App.tsx`

2. **Adding New Project Types**:
   - Extend `Project` interface in `supabase.ts`
   - Create corresponding database table if needed
   - Update database queries to include new data

3. **Styling Changes**:
   - All styles use Tailwind classes
   - Maintain monochrome theme and monospace typography
   - Hover effects should invert colors (black/white swap)

4. **Media Handling**:
   - Images should be optimized before uploading to Supabase Storage
   - Always set proper `alt_text` for accessibility
   - Use `display_order` for consistent ordering

5. **Performance Considerations**:
   - Images are loaded lazily by default
   - Supabase queries include proper ordering and selection
   - Consider adding loading states for better UX

## Contact Information in Code
- Instagram: `https://instagram.com/ethra.here`
- Twitter: `https://x.com/ethra_here` 
- Email: `ethra.here@gmail.com`

## Git & Deployment
- This is not currently a git repository
- No deployment configuration present
- Consider initializing git and setting up CI/CD if needed