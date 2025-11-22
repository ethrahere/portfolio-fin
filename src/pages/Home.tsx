import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail, ArrowLeft, ExternalLink, ChevronDown } from 'lucide-react';
import { getProjectsByCategory, getThumbnailForProject, getProject, Project } from '../lib/supabase';
import ImageGallery from '../components/ImageGallery';
import VideoGallery from '../components/VideoGallery';
import MarkdownRenderer from '../components/MarkdownRenderer';
import VineCursorCanvas from '../components/VineCursorCanvas';

type ViewState =
  | { type: 'home' }
  | { type: 'category'; slug: string; name: string }
  | { type: 'project'; categorySlug: string; projectSlug: string };

const Home = () => {
  const [viewState, setViewState] = useState<ViewState>({ type: 'home' });
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);

  const categories = [
    { slug: '3d', name: '3D' },
    { slug: 'apps', name: 'APPS' },
    { slug: 'music', name: 'MUSIC' },
    { slug: 'essays', name: 'ESSAYS' },
    { slug: 'resources', name: 'RESOURCES' },
  ];

  // Load projects when category is selected
  useEffect(() => {
    const loadProjects = async () => {
      if (viewState.type === 'category') {
        setLoading(true);
        try {
          const data = await getProjectsByCategory(viewState.slug);
          setProjects(data);
        } catch (error) {
          console.error('Error fetching projects:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProjects();
  }, [viewState]);

  // Load project details when project is selected
  useEffect(() => {
    const loadProject = async () => {
      if (viewState.type === 'project') {
        setLoading(true);
        try {
          const data = await getProject(viewState.categorySlug, viewState.projectSlug);
          setCurrentProject(data);
          setSelectedTrack(0);
        } catch (error) {
          console.error('Error fetching project:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProject();
  }, [viewState]);

  const handleCategoryClick = (slug: string, name: string) => {
    setViewState({ type: 'category', slug, name });
  };

  const handleProjectClick = (categorySlug: string, projectSlug: string) => {
    setViewState({ type: 'project', categorySlug, projectSlug });
  };

  const handleBackClick = () => {
    if (viewState.type === 'project') {
      // Go back to category listing
      const categorySlug = viewState.categorySlug;
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        setViewState({ type: 'category', slug: category.slug, name: category.name });
      }
    } else if (viewState.type === 'category') {
      // Go back to home
      setViewState({ type: 'home' });
    }
  };

  // Render right panel content
  const renderRightPanel = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-sm font-mono">LOADING...</div>
        </div>
      );
    }

    // Category view - show projects grid
    if (viewState.type === 'category') {
      return (
        <div className="h-full flex flex-col">
          {/* Back button */}
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-8"
          >
            <ArrowLeft size={16} />
            BACK
          </button>

          <h2 className="text-3xl md:text-4xl font-mono tracking-wide mb-12">
            {viewState.name}
          </h2>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto items-start scrollbar-hide">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectClick(viewState.slug, project.slug)}
                className="group block text-left w-full"
              >
                <div className="aspect-square bg-gray-100 border border-black overflow-hidden mb-4 group-hover:bg-black transition-colors duration-300">
                  <img
                    src={getThumbnailForProject(project)}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:opacity-90"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm font-mono tracking-widest group-hover:underline">
                  {project.title}
                </h3>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Project detail view
    if (viewState.type === 'project' && currentProject) {
      const projectImages = currentProject.images?.map(img => img.image_url) || [];
      const projectVideos = currentProject.videos?.map(vid => vid.video_url) || [];

      return (
        <div className="h-full flex flex-col overflow-y-auto scrollbar-hide">
          {/* Back button */}
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-8"
          >
            <ArrowLeft size={16} />
            BACK
          </button>

          {/* Project Content */}
          <div className="space-y-12">
            <header>
              <h1 className="text-2xl md:text-3xl font-mono tracking-wide mb-4">
                {currentProject.title}
              </h1>
              <p className="text-sm font-mono text-gray-600">
                {currentProject.categories?.[0]?.name} / {currentProject.year}
              </p>
            </header>

            {/* Project Gallery + Audio Player Side by Side */}
            {projectImages.length > 0 && (
              <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
                <div className="flex-1">
                  <ImageGallery
                    images={projectImages}
                    projectTitle={currentProject.title}
                  />
                </div>
                {/* Project Audio Playlist */}
                {currentProject.audios && currentProject.audios.length > 0 && (
                  <aside className="w-full lg:w-64 mt-8 lg:mt-0">
                    <h2 className="text-sm font-mono mb-4 tracking-widest">AUDIO</h2>
                    <div className="space-y-4">
                      <audio
                        controls
                        className="w-full outline-none border border-black rounded bg-white mb-4"
                        src={currentProject.audios[selectedTrack]?.audio_url}
                        key={currentProject.audios[selectedTrack]?.id}
                      >
                        <source src={currentProject.audios[selectedTrack]?.audio_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                      <ul className="space-y-2">
                        {currentProject.audios.map((audio, idx) => (
                          <li key={audio.id}>
                            <button
                              className={`text-xs font-mono truncate w-full text-left px-2 py-1 rounded transition-colors ${selectedTrack === idx ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                              onClick={() => setSelectedTrack(idx)}
                              title={audio.title}
                            >
                              {audio.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </aside>
                )}
              </div>
            )}

            {/* Audio Player Only (when no images) */}
            {projectImages.length === 0 && currentProject.audios && currentProject.audios.length > 0 && (
              <div className="max-w-md">
                <h2 className="text-sm font-mono mb-4 tracking-widest">AUDIO</h2>
                <div className="space-y-4">
                  <audio
                    controls
                    className="w-full outline-none border border-black rounded bg-white mb-4"
                    src={currentProject.audios[selectedTrack]?.audio_url}
                    key={currentProject.audios[selectedTrack]?.id}
                  >
                    <source src={currentProject.audios[selectedTrack]?.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <ul className="space-y-2">
                    {currentProject.audios.map((audio, idx) => (
                      <li key={audio.id}>
                        <button
                          className={`text-xs font-mono truncate w-full text-left px-2 py-1 rounded transition-colors ${selectedTrack === idx ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                          onClick={() => setSelectedTrack(idx)}
                          title={audio.title}
                        >
                          {audio.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Project Videos */}
            {projectVideos.length > 0 && (
              <div>
                <h2 className="text-sm font-mono mb-4 tracking-widest">VIDEOS</h2>
                <VideoGallery
                  videos={projectVideos}
                  projectTitle={currentProject.title}
                />
              </div>
            )}

            {/* Project Description */}
            <div className="grid grid-cols-1 gap-8">
              <div>
                <h2 className="text-sm font-mono mb-4 tracking-widest">
                  DESCRIPTION
                </h2>
                <MarkdownRenderer content={currentProject.description} />
              </div>

              <div>
                <h2 className="text-sm font-mono mb-4 tracking-widest">
                  DETAILS
                </h2>

                {/* App Link - Only show for apps category */}
                {currentProject.app_link && (
                  <a
                    href={currentProject.app_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 mb-4 text-sm font-mono border border-black hover:bg-black hover:text-white px-4 py-3 transition-colors duration-300 w-full"
                  >
                    VISIT APP
                    <ExternalLink size={16} />
                  </a>
                )}

                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="font-mono text-gray-600">YEAR</dt>
                    <dd>{currentProject.year}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-gray-600">MEDIUM</dt>
                    <dd>{currentProject.medium}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-gray-600">DIMENSIONS</dt>
                    <dd>{currentProject.dimensions}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Home view - show interactive garden canvas
    return (
      <div className="w-full h-full">
        <VineCursorCanvas />
      </div>
    );
  };

  const getCurrentCategoryName = () => {
    if (viewState.type === 'category') {
      return viewState.name;
    } else if (viewState.type === 'project') {
      const category = categories.find(c => c.slug === viewState.categorySlug);
      return category?.name || '3D';
    }
    return '3D';
  };

  return (
    <div className="h-screen text-black bg-white/50 flex flex-col overflow-hidden">
      {/* Mobile Breadcrumb Navigation */}
      <nav className="lg:hidden border-b border-black bg-white flex-shrink-0">
        <div className="flex items-center justify-between p-4">
          {/* ETHRA Title */}
          <h1 className="text-xl font-mono tracking-wide">ETHRA</h1>

          <div className="flex items-center gap-3">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowContactDropdown(false);
                }}
                className="flex items-center gap-2 text-sm font-mono border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
              >
                {getCurrentCategoryName()}
                <ChevronDown size={14} />
              </button>

              {showCategoryDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-black shadow-lg z-50 min-w-[120px]">
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => {
                        handleCategoryClick(category.slug, category.name);
                        setShowCategoryDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm font-mono hover:bg-black hover:text-white transition-colors ${
                        viewState.type === 'category' && viewState.slug === category.slug
                          ? 'bg-gray-100'
                          : ''
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowContactDropdown(!showContactDropdown);
                  setShowCategoryDropdown(false);
                }}
                className="flex items-center gap-2 text-sm font-mono border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
              >
                CONTACT
                <ChevronDown size={14} />
              </button>

              {showContactDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-black shadow-lg z-50">
                  <a
                    href="https://instagram.com/ethra.here"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-mono hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                  >
                    <Instagram size={16} />
                    INSTAGRAM
                  </a>
                  <a
                    href="https://x.com/ethra_here"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-mono hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                  >
                    <Twitter size={16} />
                    TWITTER
                  </a>
                  <a
                    href="mailto:ethra.here@gmail.com"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-mono hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                  >
                    <Mail size={16} />
                    EMAIL
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Desktop Only */}
        <aside className="hidden lg:flex lg:w-[30%] border-r border-black flex-col lg:flex-shrink-0">
          {/* Scrollable top section */}
          <div className="flex-1 overflow-y-auto p-8 md:p-16">
            {/* Header */}
            <header className="mb-12">
              <h1 className="text-2xl md:text-3xl font-mono tracking-wide">
                ETHRA
              </h1>
            </header>

            {/* Category Navigation */}
            <nav className="flex flex-col gap-4">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryClick(category.slug, category.name)}
                  className={`text-left text-xl font-mono tracking-widest border border-black px-6 py-4 transition-colors duration-300 ${
                    viewState.type === 'category' && viewState.slug === category.slug
                      ? 'bg-black text-white'
                      : 'hover:bg-black hover:text-white'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Fixed Footer - Contact Section */}
          <footer className="border-t border-black p-8 md:px-16 md:pb-16 bg-white flex-shrink-0">
            <div className="mb-6">
              <span className="text-sm md:text-base font-mono">
                CONTACT
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://instagram.com/ethra.here"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-black hover:text-white transition-colors duration-300 p-1"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://x.com/ethra_here"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-black hover:text-white transition-colors duration-300 p-1"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:ethra.here@gmail.com"
                className="hover:bg-black hover:text-white transition-colors duration-300 p-1"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
              <Link
                to="/admin"
                className="text-xs font-mono text-gray-400 hover:text-black transition-colors ml-auto"
                title="Admin"
              >
                •
              </Link>
            </div>
          </footer>
        </aside>

        {/* Right Content Area */}
        <main className="w-full lg:w-[70%] p-4 md:p-8 lg:p-16 lg:flex-shrink-0 flex flex-col overflow-hidden">
          {renderRightPanel()}
        </main>
      </div>
    </div>
  );
};

export default Home;
