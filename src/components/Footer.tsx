
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold hero-gradient">AssetVerse</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Digital Asset Management System using Web3 Technology
          </p>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} AssetVerse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
