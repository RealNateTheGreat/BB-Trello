import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, Megaphone, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  active: boolean;
  priority: number;
  expires_at?: string;
  created_at: string;
}

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({ isOpen, onClose }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchAnnouncements();
    }
  }, [isOpen]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements((data || []) as Announcement[]);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-300" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-300" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-300" />;
      default:
        return <Info className="h-5 w-5 text-sky-300" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[82vh] w-full max-w-2xl overflow-hidden rounded-lg border-2 shadow-2xl bb-panel animate-fade-in">
        <div className="flex items-center justify-between border-b border-red-900/40 p-6">
          <div className="flex items-center space-x-3">
            <div
              className="rounded-lg border p-2"
              style={{ backgroundColor: 'rgba(127, 29, 29, 0.25)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
            >
              <Megaphone className="h-6 w-6 text-red-100" />
            </div>
            <h2 className="text-2xl font-black text-stone-50">Announcements</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border p-2 text-red-100 transition-colors hover:bg-red-950/35"
            style={{ borderColor: 'rgba(239, 68, 68, 0.35)' }}
            aria-label="Close announcements"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[28rem] overflow-y-auto p-6">
          {loading ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-red-400" />
              <p className="text-red-100">Loading announcements...</p>
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="rounded-lg border p-4"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.22)', borderColor: 'rgba(185, 28, 28, 0.35)' }}
                >
                  <div className="flex items-start space-x-3">
                    {getTypeIcon(announcement.type)}
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-bold text-stone-50">{announcement.title}</h3>
                      <p className="leading-relaxed text-stone-200">{announcement.content}</p>
                      <p className="mt-3 text-xs text-red-200/80">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border-2"
                style={{ backgroundColor: 'rgba(127, 29, 29, 0.25)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
              >
                <Megaphone className="h-8 w-8 text-red-100" />
              </div>
              <h3 className="mb-2 text-xl font-black text-stone-50">No Announcements</h3>
              <p className="text-red-100">Nothing is active right now.</p>
            </div>
          )}
        </div>

        <div className="flex justify-center border-t border-red-900/40 p-4">
          <button
            onClick={onClose}
            className="rounded-lg border px-6 py-3 font-semibold text-red-50 transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: 'rgba(185, 28, 28, 0.55)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsModal;
