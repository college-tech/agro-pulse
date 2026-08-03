import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import Logo from "../../../public/images/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../common/Avatar";

const Nav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Using the Firebase-aware AuthContext
  const { currentUser, userDetails, logout } = useAuth();

  const isLoggedIn = !!currentUser;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeButton, setActiveButton] = useState('signup');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Handle scroll effect for Navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const navLinks = isLoggedIn ? ['Home', 'MyPlant Map', 'Community Map', 'Dashboard'] : ['Home', 'Community Map', 'Our Vision', 'Thoughts', 'About Us'];

  // Sign out handler (async because logout may be async)
  const handleSignOut = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      navigate('/'); // optional: redirect to home or login
      console.log('User signed out');
    } catch (err) {
      console.error('Sign out failed', err);
    }
  };

  const handleLinkClick = (e, item) => {
    if (item === 'Home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMobileMenuOpen(false); // Close mobile menu on click
  };

  // Avatar data (prefer uploaded avatarUrl, else seeded uid)
  const displayName =
    userDetails?.displayName || userDetails?.name || currentUser?.displayName || 'User';
  const avatarChoice = userDetails?.avatarChoice || 'adventurer';

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${
          isScrolled ? 'bg-forest-base/80 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 py-0.2 flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="bg-transparent rounded-lg text-white">
              <img src={Logo} alt="" className="w-12 rounded-4xl bg-transparent" />
            </div>
            <span className={`text-2xl font-bold tracking-wide ${isScrolled ? 'text-white' : 'text-white'}`}>
              AgroPulse
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((item) =>
              item === "Home" ? (
                <Link
                  key={item}
                  to="/"
                  className="font-medium text-sm uppercase tracking-wider transition-colors text-forest-text hover:text-forest-accent"
                >
                  Home
                </Link>
              ) : item === "Community Map" ? (
                <Link
                  key={item}
                  to="/map"
                  className="font-medium text-sm uppercase tracking-wider transition-colors text-forest-text hover:text-forest-accent"
                >
                  {item}
                </Link>
              ) : item === "Dashboard" ? (
                <Link
                  key={item}
                  to="/Dashboard"
                  className="font-medium text-sm uppercase tracking-wider transition-colors text-forest-text hover:text-forest-accent"
                >
                  {item}
                </Link>
              ) : item === "MyPlant Map" ? (
                <Link
                  key={item}
                  to="/myplantmap"
                  className="font-medium text-sm uppercase tracking-wider transition-colors text-forest-text hover:text-forest-accent"
                >
                  {item}
                </Link>
              ) : (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  onClick={(e) => handleLinkClick(e, item)}
                  className="font-medium text-sm uppercase tracking-wider transition-colors text-forest-text hover:text-forest-accent"
                >
                  {item}
                </a>
              )
            )}
          </div>

          {/* Login / Signup or User Menu */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center relative user-menu">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-forest-text hover:text-forest-accent cursor-pointer"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                {/* Avatar component shows seeded avatar or uploaded avatarUrl */}
                <Avatar key={`${currentUser?.uid}-${avatarChoice}`} uid={currentUser?.uid || 'default'} avatarChoice={avatarChoice} size={50} alt={displayName} />
                <ChevronDown size={16} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-forest-base border border-forest-border rounded-lg shadow-xl py-2 z-50">
                  <div className="px-3 py-2 border-b border-forest-border">
                    <div className="flex items-center gap-3">
                      <Avatar key={`${currentUser?.uid}-${avatarChoice}-dropdown`} uid={currentUser?.uid || 'default'} avatarChoice={avatarChoice} size={48} alt={displayName} />
                      <div>
                        <div className="font-medium text-sm text-forest-text">{displayName}</div>
                        {/* <div className="text-xs text-forest-text/70">{currentUser?.email}</div> */}
                      </div>
                    </div>  
                  </div>

                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                    className="w-full text-left px-4 py-2 text-forest-text hover:bg-forest-border hover:text-white transition-colors"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/profile/edit'); }}
                    className="w-full text-left px-4 py-2 text-forest-text hover:bg-forest-border hover:text-white transition-colors"
                  >
                    Edit Profile
                  </button>

                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/Dashboard'); }}
                    className="w-full text-left px-4 py-2 text-forest-text hover:bg-forest-border hover:text-white transition-colors"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/profile/security'); }}
                    className="w-full text-left px-4 py-2 text-forest-text hover:bg-forest-border hover:text-white transition-colors"
                  >
                    Account Security
                  </button>

                  <div className="border-t border-forest-border mt-2 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-forest-text hover:bg-forest-border hover:text-white transition-colors"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`hidden md:flex items-center gap-4 ${location.pathname === "/login" || location.pathname === "/signup" ? 'invisible' : ''}`}>
              <button
                onClick={() => setActiveButton('login')}
                className={`font-medium transition-colors px-4 py-2 rounded-full ${
                  activeButton === 'login'
                    ? 'bg-forest-accent text-forest-base font-bold shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                    : 'text-forest-text hover:text-forest-accent'
                }`}
              >
                <Link to="/login">Log in</Link>
              </button>
              <button
                onClick={() => setActiveButton('signup')}
                className={`font-medium transition-colors px-4 py-2 rounded-full ${
                  activeButton === 'signup'
                    ? 'bg-forest-accent text-forest-base font-bold shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                    : 'text-forest-text hover:text-forest-accent'
                }`}
              >
                <Link to="/signup">Sign up</Link>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-forest-base border-b border-forest-border p-6 flex flex-col gap-4 shadow-2xl">
            {navLinks.map((item) =>
              item === "Home" ? (
                <Link
                  key={item}
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-lg font-medium hover:text-forest-accent"
                >
                  Home
                </Link>
              ) : item === "Community Map" ? (
                <Link
                  key={item}
                  to="/map"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-lg font-medium hover:text-forest-accent"
                >
                  {item}
                </Link>
              ) : item === "Dashboard" ? (
                <Link
                  key={item}
                  to="/Dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-lg font-medium hover:text-forest-accent"
                >
                  {item}
                </Link>
              ) : (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  onClick={(e) => handleLinkClick(e, item)}
                  className="text-white text-lg font-medium hover:text-forest-accent"
                >
                  {item}
                </a>
              )
            )}
            {!isLoggedIn && location.pathname !== "/login" && location.pathname !== "/signup" && (
              <>
                <hr className="border-forest-border my-2" />
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-left text-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-forest-accent text-forest-base py-3 rounded-lg text-lg font-bold block"
                >
                  Sign Up
                </Link>
              </>
            )}
            {isLoggedIn && (
              <>
                <hr className="border-forest-border my-2" />
                <div className="flex items-center gap-3">
                  <Avatar key={`${currentUser?.uid}-${avatarChoice}-mobile`} uid={currentUser?.uid || 'default'} avatarChoice={avatarChoice} size={48} alt={displayName} />
                  <div className="text-white text-lg font-medium">{displayName}</div>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}
                  className="text-white text-left text-lg"
                >
                  View Profile
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/profile/edit'); }}
                  className="text-white text-left text-lg"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/Dashboard'); }}
                  className="text-white text-left text-lg"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/profile/security'); }}
                  className="text-white text-left text-lg"
                >
                  Account Security
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-white text-left text-lg"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Nav;
