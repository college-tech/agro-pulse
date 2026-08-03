import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  // 1. Get the current location object from React Router
  const { pathname } = useLocation();

  // 2. Run this effect every time the 'pathname' (URL path) changes
  useEffect(() => {
    window.scrollTo({
        top: 0,
        left: 0,
        // Optional: you can use 'smooth' for a scrolling animation if preferred
        behavior: 'instant' 
    });
  }, [pathname]); // Dependency array: ensures the effect runs only on path change
  return null; 
}

export default ScrollToTop;