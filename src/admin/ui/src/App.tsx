import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { PostsSkeleton } from './components/Skeleton';
import Login from './pages/Login';
import Posts from './pages/Posts';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import Comments from './pages/CommentsV2';
import Settings from './pages/Settings';
import Upload from './pages/Upload';
import MediaCategories from './pages/MediaCategories';
import Themes from './pages/Themes';
import ThemeDetail from './pages/ThemeDetail';
import RecycleBin from './pages/RecycleBin';

const pageToRoute: Record<string, string> = {
  posts: '/admin/posts',
  categories: '/admin/categories',
  tags: '/admin/tags',
  comments: '/admin/comments',
  settings: '/admin/settings',
  upload: '/admin/upload',
  'media-categories': '/admin/media-categories',
  themes: '/admin/themes',
  trash: '/admin/trash',
};

function getActivePage(pathname: string): string {
  if (pathname.startsWith('/admin/themes')) return 'themes';
  if (pathname.startsWith('/admin/categories')) return 'categories';
  if (pathname.startsWith('/admin/tags')) return 'tags';
  if (pathname.startsWith('/admin/comments')) return 'comments';
  if (pathname.startsWith('/admin/settings')) return 'settings';
  if (pathname.startsWith('/admin/upload')) return 'upload';
  if (pathname.startsWith('/admin/media-categories')) return 'media-categories';
  if (pathname.startsWith('/admin/trash')) return 'trash';
  return 'posts';
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = getActivePage(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => navigate(pageToRoute[page] || '/admin/posts')}
      />
      <main className="flex-1 overflow-y-auto" style={{ padding: '24px 32px', background: 'var(--bg-base)' }}>
        <Routes>
          <Route path="/admin" element={<Navigate to="/admin/posts" replace />} />
          <Route path="/admin/posts" element={<Posts />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/tags" element={<Tags />} />
          <Route path="/admin/comments" element={<Comments />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/upload" element={<Upload />} />
          <Route path="/admin/media-categories" element={<MediaCategories />} />
          <Route path="/admin/themes" element={<Themes />} />
          <Route path="/admin/themes/:slug" element={<ThemeDetail />} />
          <Route path="/admin/trash" element={<RecycleBin />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const { token, isLoading } = useAuth();

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
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
