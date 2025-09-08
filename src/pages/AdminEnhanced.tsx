import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, X, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllProjectsAdmin, 
  deleteProjectAdmin, 
  createProjectAdmin, 
  updateProjectAdmin, 
  generateSlug,
  addProjectImage,
  addProjectAudio
} from '../lib/adminSupabase';
import { getCategories, Project, Category } from '../lib/supabase';
import MediaUploader, { MediaFile } from '../components/MediaUploader';

const AdminEnhanced = () => {
  const { isAdmin, login, logout, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('ethra.here@gmail.com');
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    year: new Date().getFullYear(),
    medium: '',
    dimensions: '',
    categoryIds: [] as string[]
  });
  
  // Media files
  const [imageFiles, setImageFiles] = useState<MediaFile[]>([]);
  const [audioFiles, setAudioFiles] = useState<MediaFile[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [projectsData, categoriesData] = await Promise.all([
        getAllProjectsAdmin(),
        getCategories()
      ]);
      setProjects(projectsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      setPassword('');
    } else {
      alert('Invalid email or password');
    }
  };

  const handleDelete = async (projectId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will also delete all associated images and audio files.`)) {
      try {
        const result = await deleteProjectAdmin(projectId);
        if (result.success) {
          await fetchData();
        } else {
          alert(`Error deleting project: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let result;
      
      if (editingProject) {
        // Update existing project
        result = await updateProjectAdmin({
          id: editingProject.id,
          ...formData
        });
      } else {
        // Create new project
        result = await createProjectAdmin(formData);
      }

      if (!result.success) {
        setError(result.error || 'Failed to save project');
        return;
      }

      const projectId = result.project.id;

      // Save images
      for (const imageFile of imageFiles) {
        if (imageFile.url && !imageFile.isUploading && !imageFile.error) {
          try {
            await addProjectImage(
              projectId,
              imageFile.url,
              imageFile.alt_text || '',
              imageFile.display_order,
              imageFile.is_thumbnail || false
            );
          } catch (err: any) {
            console.error('Error adding image:', err);
            setError(`Project saved but failed to add image: ${err.message}`);
          }
        }
      }

      // Save audio files
      for (const audioFile of audioFiles) {
        if (audioFile.url && !audioFile.isUploading && !audioFile.error) {
          try {
            await addProjectAudio(
              projectId,
              audioFile.url,
              audioFile.title || '',
              audioFile.display_order
            );
          } catch (err: any) {
            console.error('Error adding audio:', err);
            setError(`Project saved but failed to add audio: ${err.message}`);
          }
        }
      }

      // Success
      resetForm();
      await fetchData();
      
    } catch (error: any) {
      console.error('Error saving project:', error);
      setError(error.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      year: new Date().getFullYear(),
      medium: '',
      dimensions: '',
      categoryIds: []
    });
    setImageFiles([]);
    setAudioFiles([]);
    setEditingProject(null);
    setShowForm(false);
    setError('');
  };

  const startEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description,
      year: project.year,
      medium: project.medium,
      dimensions: project.dimensions,
      categoryIds: project.categories?.map(c => c.id) || []
    });
    
    // Load existing media files
    setImageFiles(project.images?.map((img, index) => ({
      id: img.id,
      url: img.image_url,
      alt_text: img.alt_text,
      display_order: img.display_order,
      is_thumbnail: img.is_thumbnail
    })) || []);
    
    setAudioFiles(project.audios?.map((audio, index) => ({
      id: audio.id,
      url: audio.audio_url,
      title: audio.title,
      display_order: audio.display_order
    })) || []);
    
    setShowForm(true);
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white text-black p-8 md:p-16">
        <div className="max-w-2xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-16"
          >
            <ArrowLeft size={16} />
            HOME
          </Link>
          
          <div className="border border-black p-8">
            <h1 className="text-2xl font-mono mb-8">ADMIN LOGIN</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-black bg-white font-mono text-sm"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-black bg-white font-mono text-sm"
                required
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-black text-white p-3 font-mono text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {authLoading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black p-8 md:p-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-sm font-mono">LOADING...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 flex items-center justify-between">
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-4"
            >
              <ArrowLeft size={16} />
              HOME
            </Link>
            <h1 className="text-3xl md:text-4xl font-mono tracking-wide">ADMIN</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 font-mono text-sm hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
              NEW PROJECT
            </button>
            <button
              onClick={logout}
              className="font-mono text-sm underline hover:no-underline"
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 border border-red-500 bg-red-50 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Project Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-mono">
                    {editingProject ? 'EDIT PROJECT' : 'NEW PROJECT'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-1 hover:bg-gray-100"
                    disabled={saving}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-mono mb-2">TITLE</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full p-3 border border-black bg-white font-mono text-sm"
                        required
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-mono mb-2">SLUG</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full p-3 border border-black bg-white font-mono text-sm"
                        required
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-mono mb-2">DESCRIPTION</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="w-full p-3 border border-black bg-white font-mono text-sm resize-none"
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-mono mb-2">YEAR</label>
                        <input
                          type="number"
                          value={formData.year}
                          onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                          className="w-full p-3 border border-black bg-white font-mono text-sm"
                          required
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-mono mb-2">MEDIUM</label>
                        <input
                          type="text"
                          value={formData.medium}
                          onChange={(e) => setFormData(prev => ({ ...prev, medium: e.target.value }))}
                          className="w-full p-3 border border-black bg-white font-mono text-sm"
                          required
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-mono mb-2">DIMENSIONS</label>
                      <input
                        type="text"
                        value={formData.dimensions}
                        onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                        className="w-full p-3 border border-black bg-white font-mono text-sm"
                        required
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-mono mb-2">CATEGORIES</label>
                      <div className="space-y-2">
                        {categories.map(category => (
                          <label key={category.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.categoryIds.includes(category.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    categoryIds: [...prev.categoryIds, category.id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    categoryIds: prev.categoryIds.filter(id => id !== category.id)
                                  }));
                                }
                              }}
                              className="w-4 h-4"
                              disabled={saving}
                            />
                            <span className="text-sm font-mono">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Media Upload Sections */}
                  <div className="border-t border-gray-300 pt-6 space-y-6">
                    <MediaUploader
                      type="image"
                      files={imageFiles}
                      onFilesChange={setImageFiles}
                      projectId={editingProject?.id}
                    />
                    
                    <MediaUploader
                      type="audio"
                      files={audioFiles}
                      onFilesChange={setAudioFiles}
                      projectId={editingProject?.id}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-4 pt-6 border-t border-gray-300">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-black text-white p-3 font-mono text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          SAVING...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          {editingProject ? 'UPDATE' : 'CREATE'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                      className="flex-1 border border-black p-3 font-mono text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="space-y-4">
          <h2 className="text-xl font-mono mb-8">PROJECTS ({projects.length})</h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-16 text-sm font-mono text-gray-500">
              NO PROJECTS YET
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map(project => (
                <div key={project.id} className="border border-black p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-mono text-sm font-bold mb-1">{project.title}</h3>
                    <p className="text-xs font-mono text-gray-600 mb-2">
                      {project.categories?.map(c => c.name).join(', ')} • {project.year}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                      {project.description.substring(0, 100)}...
                    </p>
                    <div className="text-xs text-gray-400">
                      {project.images?.length || 0} images • {project.audios?.length || 0} audio files
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      to={`/project/${project.categories?.[0]?.slug || 'design'}/${project.slug}`}
                      className="p-2 border border-black hover:bg-black hover:text-white transition-colors"
                      title="View project"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => startEdit(project)}
                      className="p-2 border border-black hover:bg-black hover:text-white transition-colors"
                      title="Edit project"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      className="p-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEnhanced;