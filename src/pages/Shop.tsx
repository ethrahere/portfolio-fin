import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { getShopProjects, getThumbnailForProject, Project } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import CartDrawer from '../components/CartDrawer';

const Shop: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { itemCount, openCart } = useCart();

  useEffect(() => {
    getShopProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Shop | ETHRA</title>
        <meta name="description" content="Shop handcrafted jewellery and objects by ETHRA." />
      </Helmet>

      <CartDrawer />

      <div className="min-h-screen text-black bg-white/50 p-8 md:p-16">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-start justify-between mb-16">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-8"
              >
                <ArrowLeft size={16} />
                HOME
              </Link>
              <h1 className="text-3xl md:text-4xl font-mono tracking-wide">SHOP</h1>
            </div>
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 border border-black px-4 py-2 font-mono text-sm hover:bg-black hover:text-white transition-colors mt-8"
            >
              <ShoppingBag size={16} />
              CART
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-mono w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </header>

          {loading ? (
            <div className="text-sm font-mono">LOADING...</div>
          ) : projects.length === 0 ? (
            <div className="text-sm font-mono text-gray-500">NO ITEMS IN SHOP YET</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {projects.map(project => (
                <article key={project.id} className="flex flex-col">
                  <Link to={`/shop/${project.slug}`} className="group block">
                    <div className="aspect-square border border-black overflow-hidden mb-4 group-hover:bg-black transition-colors duration-300">
                      <img
                        src={getThumbnailForProject(project)}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:opacity-90"
                        loading="lazy"
                      />
                    </div>
                    <h2 className="text-sm font-mono tracking-widest group-hover:underline mb-2">
                      {project.title}
                    </h2>
                  </Link>
                  {project.description && (
                    <p className="text-xs font-mono text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">
                      {project.description.replace(/[#*`[\]]/g, '').substring(0, 120)}
                      {project.description.length > 120 ? '...' : ''}
                    </p>
                  )}
                  <Link
                    to={`/shop/${project.slug}`}
                    className="text-xs font-mono tracking-widest border border-black px-4 py-2 text-center hover:bg-black hover:text-white transition-colors duration-300 self-start"
                  >
                    EXPLORE →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Shop;
