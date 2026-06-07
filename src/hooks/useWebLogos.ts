import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import brokenBladeBanner from '../images/broken-blade-banner.png';
import webLogo from '../images/weblogo.png';

interface WebLogo {
  id: string;
  name: string;
  type: 'banner' | 'loading' | 'favicon' | 'logo';
  image_url: string;
  is_active: boolean;
  description?: string;
  created_at: string;
}

export const useWebLogos = () => {
  const [webLogos, setWebLogos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchActiveLogos = async () => {
    try {
      const { data } = await supabase
        .from('web_logos')
        .select('*')
        .eq('is_active', true);

      if (data) {
        const logosMap: Record<string, string> = {};
        data.forEach((logo) => {
          logosMap[logo.type] = logo.image_url;
        });
        setWebLogos(logosMap);
      }
    } catch (error) {
      console.error('Error fetching web logos:', error);
      // Fallback to default images
      setWebLogos({
        banner: brokenBladeBanner,
        loading: brokenBladeBanner,
        favicon: webLogo
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLogos();
  }, []);

  const getLogoUrl = (type: string, fallback?: string) => {
    return webLogos[type] || fallback || webLogo;
  };

  return {
    webLogos,
    loading,
    getLogoUrl,
    refetch: fetchActiveLogos
  };
};
