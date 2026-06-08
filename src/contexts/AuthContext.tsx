import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  getBuiltInRoleForDiscordId,
  getRoleByName,
  normalizeDiscordId,
  normalizeEmail
} from '../lib/roles';

export interface User {
  id: string;
  discord_id: string;
  email?: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  dashboard_access: boolean;
  permissions: string[];
  role_level: number;
  role_name: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loginWithDiscord: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

interface InviteRecord {
  discord_id: string;
  role_name: string;
  role_level?: number;
  permissions?: string[];
  display_name?: string;
  avatar_url?: string;
  status?: string;
}

interface DiscordIdentityProfile {
  discordId: string;
  email?: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getString = (...values: unknown[]) => {
  const value = values.find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0);
  return typeof value === 'string' ? value : '';
};

const extractDiscordProfile = (authUser: SupabaseUser): DiscordIdentityProfile | null => {
  const discordIdentity = authUser.identities?.find((identity) => identity.provider === 'discord');
  const identityData = (discordIdentity?.identity_data || {}) as Record<string, unknown>;
  const metadata = (authUser.user_metadata || {}) as Record<string, unknown>;
  const discordId = normalizeDiscordId(
    getString(
      identityData.provider_id,
      identityData.sub,
      identityData.id,
      identityData.user_id,
      discordIdentity?.provider_id,
      metadata.provider_id,
      metadata.sub,
      metadata.id,
      metadata.user_id
    )
  );

  if (!discordId) return null;

  const username = getString(
    identityData.preferred_username,
    identityData.user_name,
    identityData.username,
    metadata.preferred_username,
    metadata.user_name,
    metadata.username,
    identityData.name,
    metadata.name
  ) || `discord-${discordId}`;

  const displayName = getString(identityData.full_name, metadata.full_name, identityData.name, metadata.name, username);
  const avatarUrl = getString(identityData.avatar_url, metadata.avatar_url, metadata.picture);
  const email = normalizeEmail(getString(identityData.email, metadata.email, authUser.email));

  return {
    discordId,
    email: email || undefined,
    username,
    displayName,
    avatarUrl
  };
};

const buildProfilePayload = (
  authId: string,
  discordProfile: DiscordIdentityProfile,
  roleName: string
) => {
  const role = getRoleByName(roleName) || getBuiltInRoleForDiscordId(discordProfile.discordId);
  const safeRole = role || {
    role_name: 'Viewer',
    role_level: 0,
    permissions: ['view_content']
  };

  return {
    id: authId,
    discord_id: discordProfile.discordId,
    email: discordProfile.email || null,
    username: discordProfile.username,
    display_name: discordProfile.displayName,
    avatar_url: discordProfile.avatarUrl,
    dashboard_access: safeRole.role_level > 0,
    permissions: safeRole.permissions,
    role_level: safeRole.role_level,
    role_name: safeRole.role_name
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const findInvite = async (discordId: string) => {
    const { data, error } = await supabase
      .from('user_invites')
      .select('*')
      .eq('discord_id', normalizeDiscordId(discordId))
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Invite lookup error:', error);
      return null;
    }

    return data as InviteRecord | null;
  };

  const upsertProfile = async (profile: Partial<User>) => {
    const { data, error } = await supabase
      .from('users')
      .upsert(profile, { onConflict: 'discord_id' })
      .select('*')
      .single();

    if (error) {
      console.error('Profile upsert error:', error);
      throw error;
    }

    return data as User;
  };

  const loadProfileForSession = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      return;
    }

    const authUser = session.user;
    const discordProfile = extractDiscordProfile(authUser);

    if (!discordProfile) {
      console.error('Discord login did not include a Discord user ID.');
      setUser(null);
      return;
    }

    const builtInRole = getBuiltInRoleForDiscordId(discordProfile.discordId);

    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('discord_id', discordProfile.discordId)
        .maybeSingle();

      if (builtInRole) {
        const ownerProfile = await upsertProfile({
          ...buildProfilePayload(authUser.id, discordProfile, builtInRole.role_name),
          dashboard_access: true
        });
        setUser(ownerProfile);
        return;
      }

      const invite = await findInvite(discordProfile.discordId);

      if (invite) {
        const inviteRole = getRoleByName(invite.role_name);
        const invitedProfile = await upsertProfile({
          ...buildProfilePayload(authUser.id, discordProfile, inviteRole?.role_name || invite.role_name),
          display_name: profile?.display_name || invite.display_name || discordProfile.displayName,
          avatar_url: profile?.avatar_url || invite.avatar_url || discordProfile.avatarUrl,
          dashboard_access: true
        });

        await supabase
          .from('user_invites')
          .update({
            status: 'accepted',
            accepted_by: authUser.id,
            accepted_at: new Date().toISOString()
          })
          .eq('discord_id', discordProfile.discordId)
          .eq('status', 'pending');

        setUser(invitedProfile);
        return;
      }

      if (profile) {
        const refreshedProfile = await upsertProfile({
          ...profile,
          id: authUser.id,
          email: discordProfile.email || profile.email || null,
          username: discordProfile.username || profile.username,
          display_name: profile.display_name || discordProfile.displayName,
          avatar_url: discordProfile.avatarUrl || profile.avatar_url || ''
        });
        setUser(refreshedProfile);
        return;
      }

      const viewerProfile = await upsertProfile(buildProfilePayload(authUser.id, discordProfile, 'Viewer'));
      setUser(viewerProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const { data } = await supabase.auth.getSession();
    await loadProfileForSession(data.session);
  };

  const loginWithDiscord = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.error('Discord login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('discord_id', user.discord_id)
      .select('*')
      .single();

    if (error) {
      console.error('Update user error:', error);
      throw error;
    }

    setUser(data as User);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        await loadProfileForSession(data.session);
        setIsLoading(false);
      }
    };

    bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfileForSession(session).finally(() => setIsLoading(false));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithDiscord,
        logout,
        updateUser,
        refreshUser,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
