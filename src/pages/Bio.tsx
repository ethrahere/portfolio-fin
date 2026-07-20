import React from 'react';
import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
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
      <AppLayout sectionLabel="BIO">
        <div className="p-8 md:p-16">
          <div className="text-sm font-mono">LOADING...</div>
        </div>
      </AppLayout>
    );
  }

  if (!bioProject) {
    return (
      <AppLayout sectionLabel="BIO">
        <div className="p-8 md:p-16">
          <div className="text-sm font-mono">BIO CONTENT NOT FOUND. PLEASE ADD VIA ADMIN PANEL.</div>
        </div>
      </AppLayout>
    );
  }

  const bioImages = bioProject.images?.map(img => img.image_url) || [];

  return (
    <AppLayout sectionLabel="BIO">
      <div className="p-8 md:p-16 max-w-4xl">
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
    </AppLayout>
  );
};

export default Bio;
