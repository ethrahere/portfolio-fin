import { supabase, Project, ProjectImage, ProjectAudio, ProjectVideo, Category } from './supabase';

export interface CreateProjectData {
  title: string;
  slug: string;
  description: string;
  year: number;
  medium: string;
  dimensions: string;
  categoryIds: string[];
  displayOrder?: number;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string;
}

export interface UploadedFile {
  file: File;
  url?: string;
  isUploading?: boolean;
  error?: string;
}

// File upload functions
export const uploadImage = async (file: File, projectId?: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = projectId ? `projects/${projectId}/${fileName}` : `temp/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get signed URL (since public URLs aren't working due to RLS)
  const { data: signedData, error: urlError } = await supabase.storage
    .from('images')
    .createSignedUrl(filePath, 365 * 24 * 60 * 60); // 1 year expiry

  if (urlError) {
    console.error('URL generation error:', urlError);
    throw new Error(`URL generation failed: ${urlError.message}`);
  }

  return signedData.signedUrl;
};

export const uploadAudio = async (file: File, projectId?: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = projectId ? `projects/${projectId}/${fileName}` : `temp/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('audio')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Audio upload error:', uploadError);
    throw new Error(`Audio upload failed: ${uploadError.message}`);
  }

  // Get signed URL (since public URLs aren't working due to RLS)
  const { data: signedData, error: urlError } = await supabase.storage
    .from('audio')
    .createSignedUrl(filePath, 365 * 24 * 60 * 60); // 1 year expiry

  if (urlError) {
    console.error('Audio URL generation error:', urlError);
    throw new Error(`Audio URL generation failed: ${urlError.message}`);
  }

  return signedData.signedUrl;
};

export const uploadVideo = async (file: File, projectId?: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = projectId ? `projects/${projectId}/${fileName}` : `temp/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('video')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Video upload error:', uploadError);
    throw new Error(`Video upload failed: ${uploadError.message}`);
  }

  // Get signed URL (since public URLs aren't working due to RLS)
  const { data: signedData, error: urlError } = await supabase.storage
    .from('video')
    .createSignedUrl(filePath, 365 * 24 * 60 * 60); // 1 year expiry

  if (urlError) {
    console.error('Video URL generation error:', urlError);
    throw new Error(`Video URL generation failed: ${urlError.message}`);
  }

  return signedData.signedUrl;
};

// Project media management
export const addProjectImage = async (projectId: string, imageUrl: string, altText: string, displayOrder: number, isThumbnail: boolean = false): Promise<ProjectImage> => {
  const { data, error } = await supabase
    .from('project_images')
    .insert([{
      project_id: projectId,
      image_url: imageUrl,
      alt_text: altText,
      display_order: displayOrder,
      is_thumbnail: isThumbnail
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addProjectAudio = async (projectId: string, audioUrl: string, title: string, displayOrder: number): Promise<ProjectAudio> => {
  const { data, error } = await supabase
    .from('project_audio')
    .insert([{
      project_id: projectId,
      audio_url: audioUrl,
      title: title,
      display_order: displayOrder
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addProjectVideo = async (projectId: string, videoUrl: string, title: string = '', displayOrder: number): Promise<ProjectVideo> => {
  const { data, error } = await supabase
    .from('project_videos')
    .insert([{
      project_id: projectId,
      video_url: videoUrl,
      title: title,
      display_order: displayOrder,
      is_thumbnail: false
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProjectImage = async (imageId: string): Promise<void> => {
  const { error } = await supabase
    .from('project_images')
    .delete()
    .eq('id', imageId);

  if (error) throw error;
};

export const deleteProjectAudio = async (audioId: string): Promise<void> => {
  const { error } = await supabase
    .from('project_audio')
    .delete()
    .eq('id', audioId);

  if (error) throw error;
};

export const deleteProjectVideo = async (videoId: string): Promise<void> => {
  const { error } = await supabase
    .from('project_videos')
    .delete()
    .eq('id', videoId);

  if (error) throw error;
};

// Update image order in database
export const updateImageOrder = async (imageId: string, newOrder: number): Promise<void> => {
  const { error } = await supabase
    .from('project_images')
    .update({ display_order: newOrder })
    .eq('id', imageId);

  if (error) throw error;
};

// Update audio order in database
export const updateAudioOrder = async (audioId: string, newOrder: number): Promise<void> => {
  const { error } = await supabase
    .from('project_audio')
    .update({ display_order: newOrder })
    .eq('id', audioId);

  if (error) throw error;
};

// Update video order in database
export const updateVideoOrder = async (videoId: string, newOrder: number): Promise<void> => {
  const { error } = await supabase
    .from('project_videos')
    .update({ display_order: newOrder })
    .eq('id', videoId);

  if (error) throw error;
};

// Get project with fresh media data
export const getProjectMedia = async (projectId: string): Promise<{ images: ProjectImage[], audios: ProjectAudio[], videos: ProjectVideo[] }> => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      images:project_images(*),
      audios:project_audio(*),
      videos:project_videos(*)
    `)
    .eq('id', projectId)
    .single();

  if (error) throw error;

  // Sort by display_order
  const images = (data?.images || []).sort((a: ProjectImage, b: ProjectImage) => a.display_order - b.display_order);
  const audios = (data?.audios || []).sort((a: ProjectAudio, b: ProjectAudio) => a.display_order - b.display_order);
  const videos = (data?.videos || []).sort((a: ProjectVideo, b: ProjectVideo) => a.display_order - b.display_order);

  return { images, audios, videos };
};

// Enhanced project CRUD with better error handling
export const createProjectAdmin = async (projectData: CreateProjectData): Promise<{ project: Project, success: boolean, error?: string }> => {
  try {
    const { categoryIds, ...project } = projectData;
    
    // Insert project
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert([{
        ...project,
        display_order: projectData.displayOrder || 1,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return { project: null as Project, success: false, error: projectError.message };
    }

    // Insert project-category relationships
    if (categoryIds.length > 0) {
      const relationships = categoryIds.map(categoryId => ({
        project_id: newProject.id,
        category_id: categoryId
      }));

      const { error: relationError } = await supabase
        .from('project_categories')
        .insert(relationships);

      if (relationError) {
        console.error('Category relation error:', relationError);
        // If relation fails, still return the project but with error
        return { project: newProject, success: false, error: `Project created but category assignment failed: ${relationError.message}` };
      }
    }

    return { project: newProject, success: true };
  } catch (error: unknown) {
    console.error('Create project error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { project: null as Project, success: false, error: errorMessage };
  }
};

export const updateProjectAdmin = async (projectData: UpdateProjectData): Promise<{ project: Project, success: boolean, error?: string }> => {
  try {
    const { id, categoryIds, ...updates } = projectData;
    
    // Update project with explicit updated_at
    const { data: updatedProject, error: projectError } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (projectError) {
      console.error('Project update error:', projectError);
      return { project: null as Project, success: false, error: projectError.message };
    }

    // Update category relationships if provided
    if (categoryIds !== undefined) {
      // First, try to delete existing relationships
      const { error: deleteError } = await supabase
        .from('project_categories')
        .delete()
        .eq('project_id', id);

      if (deleteError) {
        console.error('Delete relations error:', deleteError);
        // Continue anyway, might be RLS issue
      }

      // Insert new relationships
      if (categoryIds.length > 0) {
        const relationships = categoryIds.map(categoryId => ({
          project_id: id,
          category_id: categoryId
        }));

        const { error: relationError } = await supabase
          .from('project_categories')
          .insert(relationships);

        if (relationError) {
          console.error('Insert relations error:', relationError);
          return { project: updatedProject, success: false, error: `Project updated but category assignment failed: ${relationError.message}` };
        }
      }
    }

    return { project: updatedProject, success: true };
  } catch (error: unknown) {
    console.error('Update project error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { project: null as Project, success: false, error: errorMessage };
  }
};

export const deleteProjectAdmin = async (projectId: string): Promise<{ success: boolean, error?: string }> => {
  try {
    // Delete in reverse order of dependencies
    
    // Delete project-category relationships
    await supabase.from('project_categories').delete().eq('project_id', projectId);
    
    // Delete project images
    await supabase.from('project_images').delete().eq('project_id', projectId);
    
    // Delete project audio
    await supabase.from('project_audio').delete().eq('project_id', projectId);

    // Delete project videos
    await supabase.from('project_videos').delete().eq('project_id', projectId);
    
    // Delete project
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (projectError) {
      console.error('Delete project error:', projectError);
      return { success: false, error: projectError.message };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Delete project error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
};

export const getAllProjectsAdmin = async (): Promise<Project[]> => {
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get projects error:', error);
    throw error;
  }

  // Transform data
  return (data || []).map((project: Project & { categories?: { category: Category }[] }) => ({
    ...project,
    categories: project.categories?.map((pc: { category: Category }) => pc.category) || []
  }));
};

// Generate URL-friendly slug
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Utility functions
export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid image type. Supported: JPEG, PNG, GIF, WebP');
  }
  
  if (file.size > maxSize) {
    throw new Error('Image too large. Max size: 10MB');
  }
  
  return true;
};

export const validateAudioFile = (file: File): boolean => {
  const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid audio type. Supported: MP3, WAV, OGG, AAC');
  }

  if (file.size > maxSize) {
    throw new Error('Audio file too large. Max size: 50MB');
  }

  return true;
};

export const validateVideoFile = (file: File): boolean => {
  const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid video type. Supported: MP4, WebM, OGG, MOV, AVI');
  }

  if (file.size > maxSize) {
    throw new Error('Video file too large. Max size: 100MB');
  }

  return true;
};