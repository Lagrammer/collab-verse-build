
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from 'lucide-react';
import authService from '@/services/authService';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // Check backend availability on component mount
    const checkBackend = async () => {
      const isAvailable = await authService.checkBackendAvailability();
      setBackendAvailable(isAvailable);
      if (!isAvailable) {
        setError('Backend currently unavailable. Please try again later.');
      }
    };
    
    checkBackend();

    // Check for signup success message
    if (location.state?.signupSuccess) {
      setSuccess(location.state.message || 'Signup successful! You can now login with your credentials.');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Re-check backend availability before attempting login
    const isAvailable = await authService.checkBackendAvailability();
    if (!isAvailable) {
      setError('Backend currently unavailable. Please try again later.');
      setLoading(false);
      return;
    }
    
    try {
      const response = await authService.login({ email, password });
      
      // If the login is successful and we get tokens, redirect to home
      if (response.access_token) {
        navigate('/');
      }
      // Handle email verification case - redirect to verification page
      else if (response.action === 'redirect to email verification page') {
        navigate('/verify-email', { 
          state: { 
            email: email,
            message: response.message || 'Please verify your email to continue.' 
          } 
        });
      }
      // Any other case should navigate to home if authentication is successful
      else if (authService.isAuthenticated()) {
        navigate('/');
      }
    } catch (error) {
      // Handle email verification specific error
      if (error.data && error.data.action === 'redirect to email verification page') {
        navigate('/verify-email', { 
          state: { 
            email: email,
            message: error.data.message || 'Please verify your email to continue.' 
          } 
        });
      } else {
        setError(typeof error.message === 'string' ? error.message : 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {backendAvailable === false && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Backend currently unavailable. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || backendAvailable === false}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || backendAvailable === false}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || backendAvailable === false}
            >
              {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
