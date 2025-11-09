import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import ImageGallery from '../components/ImageGallery';
import VideoGallery from '../components/VideoGallery';
import { getProject, Project as ProjectType } from '../lib/supabase';

const Project = () => {
  const { category, id } = useParams();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      if (!category || !id) return;
      
      try {
        const data = await getProject(category, id);
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [category, id]);

  if (loading) {
    return (
      <div className="min-h-screen text-black p-8 md:p-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-sm font-mono">LOADING...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen text-black p-8 md:p-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <Link 
            to={`/${category}`} 
            className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-16"
          >
            <ArrowLeft size={16} />
            BACK
          </Link>
          <div className="text-sm font-mono">PROJECT NOT FOUND</div>
        </div>
      </div>
    );
  }

  const projectImages = project.images?.map(img => img.image_url) || [];
  const projectVideos = project.videos?.map(vid => vid.video_url) || [];


  return (
    <div className="min-h-screen text-black p-8 md:p-16 bg-white/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        {/* Back Navigation */}
        <Link 
          to={`/${category}`} 
          className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-16"
        >
          <ArrowLeft size={16} />
          BACK
        </Link>

        {/* Project Content */}
        <div className="space-y-16">
          <header>
            <h1 className="text-3xl md:text-4xl font-mono tracking-wide mb-4">
              {project.title}
            </h1>
            <p className="text-sm font-mono text-gray-600">
              {project.categories?.[0]?.name} / {project.year}
            </p>
          </header>

          {/* Project Gallery + Audio Player Side by Side */}
          {projectImages.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-start md:gap-12">
              <div className="flex-1">
                <ImageGallery
                  images={projectImages}
                  projectTitle={project.title}
                />
              </div>
              {/* Project Audio Playlist */}
              {project.audios && project.audios.length > 0 && (
                <aside className="w-full md:w-80 mt-8 md:mt-0 md:pl-8">
                  <h2 className="text-sm font-mono mb-8 tracking-widest">AUDIO</h2>
                  <div className="space-y-4">
                    <audio
                      controls
                      className="w-full outline-none border border-black rounded bg-white mb-4"
                      src={project.audios[selectedTrack]?.audio_url}
                      key={project.audios[selectedTrack]?.id}
                    >
                      <source src={project.audios[selectedTrack]?.audio_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    <ul className="space-y-2">
                      {project.audios.map((audio, idx) => (
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
          {projectImages.length === 0 && project.audios && project.audios.length > 0 && (
            <div className="max-w-md">
              <h2 className="text-sm font-mono mb-8 tracking-widest">AUDIO</h2>
              <div className="space-y-4">
                <audio
                  controls
                  className="w-full outline-none border border-black rounded bg-white mb-4"
                  src={project.audios[selectedTrack]?.audio_url}
                  key={project.audios[selectedTrack]?.id}
                >
                  <source src={project.audios[selectedTrack]?.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <ul className="space-y-2">
                  {project.audios.map((audio, idx) => (
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
              <h2 className="text-sm font-mono mb-8 tracking-widest">VIDEOS</h2>
              <VideoGallery
                videos={projectVideos}
                projectTitle={project.title}
              />
            </div>
          )}

          {/* Project Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-sm font-mono mb-8 tracking-widest">
                DESCRIPTION
              </h2>
              <p className="text-base leading-relaxed">
                {project.description}
              </p>
            </div>
            
            <div>
              <h2 className="text-sm font-mono mb-8 tracking-widest">
                DETAILS
              </h2>

              {/* App Link - Only show for apps category */}
              {project.app_link && (
                <a
                  href={project.app_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 mb-8 text-sm font-mono border border-black hover:bg-black hover:text-white px-4 py-3 transition-colors duration-300 w-full"
                >
                  VISIT APP
                  <ExternalLink size={16} />
                </a>
              )}

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-mono text-gray-600">YEAR</dt>
                  <dd>{project.year}</dd>
                </div>
                <div>
                  <dt className="font-mono text-gray-600">MEDIUM</dt>
                  <dd>{project.medium}</dd>
                </div>
                <div>
                  <dt className="font-mono text-gray-600">DIMENSIONS</dt>
                  <dd>{project.dimensions}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
