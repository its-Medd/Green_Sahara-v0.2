import { Link } from "react-router-dom";
import logoSvg from "../assets/green_sahara_logo_without_background.svg";

function Logo({ white, className = "", hideText = false }) {
  return (
    <Link to="/" className={`flex flex-col items-center gap-4 ${className}`}>
      <div className={`relative flex items-center justify-center w-32 h-32 transition-all duration-500 hover:scale-105 ${white ? 'brightness-0 invert' : ''}`}>
        <img
          src={logoSvg}
          alt="Green Sahara Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </Link>
  );
}


export default Logo;



