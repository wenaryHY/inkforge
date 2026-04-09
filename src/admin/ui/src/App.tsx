import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { PostsSkeleton } from './components/Skeleton';
import Login from './pages/Login';
import Posts from './pages/Posts';
import PostEditor from './pages/PostEditor';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import Comments from './pages/CommentsV2';
import Settings from './pages/Settings';
import Upload from './pages/Upload';
import MediaCategories from './pages/MediaCategories';
import Themes from './pages/Themes';
import ThemeDetail from './pages/ThemeDetail';
import RecycleBin from './pages/RecycleBin';
import Setup from './pages/Setup';

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
  const adminPath = pathname.startsWith('/admin') ? pathname.slice('/admin'.length) || '/' : pathname;
  if (adminPath.startsWith('/posts')) return 'posts';
  if (adminPath.startsWith('/themes')) return 'themes';
  if (adminPath.startsWith('/categories')) return 'categories';
  if (adminPath.startsWith('/tags')) return 'tags';
  if (adminPath.startsWith('/comments')) return 'comments';
  if (adminPath.startsWith('/settings')) return 'settings';
  if (adminPath.startsWith('/upload')) return 'upload';
  if (adminPath.startsWith('/media-categories')) return 'media-categories';
  if (adminPath.startsWith('/trash')) return 'trash';
  return 'posts';
}

function AdminLayout() {
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
        <Outlet />
      </main>
    </div>
  );
}

function AdminGate() {
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

  return <AdminLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="/admin" element={<AdminGate />}>
          <Route index element={<Navigate to="posts" replace />} />
          <Route path="posts" element={<Posts />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/:id/edit" element={<PostEditor />} />
          <Route path="categories" element={<Categories />} />
          <Route path="tags" element={<Tags />} />
          <Route path="comments" element={<Comments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="upload" element={<Upload />} />
          <Route path="media-categories" element={<MediaCategories />} />
          <Route path="themes" element={<Themes />} />
          <Route path="themes/:slug" element={<ThemeDetail />} />
          <Route path="trash" element={<RecycleBin />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
