import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { PostsSkeleton } from './components/Skeleton';
import Login from './pages/Login';
import Posts from './pages/Posts';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import Comments from './pages/Comments';
import Settings from './pages/Settings';
import Upload from './pages/Upload';

export default function App() {
  const { token, isLoading } = useAuth();
  const [activePage, setActivePage] = useState('posts');

  if (isLoading) {
    return (
      <div className="min-h-screen p-8" style={{ background: 'var(--bg-base)' }}>
        <PostsSkeleton />
      </div>
    );
  }

  if (!token) {
    return <Login />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      {/* 主内容区 — 8px 网格间距 padding: 24px */}
      <main className="flex-1 overflow-y-auto" style={{ padding: '24px 32px', background: 'var(--bg-base)' }}>
        {activePage === 'posts' && <Posts />}
        {activePage === 'categories' && <Categories />}
        {activePage === 'tags' && <Tags />}
        {activePage === 'comments' && <Comments />}
        {activePage === 'settings' && <Settings />}
        {activePage === 'upload' && <Upload />}
      </main>
    </div>
  );
}
