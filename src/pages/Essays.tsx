import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { getProjectsByCategory, getThumbnailForProject, Project } from '../lib/supabase';

const Essays = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjectsByCategory('essays');
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen text-black p-8 md:p-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-sm font-mono">LOADING...</div>
        </div>
      </div>
    );
  }

  const pageTitle = "Essays & Writing | ETHRA";
  const pageDescription = "Read ETHRA's essays and written reflections on creativity, technology, art, and culture. Thoughtful explorations at the intersection of ideas.";
  const pageUrl = "https://ethra.art/essays";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        {/* JSON-LD for Collection */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Essays & Writing",
            "description": pageDescription,
            "url": pageUrl,
            "creator": {
              "@type": "Person",
              "name": "ETHRA",
              "url": "https://ethra.art"
            },
            "numberOfItems": projects.length,
            "itemListElement": projects.map((project, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "url": `https://ethra.art/project/essays/${project.slug}`,
              "name": project.title
            }))
          })}
        </script>
      </Helmet>

      <div className="min-h-screen text-black p-8 md:p-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-16">
            <nav aria-label="Breadcrumb">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-8"
              >
                <ArrowLeft size={16} />
                HOME
              </Link>
            </nav>
            <h1 className="text-3xl md:text-4xl font-mono tracking-wide">
              ESSAYS
            </h1>
          </header>

          {/* Projects Grid */}
          <main>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16" aria-label="Essays">
              {projects.map((project) => (
                <article key={project.id}>
                  <Link
                    to={`/project/essays/${project.slug}`}
                    className="group block"
                  >
                    <div className="aspect-square bg-gray-100 border border-black overflow-hidden mb-4 group-hover:bg-black transition-colors duration-300">
                      <img
                        src={getThumbnailForProject(project)}
                        alt={`${project.title} - Essay by ETHRA`}
                        className="w-full h-full object-cover group-hover:opacity-90"
                        loading="lazy"
                      />
                    </div>
                    <h2 className="text-sm font-mono tracking-widest group-hover:underline">
                      {project.title}
                    </h2>
                  </Link>
                </article>
              ))}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
export default Essays;
