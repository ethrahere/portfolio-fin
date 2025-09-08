import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Music, Loader2 } from 'lucide-react';
import { 
  uploadImage, 
  uploadAudio, 
  validateImageFile, 
  validateAudioFile,
  addProjectImage,
  addProjectAudio,
  deleteProjectImage,
  deleteProjectAudio,
  updateImageOrder,
  updateAudioOrder,
  getProjectMedia
} from '../lib/adminSupabase';

interface DatabaseMediaFile {
  id: string;
  url: string;
  alt_text?: string;
  title?: string;
  display_order: number;
  is_thumbnail?: boolean;
}

interface DatabaseMediaManagerProps {
  type: 'image' | 'audio';
  projectId: string;
  onMediaChange?: () => void;
}

const DatabaseMediaManager: React.FC<DatabaseMediaManagerProps> = ({ 
  type, 
  projectId,
  onMediaChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<DatabaseMediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing media from database
  useEffect(() => {
    loadMedia();
  }, [projectId, type]);

  const loadMedia = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      const { images, audios } = await getProjectMedia(projectId);
      const mediaFiles = type === 'image' ? images : audios;
      
      setFiles(mediaFiles.map(file => ({
        id: file.id,
        url: file[type === 'image' ? 'image_url' : 'audio_url'],
        alt_text: file.alt_text,
        title: file.title,
        display_order: file.display_order,
        is_thumbnail: file.is_thumbnail
      })));
    } catch (error) {
      console.error(`Error loading ${type} files:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || !projectId) return;

    setUploading(true);
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      try {
        // Validate file
        if (type === 'image') {
          validateImageFile(file);
        } else {
          validateAudioFile(file);
        }

        // Upload file
        let uploadedUrl: string;
        if (type === 'image') {
          uploadedUrl = await uploadImage(file, projectId);
        } else {
          uploadedUrl = await uploadAudio(file, projectId);
        }

        // Add to database
        const nextOrder = Math.max(...files.map(f => f.display_order), 0) + 1;
        
        if (type === 'image') {
          await addProjectImage(
            projectId,
            uploadedUrl,
            file.name,
            nextOrder,
            files.length === 0 // Make first image thumbnail by default
          );
        } else {
          await addProjectAudio(
            projectId,
            uploadedUrl,
            file.name,
            nextOrder
          );
        }

      } catch (error: any) {
        console.error(`Upload error for ${file.name}:`, error);
        alert(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setUploading(false);
    // Reload media from database
    await loadMedia();
    onMediaChange?.();
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      if (type === 'image') {
        await deleteProjectImage(fileId);
      } else {
        await deleteProjectAudio(fileId);
      }

      // Reload media from database
      await loadMedia();
      onMediaChange?.();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}`);
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === files.length - 1)) {
      return;
    }

    const currentFile = files[index];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const targetFile = files[targetIndex];

    try {
      // Swap display orders in database
      if (type === 'image') {
        await updateImageOrder(currentFile.id, targetFile.display_order);
        await updateImageOrder(targetFile.id, currentFile.display_order);
      } else {
        await updateAudioOrder(currentFile.id, targetFile.display_order);
        await updateAudioOrder(targetFile.id, currentFile.display_order);
      }

      // Reload media from database
      await loadMedia();
      onMediaChange?.();
    } catch (error) {
      console.error(`Error reordering ${type}:`, error);
      alert(`Failed to reorder ${type}`);
    }
  };

  const handleMetadataUpdate = async (fileId: string, updates: Partial<DatabaseMediaFile>) => {
    try {
      if (type === 'image') {
        const updateData: any = {};
        if (updates.alt_text !== undefined) updateData.alt_text = updates.alt_text;
        if (updates.is_thumbnail !== undefined) {
          updateData.is_thumbnail = updates.is_thumbnail;
          
          // If setting as thumbnail, unset others first
          if (updates.is_thumbnail) {
            for (const file of files) {
              if (file.id !== fileId && file.is_thumbnail) {
                await updateImageOrder(file.id, file.display_order); // This will trigger an update
                // Update is_thumbnail to false for other images
                const { error } = await import('../lib/supabase').then(m => m.supabase
                  .from('project_images')
                  .update({ is_thumbnail: false })
                  .eq('id', file.id)
                );
                if (error) console.error('Error unsetting thumbnail:', error);
              }
            }
          }
        }

        const { error } = await import('../lib/supabase').then(m => m.supabase
          .from('project_images')
          .update(updateData)
          .eq('id', fileId)
        );
        
        if (error) throw error;
      } else {
        if (updates.title !== undefined) {
          const { error } = await import('../lib/supabase').then(m => m.supabase
            .from('project_audio')
            .update({ title: updates.title })
            .eq('id', fileId)
          );
          
          if (error) throw error;
        }
      }

      // Reload media from database
      await loadMedia();
      onMediaChange?.();
    } catch (error) {
      console.error(`Error updating ${type} metadata:`, error);
      alert(`Failed to update ${type} metadata`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const acceptTypes = type === 'image' 
    ? 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
    : 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac';

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-mono tracking-widest">
          {type === 'image' ? 'IMAGES' : 'AUDIO FILES'}
        </h3>
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono tracking-widest">
          {type === 'image' ? 'IMAGES' : 'AUDIO FILES'}
        </h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !projectId}
          className="inline-flex items-center gap-2 text-xs font-mono border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              UPLOADING...
            </>
          ) : (
            <>
              <Upload size={14} />
              ADD {type.toUpperCase()}
            </>
          )}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptTypes}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={uploading || !projectId}
      />

      {/* Drag and drop area */}
      {projectId && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed p-8 text-center transition-colors ${
            dragOver 
              ? 'border-black bg-gray-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {type === 'image' ? <ImageIcon size={32} className="mx-auto mb-2 text-gray-400" /> : <Music size={32} className="mx-auto mb-2 text-gray-400" />}
          <p className="text-sm font-mono text-gray-600 mb-2">
            Drag & drop {type}s here or click to browse
          </p>
          <p className="text-xs text-gray-500">
            {type === 'image' 
              ? 'Supported: JPEG, PNG, GIF, WebP (max 10MB)'
              : 'Supported: MP3, WAV, OGG, AAC (max 50MB)'
            }
          </p>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file, index) => (
            <div key={file.id} className="border border-gray-300 p-3">
              <div className="flex items-start gap-3">
                {/* Preview */}
                <div className="flex-shrink-0">
                  {type === 'image' ? (
                    <img 
                      src={file.url} 
                      alt={file.alt_text || ''}
                      className="w-16 h-16 object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <Music size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* File info and controls */}
                <div className="flex-1 min-w-0">
                  <div className="grid gap-2">
                    {type === 'image' ? (
                      <>
                        <input
                          type="text"
                          placeholder="Alt text"
                          value={file.alt_text || ''}
                          onChange={(e) => handleMetadataUpdate(file.id, { alt_text: e.target.value })}
                          className="text-xs font-mono border border-gray-300 px-2 py-1"
                        />
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={file.is_thumbnail || false}
                            onChange={(e) => handleMetadataUpdate(file.id, { is_thumbnail: e.target.checked })}
                            className="w-3 h-3"
                          />
                          <span className="font-mono">Thumbnail</span>
                        </label>
                      </>
                    ) : (
                      <input
                        type="text"
                        placeholder="Track title"
                        value={file.title || ''}
                        onChange={(e) => handleMetadataUpdate(file.id, { title: e.target.value })}
                        className="text-xs font-mono border border-gray-300 px-2 py-1"
                      />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleReorder(index, 'up')}
                    disabled={index === 0}
                    className="text-xs px-2 py-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(index, 'down')}
                    disabled={index === files.length - 1}
                    className="text-xs px-2 py-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(file.id, type === 'image' ? (file.alt_text || 'image') : (file.title || 'audio'))}
                    className="p-1 text-red-500 hover:bg-red-50"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatabaseMediaManager;