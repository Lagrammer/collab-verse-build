
import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { Sun, Moon, Monitor } from 'lucide-react';

const Theme = () => {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme || 'dark');

  const handleThemeChange = (newTheme: string) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  return (
    <Layout>
      <div className="flex-1 container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Theme Settings</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how CollabVerse looks on your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ThemeButton 
                title="Light"
                description="Light mode appearance"
                icon={<Sun />}
                isSelected={selectedTheme === 'light'}
                onClick={() => handleThemeChange('light')}
              />
              
              <ThemeButton 
                title="Dark"
                description="Dark mode appearance"
                icon={<Moon />}
                isSelected={selectedTheme === 'dark'}
                onClick={() => handleThemeChange('dark')}
              />
              
              <ThemeButton 
                title="System"
                description="Follow system settings"
                icon={<Monitor />}
                isSelected={selectedTheme === 'system'}
                onClick={() => handleThemeChange('system')}
              />
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              These settings only apply to this device.
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

interface ThemeButtonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({
  title,
  description,
  icon,
  isSelected,
  onClick,
}) => (
  <Button
    variant="outline"
    className={`h-auto flex flex-col items-center justify-center p-6 gap-4 w-full hover:bg-accent ${
      isSelected ? 'border-primary ring-2 ring-primary/20' : ''
    }`}
    onClick={onClick}
  >
    <div className="text-2xl">{icon}</div>
    <div className="text-center">
      <h3 className="font-medium">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </Button>
);

export default Theme;
