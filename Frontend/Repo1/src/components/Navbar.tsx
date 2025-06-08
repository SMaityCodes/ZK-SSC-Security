import {Button} from "./ui/button";
import reactLogo from '../assets/react.svg';
import { Link } from 'react-router-dom'; // or use next/link if using Next.js

export default function Navbar() {
  return (
    <nav className="absolute top-0 w-full z-20 flex justify-between items-center px-10 py-6 backdrop-blur-sm bg-white/5">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img 
          src={reactLogo} 
          alt="Logo" 
          className="h-8 w-8" 
        />
      </div>

      {/* Navigation Buttons */}
      <div className="space-x-4 text-sm md:flex">
        <Button
          variant="ghost"
          className="text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white"
        >
          <Link to="/about">Products</Link>
        </Button>
        <Button
          variant="ghost"
          className="text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white"
        >
          <Link to="/services">Services</Link>
        </Button>
        <Button
          variant="ghost"
          className="text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white"
        >
          <Link to="/contact">Contact</Link>
        </Button>
        <Button
          variant="ghost"
          className="bg-transparent text-blue-600 border border-blue-600 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition-all duration-300"
        >
          <Link to="/login">Log in</Link>
        </Button>

        {/* Sign Up Button */}
        <Button
          variant="outline"
          className="bg-blue-600 text-white border border-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-transparent hover:text-blue-600"
        >
          <Link to="/signup">Sign up</Link>
        </Button>
      </div>
    </nav>
  );
}