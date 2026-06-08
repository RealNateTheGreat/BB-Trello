import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Award, Bell, FolderKanban, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnnouncementsManager from '../components/admin/AnnouncementsManager';
import BoardsManager from '../components/admin/BoardsManager';
import CreditsManager from '../components/admin/CreditsManager';
import UsersManager from '../components/admin/UsersManager';
import { useAuth, User } from '../contexts/AuthContext';
import { hasPermission } from '../lib/roles';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  icon_url?: string;
}

interface Page {
  id: string;
  category_id: string;
  title: string;
  content?: string;
  image_url?: string;
  media_urls?: string[];
  status: string;
  created_by?: string;
}

interface Invite {
  id: string;
  discord_id: string;
  display_name?: string;
  avatar_url?: string;
  role_name: string;
  role_level: number;
  permissions: string[];
  status: 'pending' | 'accepted' | 'revoked';
  created_at?: string;
}

interface Credit {
  id: string;
  discord_id?: string;
  email?: string;
  display_name: string;
  avatar_url?: string;
  role_name: string;
  title?: string;
  contribution?: string;
  sort_order?: number;
  featured?: boolean;
  is_visible?: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  active: boolean;
  priority: number;
  expires_at?: string;
  created_at: string;
}

type ManagementTab = 'boards' | 'users' | 'credits' | 'announcements';

const ManagementDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ManagementTab>('boards');
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = useMemo(() => {
    if (!user) return [];

    return [
      {
        id: 'boards' as ManagementTab,
        label: 'Boards',
        icon: FolderKanban,
        visible: hasPermission(user.permissions, 'manage_content')
      },
      {
        id: 'users' as ManagementTab,
        label: 'Users',
        icon: Users,
        visible:
          hasPermission(user.permissions, 'manage_users') ||
          hasPermission(user.permissions, 'invite_users') ||
          hasPermission(user.permissions, 'assign_roles')
      },
      {
        id: 'credits' as ManagementTab,
        label: 'Credits',
        icon: Award,
        visible: hasPermission(user.permissions, 'manage_credits')
      },
      {
        id: 'announcements' as ManagementTab,
        label: 'Announcements',
        icon: Bell,
        visible: hasPermission(user.permissions, 'manage_announcements')
      }
    ].filter((tab) => tab.visible);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.dashboard_access) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [authLoading, user?.dashboard_access]);

  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [activeTab, tabs]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        categoriesResult,
        pagesResult,
        usersResult,
        invitesResult,
        creditsResult,
        announcementsResult
      ] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('pages').select('*').order('title'),
        supabase.from('users').select('*').order('role_level', { ascending: false }).order('username'),
        supabase.from('user_invites').select('*').order('created_at', { ascending: false }),
        supabase.from('credits').select('*').order('sort_order', { ascending: true }).order('display_name'),
        supabase.from('announcements').select('*').order('priority', { ascending: true }).order('created_at', { ascending: false })
      ]);

      if (categoriesResult.error) console.error('Categories fetch error:', categoriesResult.error);
      if (pagesResult.error) console.error('Pages fetch error:', pagesResult.error);
      if (usersResult.error) console.error('Users fetch error:', usersResult.error);
      if (invitesResult.error) console.error('Invites fetch error:', invitesResult.error);
      if (creditsResult.error) console.error('Credits fetch error:', creditsResult.error);
      if (announcementsResult.error) console.error('Announcements fetch error:', announcementsResult.error);

      setCategories((categoriesResult.data || []) as Category[]);
      setPages((pagesResult.data || []) as Page[]);
      setUsers((usersResult.data || []) as User[]);
      setInvites((invitesResult.data || []) as Invite[]);
      setCredits((creditsResult.data || []) as Credit[]);
      setAnnouncements((announcementsResult.data || []) as Announcement[]);
    } catch (error) {
      console.error('Error fetching management data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-red-400" />
          <p className="text-red-100">Loading management...</p>
        </div>
      </main>
    );
  }

  if (!user?.dashboard_access) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl pt-24 text-center">
          <div className="rounded-lg border-2 p-8 shadow-xl bb-panel">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border-2"
              style={{ backgroundColor: 'rgba(127, 29, 29, 0.25)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
            >
              <Shield className="h-8 w-8 text-red-200" />
            </div>
            <h1 className="mb-4 text-3xl font-black text-stone-50">Access Denied</h1>
            <p className="mb-6 text-red-100">Management access is invite-only.</p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 rounded-lg border px-6 py-3 font-semibold text-red-50 transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: 'rgba(185, 28, 28, 0.55)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 mt-16 flex flex-col justify-between gap-4 md:mt-20 md:flex-row md:items-center">
          <div className="flex items-center">
            <Link
              to="/"
              className="mr-4 rounded-lg border-2 p-3 shadow-lg transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: 'rgba(24, 18, 16, 0.9)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
              aria-label="Back to home"
            >
              <ArrowLeft className="h-6 w-6 text-red-100" />
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Broken Blade</p>
              <h1 className="text-3xl font-black text-stone-50 md:text-5xl">Management</h1>
            </div>
          </div>
          <div className="rounded-lg border border-red-500/40 bg-red-950/25 px-4 py-3 text-red-100">
            {user.role_name}
          </div>
        </div>

        <section className="mb-8 overflow-hidden rounded-lg border-2 p-6 shadow-2xl bb-panel md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Admin Workbench</p>
          <h2 className="mt-2 text-3xl font-black text-stone-50 md:text-5xl">Control Room</h2>
        </section>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-red-400 bg-red-700/35 text-stone-50'
                    : 'border-red-900/50 bg-black/20 text-red-100 hover:bg-red-950/35'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'boards' && (
          <BoardsManager categories={categories} pages={pages} currentUser={user} onRefresh={fetchData} />
        )}

        {activeTab === 'users' && (
          <UsersManager users={users} invites={invites} currentUser={user} onRefresh={fetchData} />
        )}

        {activeTab === 'credits' && (
          <CreditsManager credits={credits} users={users} currentUser={user} onRefresh={fetchData} />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsManager announcements={announcements} onRefresh={fetchData} />
        )}

      </div>
    </main>
  );
};

export default ManagementDashboard;
