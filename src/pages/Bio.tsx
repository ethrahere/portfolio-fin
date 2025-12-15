import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { getProjectsByCategory, Project as ProjectType } from '../lib/supabase';

const Bio = () => {
  const [bioProject, setBioProject] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBioProject = async () => {
      try {
        const projects = await getProjectsByCategory('bio');
        // Get the first project (there should only be one bio project)
        if (projects.length > 0) {
          setBioProject(projects[0]);
        }
      } catch (error) {
        console.error('Error fetching bio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBioProject();
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

  if (!bioProject) {
    return (
      <div className="min-h-screen text-black p-8 md:p-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-16"
          >
            <ArrowLeft size={16} />
            HOME
          </Link>
          <div className="text-sm font-mono">BIO CONTENT NOT FOUND. PLEASE ADD VIA ADMIN PANEL.</div>
        </div>
      </div>
    );
  }

  const bioImages = bioProject.images?.map(img => img.image_url) || [];

  return (
    <div className="min-h-screen text-black p-8 md:p-16 bg-white/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-16"
        >
          <ArrowLeft size={16} />
          HOME
        </Link>

        {/* Bio Content */}
        <div className="space-y-16">
          <header>
            <h1 className="text-3xl md:text-4xl font-mono tracking-wide mb-4">
              {bioProject.title}
            </h1>
          </header>

          {/* Bio Images - Simple Grid */}
          {bioImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {bioImages.map((imageUrl, idx) => (
                <div
                  key={idx}
                  className="border border-black overflow-hidden"
                >
                  <img
                    src={imageUrl}
                    alt={`${bioProject.title} - Image ${idx + 1}`}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Bio Description */}
          <div className="prose prose-sm max-w-none">
            <MarkdownRenderer content={bioProject.description} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bio;
