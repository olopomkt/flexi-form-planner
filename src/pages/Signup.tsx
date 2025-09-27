import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FitnessCard, FitnessCardHeader, FitnessCardTitle, FitnessCardDescription, FitnessCardContent } from "@/components/ui/fitness-card";
import { FitnessInput } from "@/components/ui/fitness-input";
import { FitnessButton } from "@/components/ui/fitness-button";
import { useAuth } from "@/hooks/useAuth";
import gymBackground from "@/assets/gym-background.jpg";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password, name);
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-background relative overflow-hidden"
      style={{
        backgroundImage: `url(${gymBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-accent opacity-20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-primary opacity-20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            TREINO PLANNER
          </h1>
          <p className="text-muted-foreground text-lg">
            Inicie sua transformação hoje
          </p>
        </div>

        <FitnessCard>
          <FitnessCardHeader className="text-center space-y-2">
            <FitnessCardTitle className="text-3xl font-bold">
              Crie sua conta
            </FitnessCardTitle>
            <FitnessCardDescription className="text-base">
              Junte-se a milhares de pessoas que já transformaram suas vidas
            </FitnessCardDescription>
          </FitnessCardHeader>
          
          <FitnessCardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Nome Completo
                </label>
                <FitnessInput
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <FitnessInput
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Senha
                </label>
                <FitnessInput
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <FitnessButton 
                type="submit" 
                variant="accent" 
                size="lg" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "CRIANDO CONTA..." : "CRIAR CONTA"}
              </FitnessButton>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Já possui uma conta?{" "}
                <Link 
                  to="/login" 
                  className="text-accent hover:text-accent/80 transition-colors duration-300 font-medium underline underline-offset-4"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </FitnessCardContent>
        </FitnessCard>

        {/* Motivational quote */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground/80 italic">
            "A jornada de mil quilômetros começa com um único passo"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;