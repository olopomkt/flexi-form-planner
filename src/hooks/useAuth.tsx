import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  credits: number;
  full_name: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  plannersCount: number | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plannersCount, setPlannersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const refreshUserData = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      setPlannersCount(null);
      return;
    }
    
    try {
      const [profileResponse, countResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', currentUser.id).single(),
        supabase.from('planners_history').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id)
      ]);

      if (profileResponse.data) setProfile(profileResponse.data);
      if (profileResponse.error) throw new Error(`Erro ao buscar perfil: ${profileResponse.error.message}`);
      
      setPlannersCount(countResponse.count ?? 0);
      if (countResponse.error) throw new Error(`Erro ao contar planners: ${countResponse.error.message}`);

    } catch (error) {
      console.error("Falha ao atualizar dados do usuário:", error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setSession(session);
        setUser(currentUser);
        await refreshUserData(currentUser);
        setLoading(false);
      }
    );
    
    // Garante que a sessão inicial seja verificada
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session) {
            setLoading(false);
        }
    });

    return () => subscription.unsubscribe();
  }, [refreshUserData]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) {
      toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conta criada!", description: "Bem-vindo! Você tem 2 créditos para começar." });
      // o onAuthStateChange cuidará do redirecionamento e busca de dados.
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Erro no login", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Login realizado!", description: "Bem-vindo de volta!" });
      navigate('/dashboard');
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setPlannersCount(null);
    navigate('/');
    toast({ title: "Logout realizado", description: "Até a próxima!" });
  };
  
  return (
    <AuthContext.Provider value={{ user, session, profile, plannersCount, loading, signUp, signIn, signOut, refreshUserData: () => refreshUserData(user) }}>
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
