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
      <div className="min-h-screen bg-bg p-8">
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
      <main className="flex-1 overflow-y-auto p-8 bg-bg">
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
