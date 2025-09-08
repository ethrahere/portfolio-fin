import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Music, Loader2 } from 'lucide-react';
import { uploadImage, uploadAudio, validateImageFile, validateAudioFile } from '../lib/adminSupabase';

export interface MediaFile {
  id?: string;
  url: string;
  alt_text?: string;
  title?: string;
  display_order: number;
  is_thumbnail?: boolean;
  isUploading?: boolean;
  error?: string;
  file?: File;
}

interface MediaUploaderProps {
  type: 'image' | 'audio';
  files: MediaFile[];
  onFilesChange: (files: MediaFile[]) => void;
  projectId?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  type, 
  files, 
  onFilesChange,
  projectId 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    Array.from(selectedFiles).forEach((file, index) => {
      try {
        // Validate file
        if (type === 'image') {
          validateImageFile(file);
        } else {
          validateAudioFile(file);
        }

        // Create temporary file entry
        const newFile: MediaFile = {
          url: URL.createObjectURL(file),
          display_order: files.length + index + 1,
          isUploading: true,
          file,
          ...(type === 'image' ? { alt_text: file.name } : { title: file.name })
        };

        const updatedFiles = [...files, newFile];
        onFilesChange(updatedFiles);

        // Upload file
        uploadFile(file, updatedFiles.length - 1);
      } catch (error: any) {
        console.error('File validation error:', error);
        alert(`File ${file.name}: ${error.message}`);
      }
    });
  };

  const uploadFile = async (file: File, fileIndex: number) => {
    try {
      let uploadedUrl: string;
      
      if (type === 'image') {
        uploadedUrl = await uploadImage(file, projectId);
      } else {
        uploadedUrl = await uploadAudio(file, projectId);
      }

      // Update the file with uploaded URL
      const updatedFiles = [...files];
      updatedFiles[fileIndex] = {
        ...updatedFiles[fileIndex],
        url: uploadedUrl,
        isUploading: false,
        file: undefined // Remove file object after upload
      };
      onFilesChange(updatedFiles);

    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Update file with error
      const updatedFiles = [...files];
      updatedFiles[fileIndex] = {
        ...updatedFiles[fileIndex],
        isUploading: false,
        error: error.message
      };
      onFilesChange(updatedFiles);
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

  const removeFile = async (index: number) => {
    const fileToRemove = files[index];
    
    // Ask for confirmation if this is an existing file
    if (fileToRemove.id) {
      const fileName = type === 'image' ? (fileToRemove.alt_text || 'image') : (fileToRemove.title || 'audio file');
      if (!window.confirm(`Are you sure you want to permanently delete this ${type}: "${fileName}"?`)) {
        return;
      }
      
      try {
        // Import delete functions dynamically to avoid circular imports
        const { deleteProjectImage, deleteProjectAudio } = await import('../lib/adminSupabase');
        
        if (type === 'image') {
          await deleteProjectImage(fileToRemove.id);
        } else {
          await deleteProjectAudio(fileToRemove.id);
        }
        
        console.log(`Deleted ${type} from database:`, fileToRemove.id);
      } catch (error) {
        console.error(`Error deleting ${type} from database:`, error);
        alert(`Failed to delete ${type}. Please try again.`);
        return;
      }
    }
    
    // Remove from UI
    const updatedFiles = files.filter((_, i) => i !== index);
    // Reorder display_order
    updatedFiles.forEach((file, i) => {
      file.display_order = i + 1;
    });
    onFilesChange(updatedFiles);
  };

  const updateFileMetadata = (index: number, updates: Partial<MediaFile>) => {
    const updatedFiles = [...files];
    updatedFiles[index] = { ...updatedFiles[index], ...updates };
    onFilesChange(updatedFiles);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === files.length - 1)) {
      return;
    }

    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap files
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    
    // Update display_order
    newFiles.forEach((file, i) => {
      file.display_order = i + 1;
    });
    
    onFilesChange(newFiles);
  };

  const acceptTypes = type === 'image' 
    ? 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
    : 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono tracking-widest">
          {type === 'image' ? 'IMAGES' : 'AUDIO FILES'}
        </h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 text-xs font-mono border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
        >
          <Upload size={14} />
          ADD {type.toUpperCase()}
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
      />

      {/* Drag and drop area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed p-8 text-center transition-colors ${
          dragOver 
            ? 'border-black bg-gray-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
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

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file, index) => (
            <div key={index} className="border border-gray-300 p-3">
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
                          onChange={(e) => updateFileMetadata(index, { alt_text: e.target.value })}
                          className="text-xs font-mono border border-gray-300 px-2 py-1"
                        />
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={file.is_thumbnail || false}
                            onChange={(e) => {
                              // If setting as thumbnail, unset others
                              if (e.target.checked) {
                                const updatedFiles = files.map((f, i) => ({
                                  ...f,
                                  is_thumbnail: i === index
                                }));
                                onFilesChange(updatedFiles);
                              } else {
                                updateFileMetadata(index, { is_thumbnail: false });
                              }
                            }}
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
                        onChange={(e) => updateFileMetadata(index, { title: e.target.value })}
                        className="text-xs font-mono border border-gray-300 px-2 py-1"
                      />
                    )}
                  </div>

                  {/* Status */}
                  <div className="mt-2 flex items-center gap-2">
                    {file.isUploading && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                        <Loader2 size={12} className="animate-spin" />
                        Uploading...
                      </span>
                    )}
                    {file.error && (
                      <span className="text-xs text-red-600">
                        Error: {file.error}
                      </span>
                    )}
                    {!file.isUploading && !file.error && (
                      <span className="text-xs text-green-600">Ready</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveFile(index, 'up')}
                    disabled={index === 0}
                    className="text-xs px-2 py-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFile(index, 'down')}
                    disabled={index === files.length - 1}
                    className="text-xs px-2 py-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
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

export default MediaUploader;