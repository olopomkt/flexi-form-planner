import { Link } from "react-router-dom";
import { FitnessButton } from "@/components/ui/fitness-button";
import gymBackground from "@/assets/gym-background.jpg";

const Index = () => {
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
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-primary opacity-20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-accent opacity-20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-4">
        {/* Main Brand Section */}
        <h1 className="text-6xl md:text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6 tracking-tight">
          TREINO PLANNER
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Transforme seu corpo, supere seus limites e alcance seus objetivos fitness com o planner mais completo do Brasil
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <FitnessButton 
            asChild 
            variant="primary" 
            size="lg"
            className="text-lg px-8 py-4"
          >
            <Link to="/signup">
              COMEÇAR AGORA
            </Link>
          </FitnessButton>
          
          <FitnessButton 
            asChild 
            variant="outline" 
            size="lg"
            className="text-lg px-8 py-4"
          >
            <Link to="/login">
              JÁ TENHO CONTA
            </Link>
          </FitnessButton>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50K+</div>
            <div className="text-muted-foreground">Usuários ativos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">1M+</div>
            <div className="text-muted-foreground">Treinos realizados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-glow mb-2">98%</div>
            <div className="text-muted-foreground">Satisfação</div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            ✨ Planos personalizados • 📊 Acompanhamento de progresso • 🎯 Metas inteligentes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
