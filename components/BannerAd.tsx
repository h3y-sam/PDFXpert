import React, { useEffect } from 'react';

const BannerAd: React.FC = () => {
  useEffect(() => {
    // Dynamically load the ad script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://www.highperformanceformat.com/c90d989458eaf1f9a114c4d79457346a/invoke.js';
    
    const container = document.getElementById('banner-ad-container');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      // Cleanup
      const script = document.querySelector('script[src="https://www.highperformanceformat.com/c90d989458eaf1f9a114c4d79457346a/invoke.js"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center py-4 bg-gray-50 dark:bg-slate-800/50">
      <div id="banner-ad-container">
        <script type="text/javascript">
          {`atOptions = {
            'key' : 'c90d989458eaf1f9a114c4d79457346a',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
          };`}
        </script>
      </div>
    </div>
  );
};

export default BannerAd;
