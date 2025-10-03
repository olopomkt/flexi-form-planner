import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  plannersCount: number;
  refreshUserData: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [plannersCount, setPlannersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUserData = async () => {
    const currentUser = user || session?.user;
    if (!currentUser) {
      setProfile(null);
      setPlannersCount(0);
      return;
    }

    // Buscar perfil e contagem de planners em paralelo
    const [profileResponse, countResponse] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', currentUser.id).single(),
      supabase.from('planners_history').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id)
    ]);

    if (profileResponse.data) {
      setProfile(profileResponse.data);
    }
    if (countResponse.count !== null) {
      setPlannersCount(countResponse.count);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          // Defer the data fetch to avoid blocking the auth callback
          setTimeout(() => {
            refreshUserData();
          }, 0);
        } else {
          setProfile(null);
          setPlannersCount(0);
        }
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await refreshUserData();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });

    if (!error) {
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Treino Planner. Você já tem 2 créditos para começar!",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao Treino Planner!",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      toast({
        title: "Logout realizado",
        description: "Até a próxima sessão de treino!",
      });
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      plannersCount,
      refreshUserData,
      signUp,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}