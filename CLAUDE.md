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
│   ├── App.tsx                    # Main router with AuthProvider
│   ├── main.tsx                   # React app entry point
│   ├── components/
│   │   ├── ImageGallery.tsx       # Reusable image carousel component
│   │   └── DatabaseMediaManager.tsx # Database-first media management
│   ├── contexts/
│   │   └── AuthContext.tsx        # Supabase authentication context
│   ├── pages/
│   │   ├── Home.tsx               # Landing page with hover thumbnails
│   │   ├── ThreeD.tsx             # 3D projects listing
│   │   ├── Design.tsx             # Design projects listing
│   │   ├── Music.tsx              # Music projects listing
│   │   ├── Essays.tsx             # Essays listing
│   │   ├── Project.tsx            # Individual project detail page
│   │   └── AdminEnhanced.tsx      # Full admin panel with media management
│   └── lib/
│       ├── supabase.ts            # Database client & type definitions
│       └── adminSupabase.ts       # Admin operations & media management
├── supabase/
│   └── migrations/                # Database schema migrations
├── public/                        # Static assets
├── package.json                   # Dependencies & scripts
├── tailwind.config.js             # Tailwind configuration
├── vite.config.ts                 # Vite build configuration
└── tsconfig.*.json               # TypeScript configurations
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

## Admin Panel Features

### Authentication System
- **Location**: `/admin` (accessible via subtle dot in homepage footer)
- **Authentication**: Supabase Auth with email/password
- **Email**: `ethra.here@gmail.com`
- **Security**: Row Level Security (RLS) policies protect all operations

### Media Management
- **Database-first approach**: All media stored and managed through database
- **Image uploads**: Drag & drop, multiple files, validation (JPEG, PNG, GIF, WebP, max 10MB)
- **Audio uploads**: Drag & drop, multiple files, validation (MP3, WAV, OGG, AAC, max 50MB)
- **Order management**: Up/down buttons update `display_order` in database
- **Real-time updates**: UI refreshes after every database operation
- **Signed URLs**: Uses Supabase signed URLs for secure media access (1-year expiry)

### Project Management
- **CRUD operations**: Create, read, update, delete projects
- **Category assignment**: Multi-category support via junction table
- **Auto-slug generation**: URL-friendly slugs from titles
- **Form validation**: Required fields and proper data types
- **Error handling**: Comprehensive error messages and fallback states

### Workflow
1. **New projects**: Save basic info first, then upload media
2. **Editing projects**: Media loads automatically from database
3. **Media operations**: Upload, reorder, edit metadata, delete
4. **All changes**: Immediately synchronized with database

## Homepage Features

### Responsive Layout
- **Full viewport utilization**: Uses `h-screen` with flexbox layout
- **Mobile**: Stacked boxes with `aspect-[4/3]` ratio
- **Desktop**: 2x2 grid with square boxes filling space between header/footer
- **No scrolling**: Footer always visible in viewport

### Hover Thumbnails
- **Dynamic previews**: Shows latest project thumbnail on hover
- **Smooth transitions**: 300ms opacity fade between text and images
- **Database-driven**: Fetches latest project from each category on page load
- **Fallback graceful**: Shows category text if no thumbnails available

## Technical Implementation Details

### File Upload System
- **Storage**: Supabase Storage with buckets (`images`, `audio`)
- **Path structure**: `projects/{projectId}/{filename}`
- **URL generation**: Signed URLs for secure access
- **Validation**: File type and size validation before upload
- **Error handling**: Comprehensive upload error management

### Database Operations
- **Media management**: Separate functions for images and audio
- **Order management**: `updateImageOrder()` and `updateAudioOrder()`
- **Real-time sync**: `getProjectMedia()` for fresh data loading
- **Transaction safety**: Proper error handling and rollback

### Authentication Flow
- **Context-based**: React Context for auth state management
- **Persistent sessions**: Supabase handles session persistence
- **Admin-only access**: Email validation restricts access
- **Secure operations**: All admin operations require authentication

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
   - **Use DatabaseMediaManager**: All media operations go through database
   - **Signed URLs**: Media uses signed URLs, not public URLs
   - **Order management**: Always update `display_order` in database
   - **Validation**: File type/size validation before upload
   - **Real-time sync**: UI refreshes after database operations

5. **Admin Operations**:
   - **Authentication required**: All admin functions need Supabase auth
   - **Database-first**: No frontend state for media, always fetch from DB
   - **Error handling**: Comprehensive error messages for all operations
   - **RLS policies**: Ensure proper Row Level Security configuration

6. **Performance Considerations**:
   - **Hover thumbnails**: Cached on homepage load for smooth experience
   - **Signed URLs**: Long expiry (1 year) reduces regeneration overhead
   - **Database queries**: Optimized with proper ordering and selection
   - **Loading states**: Comprehensive loading indicators throughout admin panel

## Contact Information in Code
- Instagram: `https://instagram.com/ethra.here`
- Twitter: `https://x.com/ethra_here` 
- Email: `ethra.here@gmail.com`

## Git & Deployment

### Repository
- **GitHub**: https://github.com/ethrahere/portfolio-fin
- **Branch**: main
- **Git user**: ethrahere (ethra.here@gmail.com)

### Deployment
- **Platform**: Vercel (recommended)
- **Repository**: Import from GitHub
- **Environment Variables**: 
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Recent Updates (Session Summary)
1. **Fixed homepage layout**: Full viewport utilization with no scrolling required
2. **Added hover thumbnails**: Dynamic previews of latest projects on homepage hover
3. **Enhanced admin panel**: Complete database-first media management system
4. **Improved authentication**: Supabase Auth integration with RLS policies
5. **Fixed media handling**: Signed URLs, proper order management, real-time sync
6. **Database operations**: Comprehensive CRUD with error handling and validation