
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Rocket, ArrowLeft } from 'lucide-react';

const ComingSoon: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const toolName = path.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Tool";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-blue-50 p-6 rounded-full mb-6 animate-bounce">
        <Rocket className="w-12 h-12 text-blue-600" />
      </div>
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{toolName}</h1>
      <p className="text-xl text-gray-500 max-w-lg mb-8">
        We are working hard to build this tool. It will be available in a future update!
      </p>
      
      <div className="flex gap-4">
        <Link 
          to="/tools" 
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
