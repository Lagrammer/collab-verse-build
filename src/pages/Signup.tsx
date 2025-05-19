
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from 'lucide-react';
import authService from '@/services/authService';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Re-check backend availability before attempting signup
    const isAvailable = await authService.checkBackendAvailability();
    if (!isAvailable) {
      setError('Backend currently unavailable. Please try again later.');
      setLoading(false);
      return;
    }
    
    try {
      const response = await authService.signup(formData);
      
      if (response.status === 'success') {
        // Redirect to login instead of email verification
        navigate('/login', { 
          state: { 
            signupSuccess: true, 
            message: 'Signup successful! You can now login with your credentials.' 
          } 
        });
      }
    } catch (error) {
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.data && error.data.message) {
        if (typeof error.data.message === 'string') {
          errorMessage = error.data.message;
        } else if (typeof error.data.message === 'object') {
          // Handle nested error messages from the API
          const messages = Object.values(error.data.message).flat();
          errorMessage = Array.isArray(messages) && messages.length > 0 
            ? messages.join('. ') 
            : errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign up</CardTitle>
          <CardDescription className="text-center">
            Create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstname" className="text-sm font-medium">First Name</label>
                <Input
                  id="firstname"
                  name="firstname"
                  placeholder="John"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                  disabled={loading || backendAvailable === false}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastname" className="text-sm font-medium">Last Name</label>
                <Input
                  id="lastname"
                  name="lastname"
                  placeholder="Doe"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  disabled={loading || backendAvailable === false}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading || backendAvailable === false}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
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
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
