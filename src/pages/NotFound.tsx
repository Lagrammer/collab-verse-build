
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-brand-yellow">404</h1>
        <p className="text-xl text-foreground mb-4">Oops! Page not found</p>
        <p className="text-muted-foreground max-w-md">
          We couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <a href="/" className="inline-block mt-4 py-2.5 px-6 bg-brand-yellow text-black rounded-full font-medium hover:bg-brand-yellow/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
