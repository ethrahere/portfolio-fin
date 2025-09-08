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
  category_id?: string; // Keep for backward compatibility
  display_order: number;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  images?: ProjectImage[];
  audios?: ProjectAudio[]; // <-- add this
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
        audios:project_audio(*)
      )
    `)
    .eq('category_id', categoryData.id)
    .order('display_order', { ascending: true, foreignTable: 'project' });
  
  if (error) throw error;
  
  // Transform the data and get all categories for each project
  const projects = await Promise.all((data || []).map(async (item: any) => {
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
      categories: projectCategories?.map((pc: any) => pc.category) || []
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
      audios:project_audio(*)
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
  
  // Transform categories
  if (data.categories) {
    data.categories = data.categories.map((pc: any) => pc.category);
  }
  
  return data;
};

export const getThumbnailForProject = (project: Project): string => {
  const thumbnailImage = project.images?.find(img => img.is_thumbnail);
  return thumbnailImage?.image_url || project.images?.[0]?.image_url || '';
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
  
  // Return original URL if conversion fails
  return storageUrl;
};