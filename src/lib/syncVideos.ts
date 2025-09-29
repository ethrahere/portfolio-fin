import { supabase } from './supabase';
import { addProjectVideo } from './adminSupabase';

/**
 * Helper function to sync orphaned video files from storage with database
 * This will create database records for videos that exist in storage but not in the database
 */
export const syncOrphanedVideos = async (projectId: string) => {
  try {
    console.log(`Starting sync for project: ${projectId}`);

    // 1. Get all files from storage for this project
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('video')
      .list(`projects/${projectId}`, {
        limit: 100,
        offset: 0,
      });

    if (storageError) {
      console.error('Error listing storage files:', storageError);
      return { success: false, error: storageError.message };
    }

    console.log('Storage files found:', storageFiles);

    // 2. Get existing videos from database
    const { data: dbVideos, error: dbError } = await supabase
      .from('project_videos')
      .select('video_url')
      .eq('project_id', projectId);

    if (dbError) {
      console.error('Error fetching database videos:', dbError);
      return { success: false, error: dbError.message };
    }

    console.log('Database videos found:', dbVideos);

    // 3. Find files that exist in storage but not in database
    const orphanedFiles = storageFiles?.filter(file => {
      // Skip directories
      if (!file.name.includes('.')) return false;

      // Check if this file already has a database record
      return !dbVideos?.some(dbVideo =>
        dbVideo.video_url.includes(file.name)
      );
    }) || [];

    console.log('Orphaned files found:', orphanedFiles);

    if (orphanedFiles.length === 0) {
      console.log('No orphaned files found');
      return { success: true, message: 'No orphaned files found' };
    }

    // 4. Create database records for orphaned files
    const results = [];
    let nextDisplayOrder = (dbVideos?.length || 0) + 1;

    for (const file of orphanedFiles) {
      try {
        // Generate signed URL for the file
        const filePath = `projects/${projectId}/${file.name}`;
        const { data: signedData, error: urlError } = await supabase.storage
          .from('video')
          .createSignedUrl(filePath, 365 * 24 * 60 * 60); // 1 year expiry

        if (urlError || !signedData) {
          console.error(`Error creating signed URL for ${file.name}:`, urlError);
          continue;
        }

        // Add to database
        const title = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension for title
        await addProjectVideo(projectId, signedData.signedUrl, title, nextDisplayOrder);

        results.push({
          fileName: file.name,
          title: title,
          displayOrder: nextDisplayOrder
        });

        nextDisplayOrder++;
        console.log(`Added ${file.name} to database with display order ${nextDisplayOrder - 1}`);

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    return {
      success: true,
      message: `Successfully synced ${results.length} orphaned videos`,
      syncedFiles: results
    };

  } catch (error: unknown) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
};

// Example usage function (for console testing)
export const syncVideosForProject = (projectId: string) => {
  syncOrphanedVideos(projectId).then(result => {
    console.log('Sync result:', result);
  });
};