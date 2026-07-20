import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ExternalLink } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import BackButton from '../components/BackButton';
import ImageGallery from '../components/ImageGallery';
import VideoGallery from '../components/VideoGallery';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Comments from '../components/Comments';
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
      <AppLayout sectionLabel={category?.toUpperCase() || 'ETHRA'}>
        <div className="p-8 md:p-16">
          <div className="text-sm font-mono">LOADING...</div>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout sectionLabel={category?.toUpperCase() || 'ETHRA'}>
        <div className="p-8 md:p-16">
          <div className="text-sm font-mono">PROJECT NOT FOUND</div>
        </div>
      </AppLayout>
    );
  }

  const projectImages = project.images?.map(img => img.image_url) || [];
  const projectVideos = project.videos?.map(vid => vid.video_url) || [];

  // Generate page metadata
  const pageTitle = `${project.title} | ETHRA`;
  const pageDescription = project.description.substring(0, 160) + (project.description.length > 160 ? '...' : '');
  const pageUrl = `https://ethra.art/project/${category}/${id}`;
  const thumbnailImage = projectImages[0] || 'https://ethra.art/og-image.svg';

  // Determine creative work type based on category
  const getCreativeWorkType = () => {
    switch (category) {
      case 'music':
        return 'MusicComposition';
      case 'essays':
        return 'Article';
      case 'apps':
        return 'SoftwareApplication';
      default:
        return 'VisualArtwork';
    }
  };

  return (
    <AppLayout sectionLabel={category?.toUpperCase() || 'ETHRA'}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={thumbnailImage} />
        <meta property="article:author" content="ETHRA" />
        <meta property="article:published_time" content={project.created_at || ''} />
        <meta property="article:modified_time" content={project.updated_at || ''} />

        {/* Twitter */}
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={thumbnailImage} />

        {/* JSON-LD for Creative Work */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": getCreativeWorkType(),
            "name": project.title,
            "description": project.description,
            "url": pageUrl,
            "image": projectImages,
            "dateCreated": project.year?.toString(),
            "datePublished": project.created_at,
            "dateModified": project.updated_at,
            "creator": {
              "@type": "Person",
              "name": "ETHRA",
              "url": "https://ethra.art"
            },
            "author": {
              "@type": "Person",
              "name": "ETHRA",
              "url": "https://ethra.art"
            },
            "artMedium": project.medium,
            "size": project.dimensions,
            ...(project.app_link && {
              "url": project.app_link,
              "softwareVersion": "1.0",
              "applicationCategory": "Creative Tool"
            }),
            ...(project.audios && project.audios.length > 0 && {
              "audio": project.audios.map(audio => ({
                "@type": "AudioObject",
                "name": audio.title,
                "contentUrl": audio.audio_url
              }))
            }),
            ...(projectVideos.length > 0 && {
              "video": projectVideos.map(video => ({
                "@type": "VideoObject",
                "contentUrl": video
              }))
            }),
            "keywords": [
              project.categories?.[0]?.name,
              project.medium,
              "ETHRA",
              "creative work",
              category
            ].filter(Boolean).join(", ")
          })}
        </script>

        {/* Breadcrumb JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://ethra.art"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": project.categories?.[0]?.name || category,
                "item": `https://ethra.art/${category}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": project.title,
                "item": pageUrl
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="p-8 md:p-16">
        <article>
        {/* Project Content */}
        <div className="space-y-16">
          <header>
            <BackButton />
            <h1 className="text-3xl md:text-4xl font-mono tracking-wide mb-4">
              {project.title}
            </h1>
            <p className="text-sm font-mono text-gray-600">
              {project.categories?.[0]?.name} / {project.year}
            </p>
          </header>

          {/* Objects category: product grid with per-image name + price */}
          {category === 'objects' && project.images && project.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {project.images.map((img) => (
                <div key={img.id}>
                  <div className="aspect-square border border-black overflow-hidden mb-3">
                    <img
                      src={img.image_url}
                      alt={img.alt_text || img.name || project.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {img.name && (
                    <p className="text-sm font-mono tracking-widest">{img.name}</p>
                  )}
                  {img.price && (
                    <p className="text-sm font-mono text-gray-600 mt-1">{img.price}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Project Gallery + Audio Player Side by Side (non-objects) */}
          {category !== 'objects' && projectImages.length > 0 && (
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
              <MarkdownRenderer content={project.description} />
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
                {project.price && (
                  <div>
                    <dt className="font-mono text-gray-600">PRICE</dt>
                    <dd className="font-mono">{project.price}</dd>
                  </div>
                )}
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
          {/* Comments */}
          <Comments projectId={project.id} />
        </div>
        </article>
      </div>
    </AppLayout>
  );
};

export default Project;
