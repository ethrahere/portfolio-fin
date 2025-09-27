import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  return (
    <div className="min-h-screen text-black p-8 md:p-16 bg-white/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-16">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-8"
          >
            <ArrowLeft size={16} />
            HOME
          </Link>
          <h1 className="text-3xl md:text-4xl font-mono tracking-wide">
            ESSAYS
          </h1>
        </header>

        {/* Projects Grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
          {projects.map((project) => (
            <Link 
              key={project.id}
              to={`/project/essays/${project.slug}`}
              className="group block"
            >
              <div className="aspect-square bg-gray-100 border border-black overflow-hidden mb-4 group-hover:bg-black transition-colors duration-300">
                <img 
                  src={getThumbnailForProject(project)} 
                  alt={project.title}
                />
              </div>
              <h2 className="text-sm font-mono tracking-widest group-hover:underline">
                {project.title}
              </h2>
            </Link>
          ))}
        </main>
      </div>
    </div>
  );
}
export default Essays;
