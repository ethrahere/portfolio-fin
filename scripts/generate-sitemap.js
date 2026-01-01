import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://ethra.art';

// Static pages with their priorities and change frequencies
const staticPages = [
  { url: '/', changefreq: 'weekly', priority: '1.0' },
  { url: '/3d', changefreq: 'weekly', priority: '0.9' },
  { url: '/apps', changefreq: 'weekly', priority: '0.9' },
  { url: '/music', changefreq: 'weekly', priority: '0.9' },
  { url: '/essays', changefreq: 'weekly', priority: '0.9' },
  { url: '/resources', changefreq: 'weekly', priority: '0.9' },
  { url: '/bio', changefreq: 'monthly', priority: '0.8' },
];

// Function to generate basic sitemap with only static routes
function generateBasicSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  staticPages.forEach(page => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${SITE_URL}${page.url}</loc>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';

  const publicDir = path.join(__dirname, '..', 'public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');

  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  console.log(`✅ Basic sitemap generated at ${sitemapPath}`);
  console.log(`   Total URLs: ${staticPages.length} (static routes only)`);
}

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not found - generating basic sitemap with static routes only');
  // Generate basic sitemap without dynamic project URLs
  generateBasicSitemap();
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  try {
    console.log('Fetching categories and projects from database...');

    // Fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug')
      .order('display_order');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    // Fetch all projects with their categories
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        slug,
        updated_at,
        project_categories (
          categories (
            slug
          )
        )
      `)
      .order('updated_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }

    console.log(`Found ${categories?.length || 0} categories and ${projects?.length || 0} projects`);

    // Start building sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${SITE_URL}${page.url}</loc>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });

    // Add dynamic project pages
    if (projects && projects.length > 0) {
      projects.forEach(project => {
        // Get the first category for the project URL
        const categorySlug = project.project_categories?.[0]?.categories?.slug;

        if (categorySlug && project.slug) {
          const lastmod = project.updated_at
            ? new Date(project.updated_at).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          sitemap += '  <url>\n';
          sitemap += `    <loc>${SITE_URL}/project/${categorySlug}/${project.slug}</loc>\n`;
          sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
          sitemap += `    <changefreq>monthly</changefreq>\n`;
          sitemap += `    <priority>0.7</priority>\n`;
          sitemap += '  </url>\n';
        }
      });
    }

    sitemap += '</urlset>';

    // Write sitemap to public directory
    const publicDir = path.join(__dirname, '..', 'public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');

    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log(`✅ Sitemap generated successfully at ${sitemapPath}`);
    console.log(`   Total URLs: ${staticPages.length + (projects?.length || 0)}`);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the sitemap generation
generateSitemap();
