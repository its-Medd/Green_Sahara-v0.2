import { Link } from "react-router-dom";
import { Leaf, Cpu, Truck, BarChart3, ArrowRight, Globe, Factory, Tractor } from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "../components/Logo";
import LanguageSwitcher from "../components/LanguageSwitcher";
import plantImage from "../assets/plant-sprout.png";

function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg relative">
      {/* Navbar Container */}
      <div className="mx-auto max-w-[1400px] px-6 pt-2">

        <header className="flex items-center justify-between">
          <div className="py-2">
            <Logo hideText className="scale-125 origin-left" />
          </div>


          <div className="flex-1" />

          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-brand-greenDeep font-bold hover:text-brand-green transition">
                {t("actions.login")}
              </Link>
              <Link to="/register" className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold hover:brightness-110 transition shadow-sm">
                {t("actions.register")}
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mt-8 lg:mt-12 grid lg:grid-cols-[1fr_1.4fr] gap-16 lg:gap-24 items-stretch relative overflow-visible">



          {/* Background Decoration */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-greenPale/30 rounded-full blur-[100px] -z-10" />

          {/* Left Column: Strategy & Vision */}
          <div className="flex flex-col items-start max-w-xl h-full min-h-[500px] justify-between py-4">

            <div className="space-y-8">


              <h1 className="text-4xl md:text-6xl font-black leading-tight text-[#0d1b3e] tracking-tight mb-8">
                {t("landing.heroTitle1")}<span className="text-brand-green italic font-serif">{t("landing.heroTitleHighlight")}</span>
              </h1>


              <p className="text-xl md:text-[22px] text-slate-500 leading-relaxed font-medium mb-10">
                {t("landing.heroSubtitle")}
              </p>
            </div>


            <div className="flex items-center gap-6">
              <Link to="/register" className="bg-[#1a5d43] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-brand-green transition-all shadow-xl shadow-brand-green/10 flex items-center gap-2 group">
                {t("landing.startNow")}
                <ArrowRight className="group-hover:translate-x-1 transition" size={20} />
              </Link>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}&backgroundColor=e2e8f0`} alt="user" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-greenPale flex items-center justify-center text-[10px] font-bold text-brand-greenDeep shadow-sm">
                  +2k
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Card */}
          <Link to="/register" className="relative h-[500px] rounded-[3.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] isolate group cursor-pointer block transition-all hover:shadow-brand-green/30 hover:-translate-y-1">
            <img
              src={plantImage}
              alt="Plante regenerative"

              className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-12 text-white z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-0.5 w-12 bg-brand-green" />
                <span className="text-brand-green text-xs font-bold tracking-[0.2em] uppercase">{t("landing.cardTag")}</span>
              </div>
              <h3 className="text-5xl font-black text-white mb-4 drop-shadow-sm group-hover:text-brand-green transition">{t("landing.cardTitle")}</h3>
              <p className="text-lg font-medium opacity-80 drop-shadow-sm max-w-[400px] leading-relaxed">
                {t("landing.cardDesc")}
              </p>
              <div className="mt-8 flex items-center gap-4 text-brand-green font-bold">
                <span className="bg-white text-brand-greenDeep px-6 py-3 rounded-2xl shadow-xl group-hover:bg-brand-green group-hover:text-white transition transform group-hover:translate-x-2">
                  {t("landing.createAccount")}
                </span>
              </div>
            </div>
          </Link>

        </section>

        {/* Horizontal Advantages Section */}
        <section className="mt-20">
          <h3 className="text-[14px] font-bold text-brand-greenDeep tracking-widest uppercase mb-10 text-center">
            {t("landing.advTag")}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 px-4 max-w-6xl mx-auto">

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-greenPale flex items-center justify-center mb-5 shrink-0 shadow-sm border border-brand-greenSoft">
                <Leaf size={28} className="text-brand-greenDeep" />
              </div>
              <h4 className="font-bold text-[#1e293b] text-[17px] mb-2">{t("landing.adv1Title")}</h4>
              <p className="text-[#475569] text-[15px] leading-relaxed">{t("landing.adv1Desc")}</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-greenPale flex items-center justify-center mb-5 shrink-0 shadow-sm border border-brand-greenSoft">
                <Cpu size={28} className="text-brand-greenDeep" />
              </div>
              <h4 className="font-bold text-[#1e293b] text-[17px] mb-2">{t("landing.adv2Title")}</h4>
              <p className="text-[#475569] text-[15px] leading-relaxed">{t("landing.adv2Desc")}</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-greenPale flex items-center justify-center mb-5 shrink-0 shadow-sm border border-brand-greenSoft">
                <Truck size={28} className="text-brand-greenDeep" />
              </div>
              <h4 className="font-bold text-[#1e293b] text-[17px] mb-2">{t("landing.adv3Title")}</h4>
              <p className="text-[#475569] text-[15px] leading-relaxed">{t("landing.adv3Desc")}</p>
            </div>

          </div>
        </section>
      </div>
      <div className="flex-grow" />
      {/* Professional Dark Green Footer */}
      <footer className="w-full px-12 pt-16 pb-12 bg-brand-greenDeep text-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Logo Column */}
            <div className="flex flex-col items-start justify-start pt-2 space-y-6">
              <Logo white hideText className="scale-110" />
              <p className="text-white/50 text-sm leading-relaxed max-w-[240px]">
                {t("landing.footerAbout")}
              </p>
            </div>

            {/* Services Section */}
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-8 border-b border-white/10 pb-4">{t("landing.services")}</h4>
              <ul className="space-y-4 text-white/50 text-sm">
                <li className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                  <span className="text-[10px] opacity-30 group-hover:opacity-100 transition">›</span>
                  {t("landing.serv1")}
                </li>
                <li className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                  <span className="text-[10px] opacity-30 group-hover:opacity-100 transition">›</span>
                  {t("landing.serv2")}
                </li>
                <li className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                  <span className="text-[10px] opacity-30 group-hover:opacity-100 transition">›</span>
                  {t("landing.serv3")}
                </li>
                <li className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                  <span className="text-[10px] opacity-30 group-hover:opacity-100 transition">›</span>
                  {t("landing.serv4")}
                </li>
              </ul>
            </div>

            {/* Legal Section */}
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-8 border-b border-white/10 pb-4">{t("landing.legal")}</h4>
              <ul className="space-y-4 text-white/50 text-sm">
                <li className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                  <span className="text-[10px] opacity-30 group-hover:opacity-100 transition">›</span>
                  {t("landing.legal1")}
                </li>
                <li className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                  <span className="text-[10px] opacity-30 group-hover:opacity-100 transition">›</span>
                  {t("landing.legal2")}
                </li>
                <li className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                  <span className="text-[10px] opacity-30 group-hover:opacity-100 transition">›</span>
                  {t("landing.legal3")}
                </li>
                <li className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                  <span className="text-[10px] opacity-30 group-hover:opacity-100 transition">›</span>
                  {t("landing.legal4")}
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div className="space-y-8">
              <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-8 border-b border-white/10 pb-4">{t("landing.contact")}</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4 text-white/50 hover:text-white transition-colors cursor-pointer group">
                  <div className="bg-white/5 p-2 rounded-lg group-hover:bg-brand-green/20 transition">
                    <Globe size={18} />
                  </div>
                  <p className="text-sm">Technopark, Bureau 402 <br /> Casablanca, Maroc 20000</p>
                </div>
                <div className="flex items-center gap-4 text-white/50 hover:text-white transition-colors cursor-pointer group">
                  <div className="bg-white/5 p-2 rounded-lg group-hover:bg-brand-green/20 transition">
                    <div className="w-[18px] h-[18px] flex items-center justify-center">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M20 22.621l-3.521-6.795c-.008.004-1.974.97-2.064 1.011-2.24 1.086-6.799-7.82-4.509-8.954.058-.028 2.022-1.011 2.022-1.011l-3.535-6.872-2.019 1.013c-4.133 2.05-1.921 12.359 2.503 21.05 4.394 8.636 15.343 5.485 15.343 5.485l1.78-1.927zm-1.862-1.322s-7.143 2.454-10.38-3.901c-3.197-6.279-3.805-11.834-1.077-13.184l1.018-.511 1.761 3.423-1.014.51c-.604.305.15 1.77.712 2.875 1.251 2.461 4.75 9.336 6.365 8.553l1.042-.525 1.751 3.379-1.178 1.281z" /></svg>
                    </div>
                  </div>
                  <p className="text-sm">+212 522 489 189</p>
                </div>
                <div className="flex items-center gap-4 text-white/50 hover:text-white transition-colors cursor-pointer group">
                  <div className="bg-white/5 p-2 rounded-lg group-hover:bg-brand-green/20 transition">
                    <div className="w-[18px] h-[18px] flex items-center justify-center">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z" /></svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium">contact@greensahara.ma</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar with Badges */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-widest text-white/40 hover:bg-white/10 transition cursor-pointer">{t("landing.impact")}</div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-widest text-white/40 hover:bg-white/10 transition cursor-pointer">{t("landing.cri")}</div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-widest text-white/40 hover:bg-white/10 transition cursor-pointer">{t("landing.law")}</div>
            </div>

            <div className="flex items-center gap-8 text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">
              <span>© 2026 Green Sahara Technologies</span>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-white transition">{t("landing.privacy")}</a>
                <a href="#" className="hover:text-white transition">{t("landing.cookies")}</a>
                <a href="#" className="hover:text-white transition">{t("landing.terms")}</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
