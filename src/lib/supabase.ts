import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  year: number;
  medium: string;
  dimensions: string;
  thumbnail_url?: string;
  category_id?: string; // Keep for backward compatibility
  app_link?: string; // URL link for app projects
  display_order: number;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  images?: ProjectImage[];
  audios?: ProjectAudio[];
  videos?: ProjectVideo[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_thumbnail: boolean;
  created_at: string;
}

export interface ProjectAudio {
  id: string;
  project_id: string;
  audio_url: string;
  title: string;
  display_order: number;
  created_at: string;
}

export interface ProjectVideo {
  id: string;
  project_id: string;
  video_url: string;
  title: string;
  display_order: number;
  is_thumbnail: boolean;
  created_at: string;
}

// Database queries
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data || [];
};

export const getProjectsByCategory = async (categorySlug: string): Promise<Project[]> => {
  // First get the category ID
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();
  
  if (categoryError) throw categoryError;
  if (!categoryData) return [];
  
  // Then get projects that belong to this category
  const { data, error } = await supabase
    .from('project_categories')
    .select(`
      project:projects(
        *,
        images:project_images(*),
        audios:project_audio(*),
        videos:project_videos(*)
      )
    `)
    .eq('category_id', categoryData.id)
    .order('display_order', { ascending: true, foreignTable: 'project' });

  if (error) throw error;

  // Transform the data and get all categories for each project
  const projects = await Promise.all((data || []).map(async (item: { project: Project }) => {
    const project = item.project;

    // Get all categories for this project
    const { data: projectCategories } = await supabase
      .from('project_categories')
      .select(`
        category:categories(*)
      `)
      .eq('project_id', project.id);

    return {
      ...project,
      categories: projectCategories?.map((pc: { category: Category }) => pc.category) || []
    };
  }));
  
  return projects;
};

export const getProject = async (categorySlug: string, projectSlug: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      categories:project_categories(
        category:categories(*)
      ),
      images:project_images(*),
      audios:project_audio(*),
      videos:project_videos(*)
    `)
    .eq('project_categories.category.slug', categorySlug)
    .eq('slug', projectSlug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  // Sort images by display_order
  if (data.images) {
    data.images.sort((a: ProjectImage, b: ProjectImage) => a.display_order - b.display_order);
  }
  // Sort audios by display_order
  if (data.audios) {
    data.audios.sort((a: ProjectAudio, b: ProjectAudio) => a.display_order - b.display_order);
  }
  // Sort videos by display_order
  if (data.videos) {
    data.videos.sort((a: ProjectVideo, b: ProjectVideo) => a.display_order - b.display_order);
  }

  // Transform categories
  if (data.categories) {
    data.categories = data.categories.map((pc: { category: Category }) => pc.category);
  }
  return data;
};

export const getThumbnailForProject = (project: Project): string => {
  // First priority: Use thumbnail_url if it exists
  if (project.thumbnail_url) return project.thumbnail_url;

  // Second priority: Find a thumbnail image
  const thumbnailImage = project.images?.find(img => img.is_thumbnail);
  if (thumbnailImage) return thumbnailImage.image_url;

  // Third priority: Use the first image
  if (project.images?.[0]) return project.images[0].image_url;

  // Fourth priority: Find a thumbnail video
  const thumbnailVideo = project.videos?.find(vid => vid.is_thumbnail);
  if (thumbnailVideo) return thumbnailVideo.video_url;

  // Fifth priority: Use the first video
  if (project.videos?.[0]) return project.videos[0].video_url;

  return '';
};

// Helper to convert storage URLs to signed URLs if needed
export const getSignedUrl = async (storageUrl: string, bucket: string = 'images'): Promise<string> => {
  // If it's already a signed URL, return as is
  if (storageUrl.includes('sign/')) {
    return storageUrl;
  }

  // If it's a public URL, convert to signed URL
  if (storageUrl.includes('/storage/v1/object/public/')) {
    // Extract the file path from the public URL
    const urlParts = storageUrl.split('/storage/v1/object/public/');
    if (urlParts.length === 2) {
      const fullPath = urlParts[1]; // e.g., "images/projects/id/filename.jpg"
      const filePath = fullPath.replace(`${bucket}/`, ''); // Remove bucket name from path

      const { data: signedData, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 365 * 24 * 60 * 60); // 1 year expiry

      if (!error && signedData) {
        return signedData.signedUrl;
      }
    }
  }

  // If it's already a signed URL from Supabase storage, return as is
  if (storageUrl.includes('/storage/v1/object/sign/')) {
    return storageUrl;
  }

  // Return original URL if conversion fails
  return storageUrl;
};

// Get latest project thumbnail for each category
export const getLatestProjectThumbnails = async (): Promise<{ [categorySlug: string]: string }> => {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug');

  if (catError || !categories) return {};

  const thumbnails: { [categorySlug: string]: string } = {};

  for (const category of categories) {
    // Get the latest project for this category
    const { data: projectData, error: projError } = await supabase
      .from('project_categories')
      .select(`
        project:projects(
          *,
          images:project_images(*),
          videos:project_videos(*)
        )
      `)
      .eq('category_id', category.id)
      .order('created_at', { ascending: false, foreignTable: 'project' })
      .limit(1);

    if (!projError && projectData && projectData.length > 0) {
      const project = projectData[0].project;

      if (project) {
        // Use the getThumbnailForProject function for consistent logic
        const thumbnail = getThumbnailForProject(project);
        if (thumbnail) {
          thumbnails[category.slug] = thumbnail;
        }
      }
    }
  }

  return thumbnails;
};