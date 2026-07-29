import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <Card hover={false} glow className="p-12 text-center max-w-md">
        <h1 className="text-7xl font-extrabold font-display text-gradient mb-4">404</h1>
        <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-400 mb-6">
          The page or hackathon resource you are looking for does not exist in the Void.
        </p>
        <Link to="/">
          <Button variant="primary">Return to Safety</Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
