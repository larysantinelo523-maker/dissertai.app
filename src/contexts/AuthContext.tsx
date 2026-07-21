import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';

type Role = 'admin' | 'user' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: Role;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TEMPORARY BYPASS: check if they logged in with the fake credentials
    if (localStorage.getItem('temp_auth') === 'true') {
      const fakeUser = { id: 'temp-user-id', email: 'usuario1@gmail.com' } as User;
      setUser(fakeUser);
      setSession({ user: fakeUser, access_token: 'fake', refresh_token: 'fake' } as unknown as Session);
      setRole('admin'); 
      setLoading(false);
      useAppStore.getState().loadHistoryFromSupabase();
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchRole(session.user.id);
          // Reload history for the new logged in user
          useAppStore.getState().loadHistoryFromSupabase();
        } else {
          setRole(null);
          setLoading(false);
          // Clear history when user logs out
          useAppStore.getState().clearHistory();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (data && data.role === 'admin') {
        setRole('admin');
      } else {
        setRole('user');
      }
    } catch {
      setRole('user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
