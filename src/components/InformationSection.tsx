import React from 'react';
import { Award, ExternalLink, Megaphone, Shield } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DISCORD_INVITE = import.meta.env.VITE_DISCORD_INVITE_URL || 'https://discord.gg/8QeE9RPtcA';

const InformationSection: React.FC = () => {
  const { user } = useAuth();

  return (
    <section className="mt-8 pb-16">
      <div className="mb-8 h-1 w-full bg-gradient-to-r from-transparent via-red-700 to-transparent" />

      <h2 className="mb-8 text-center text-3xl font-bold text-stone-50 md:text-4xl">
        Broken Blade Hub
      </h2>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HubLink
          title="Discord"
          subtitle="Community"
          href={DISCORD_INVITE}
          icon={<FaDiscord className="h-6 w-6" />}
          external
        />
        <HubLink
          title="Credits"
          subtitle="Team"
          to="/credits"
          icon={<Award className="h-6 w-6" />}
        />
        <HubLink
          title="Announcements"
          subtitle="Updates"
          icon={<Megaphone className="h-6 w-6" />}
          href={DISCORD_INVITE}
          external
        />
        <HubLink
          title="Management"
          subtitle={user?.dashboard_access ? user.role_name : 'Invite Only'}
          to={user?.dashboard_access ? '/management' : undefined}
          icon={<Shield className="h-6 w-6" />}
          disabled={!user?.dashboard_access}
        />
      </div>
    </section>
  );
};

interface HubLinkProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  to?: string;
  href?: string;
  external?: boolean;
  disabled?: boolean;
}

const content = (title: string, subtitle: string, icon: React.ReactNode, external?: boolean) => (
  <>
    <div className="mb-5 flex items-center justify-between">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-lg border text-red-100"
        style={{ backgroundColor: 'rgba(127, 29, 29, 0.24)', borderColor: 'rgba(239, 68, 68, 0.45)' }}
      >
        {icon}
      </div>
      {external && <ExternalLink className="h-4 w-4 text-red-200/80" />}
    </div>
    <span className="block text-xl font-bold text-stone-50">{title}</span>
    <span className="mt-1 block text-sm text-red-100/80">{subtitle}</span>
  </>
);

const HubLink: React.FC<HubLinkProps> = ({ title, subtitle, icon, to, href, external, disabled }) => {
  const className =
    'group block min-h-[156px] rounded-lg border-2 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-red-400 hover:bg-red-950/30';
  const style = {
    backgroundColor: disabled ? 'rgba(18, 18, 18, 0.55)' : 'rgba(24, 18, 16, 0.86)',
    borderColor: disabled ? 'rgba(120, 113, 108, 0.36)' : 'rgba(185, 28, 28, 0.58)',
    opacity: disabled ? 0.66 : 1
  };

  if (to && !disabled) {
    return (
      <Link to={to} className={className} style={style}>
        {content(title, subtitle, icon, external)}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} style={style}>
        {content(title, subtitle, icon, external)}
      </a>
    );
  }

  return (
    <div className={className} style={style}>
      {content(title, subtitle, icon, external)}
    </div>
  );
};

export default InformationSection;
