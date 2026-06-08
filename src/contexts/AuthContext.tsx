import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { normalizeDiscordId, normalizeEmail } from '../lib/roles';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const claimProfile = async (discordProfile: DiscordIdentityProfile) => {
    const { data, error } = await supabase
      .rpc('claim_user_profile', {
        p_discord_id: discordProfile.discordId,
        p_email: discordProfile.email || null,
        p_username: discordProfile.username,
        p_display_name: discordProfile.displayName,
        p_avatar_url: discordProfile.avatarUrl
      })
      .single();

    if (error) {
      console.error('Profile claim error:', error);
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

    try {
      const claimedProfile = await claimProfile(discordProfile);
      setUser(claimedProfile);
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
