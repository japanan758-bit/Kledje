import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { User } from '@supabase/supabase-js';
import { AuthUser } from '../types';

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username: user.user_metadata?.username || user.email!.split('@')[0],
    phone: user.user_metadata?.phone,
    avatar: user.user_metadata?.avatar_url,
  };
}

export function useAuth() {
  const { user, loading, isAdmin, login, logout, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (mounted && session?.user) {
        const authUser = mapSupabaseUser(session.user);
        
        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        login(authUser, !!adminData);
      }
      if (mounted) setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const authUser = mapSupabaseUser(session.user);
          
          // Check if user is admin
          const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          login(authUser, !!adminData);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          logout();
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const authUser = mapSupabaseUser(session.user);
          
          const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          login(authUser, !!adminData);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [login, logout, setLoading]);

  return { user, loading, isAdmin };
}
