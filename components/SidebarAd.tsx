import React, { useEffect } from 'react';

const SidebarAd: React.FC = () => {
  useEffect(() => {
    // Dynamically load the ad script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://www.highperformanceformat.com/9116f197ddf384fd8afefb9494e24fa4/invoke.js';
    
    const container = document.getElementById('sidebar-ad-container');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      // Cleanup
      const script = document.querySelector('script[src="https://www.highperformanceformat.com/9116f197ddf384fd8afefb9494e24fa4/invoke.js"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div className="sticky top-24 flex justify-center p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
      <div id="sidebar-ad-container">
        <script type="text/javascript">
          {`atOptions = {
            'key' : '9116f197ddf384fd8afefb9494e24fa4',
            'format' : 'iframe',
            'height' : 300,
            'width' : 160,
            'params' : {}
          };`}
        </script>
      </div>
    </div>
  );
};

export default SidebarAd;
