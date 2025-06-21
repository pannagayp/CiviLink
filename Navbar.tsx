
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Link2, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3 bg-white/95 backdrop-blur-sm shadow-sm' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-civilink-blue text-white">
            <Link2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-medium text-civilink-text">CiviLink</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors duration-200 ${
              location.pathname === '/' 
                ? 'text-civilink-blue' 
                : 'text-civilink-text hover:text-civilink-blue'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/issues" 
            className={`text-sm font-medium transition-colors duration-200 ${
              location.pathname === '/issues' 
                ? 'text-civilink-blue' 
                : 'text-civilink-text hover:text-civilink-blue'
            }`}
          >
            Issues
          </Link>
          {user && (
            <Link 
              to="/report" 
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname === '/report' 
                  ? 'text-civilink-blue' 
                  : 'text-civilink-text hover:text-civilink-blue'
              }`}
            >
              Report Issue
            </Link>
          )}
        </nav>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden md:inline-flex items-center gap-2 text-sm">
                <User size={16} />
                {user.email?.split('@')[0]}
              </span>
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="text-civilink-text hover:text-civilink-blue"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="hidden md:inline-flex"
              >
                Login
              </Button>
              <Button 
                variant="default" 
                onClick={() => navigate('/auth')}
                className="bg-civilink-blue hover:bg-civilink-darkBlue text-white shadow-button transition-all duration-300 hover:shadow-lg"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
