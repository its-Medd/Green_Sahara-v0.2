import LanguageSwitcher from "../components/LanguageSwitcher";
import Logo from "../components/Logo";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden font-sans bg-[#f0fdf4]">
      {/* Immersive Background */}
      <div 
        className="absolute inset-0 z-0 scale-110"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(15px) brightness(1.1) saturate(1.1)'
        }}
      />

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher compact />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-5xl animate-in fade-in zoom-in duration-700">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;


