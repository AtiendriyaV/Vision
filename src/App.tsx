import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ArticleList } from './components/ArticleList';
import { ArticleReader } from './components/ArticleReader';
import { AboutView } from './components/AboutView';
import { AdminPortal } from './components/AdminPortal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { Footer } from './components/Footer';
import { Article } from '@/lib/types';
import { SEED_ARTICLES } from '@/lib/seedData';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'write' | 'article'>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>(SEED_ARTICLES);
  const [isLoading, setIsLoading] = useState(false);

  // Default mode is viewer active mode unless authorized with password
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('atiendriya_admin_auth') === 'Vermakk@1972';
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [pendingEditArticle, setPendingEditArticle] = useState<Article | null>(null);

  // Load articles from backend storage
  const loadArticles = useCallback(async (forceRevalidate = false) => {
    setIsLoading(true);
    try {
      const url = forceRevalidate ? '/api/articles?revalidate=true' : '/api/articles';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          setArticles(data.articles);
        }
      }
    } catch (err) {
      console.warn('Using seeded articles due to network fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle client URL routing
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/about') {
        setCurrentView('about');
        setSelectedArticle(null);
      } else if (path === '/admin/write') {
        setCurrentView('write');
        setSelectedArticle(null);
      } else if (path.startsWith('/blog/')) {
        const slug = path.replace('/blog/', '');
        const found = articles.find((a) => a.slug === slug);
        if (found) {
          setSelectedArticle(found);
          setCurrentView('article');
        }
      } else {
        setCurrentView('home');
        setSelectedArticle(null);
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [articles]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleNavigate = (view: 'home' | 'about' | 'write') => {
    setCurrentView(view);
    setSelectedArticle(null);
    if (view !== 'write') {
      setEditingArticle(null);
    }
    let path = '/';
    if (view === 'about') path = '/about';
    if (view === 'write') path = '/admin/write';
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdminLogin = () => {
    setShowAdminLoginModal(true);
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('atiendriya_admin_auth');
    setIsAdmin(false);
    setEditingArticle(null);
    if (currentView === 'write') {
      handleNavigate('home');
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setShowAdminLoginModal(false);
    if (pendingEditArticle) {
      const target = pendingEditArticle;
      setPendingEditArticle(null);
      setEditingArticle(target);
      setSelectedArticle(null);
      setCurrentView('write');
      window.history.pushState({}, '', '/admin/write');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleNavigate('write');
    }
  };

  const handleEditArticle = (article: Article) => {
    if (!isAdmin) {
      setPendingEditArticle(article);
      setShowAdminLoginModal(true);
      return;
    }
    setEditingArticle(article);
    setSelectedArticle(null);
    setCurrentView('write');
    window.history.pushState({}, '', '/admin/write');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setEditingArticle(null);
    setCurrentView('article');
    window.history.pushState({}, '', `/blog/${article.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleArticlePublished = (savedArticle?: Article) => {
    if (savedArticle) {
      const priorSlug = editingArticle?.slug;
      setArticles((prev) => [
        savedArticle, 
        ...prev.filter((a) => a.slug !== savedArticle.slug && a.slug !== priorSlug)
      ]);
      setEditingArticle(null);
      handleSelectArticle(savedArticle);
    } else {
      loadArticles(true);
    }
  };

  const handleArticleUpdated = (updatedArticle: Article) => {
    setArticles((prev) => [
      updatedArticle,
      ...prev.filter((a) => a.slug !== updatedArticle.slug && a.slug !== selectedArticle?.slug)
    ]);
    setSelectedArticle(updatedArticle);
  };

  const handleDeleteArticle = (slug: string) => {
    setArticles((prev) => prev.filter((a) => a.slug !== slug));
    if (selectedArticle?.slug === slug) {
      setSelectedArticle(null);
      handleNavigate('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1c1917] flex flex-col font-sans-clean antialiased selection:bg-[#fde047] selection:text-[#1c1917]">
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        onOpenAdminLogin={handleOpenAdminLogin}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero
              onExploreArticles={() => {
                const feedElement = document.getElementById('articles-feed');
                if (feedElement) {
                  feedElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onViewAbout={() => handleNavigate('about')}
            />
            <div id="articles-feed">
              <ArticleList
                articles={articles}
                onSelectArticle={handleSelectArticle}
                onEditArticle={handleEditArticle}
                isLoading={isLoading}
                onRefresh={() => loadArticles(true)}
                isAdmin={isAdmin}
              />
            </div>
          </>
        )}

        {currentView === 'about' && (
          <AboutView
            onExploreArticles={() => handleNavigate('home')}
          />
        )}

        {currentView === 'write' && (
          <AdminPortal
            key={editingArticle?.slug || 'new-article'}
            initialArticle={editingArticle}
            isAdmin={isAdmin}
            onSetAdmin={setIsAdmin}
            onArticlePublished={handleArticlePublished}
            onDeleteArticle={handleDeleteArticle}
            onReturnHome={() => {
              setEditingArticle(null);
              handleNavigate('home');
            }}
          />
        )}

        {currentView === 'article' && selectedArticle && (
          <ArticleReader
            article={selectedArticle}
            onBack={() => handleNavigate('home')}
            onEditArticle={handleEditArticle}
            onArticleUpdated={handleArticleUpdated}
            isAdmin={isAdmin}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        onOpenAdminLogin={handleOpenAdminLogin}
      />

      {/* Admin Password Gate Modal */}
      <AdminPasswordModal
        isOpen={showAdminLoginModal}
        onClose={() => {
          setShowAdminLoginModal(false);
          setPendingEditArticle(null);
        }}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
