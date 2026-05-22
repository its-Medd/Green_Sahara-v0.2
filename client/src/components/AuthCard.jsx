import Logo from "./Logo";

function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="flex w-full max-w-lg mx-auto bg-[#f0f9f1]/90 backdrop-blur-md rounded-[3rem] overflow-hidden shadow-2xl border border-white/40">
      
      {/* Form Side */}
      <div className="w-full p-8 md:p-14 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center lg:text-left mb-10">
            <h1 className="text-4xl font-black text-[#2d4a3e] lowercase tracking-tight">
              {title || "bienvenue !"}
            </h1>
            {subtitle && <p className="text-slate-500 text-sm mt-2">{subtitle}</p>}
          </div>

          <div className="space-y-4">
            {children}
          </div>

          {footer && (
            <div className="mt-10 text-center">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthCard;


