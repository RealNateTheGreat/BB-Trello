import React from 'react';
import { Bell, Bug, CalendarDays, Eye, Lightbulb, Megaphone, ShieldAlert, Sparkles, Users } from 'lucide-react';

interface InfoItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface InfoSection {
  title: string;
  intro?: string;
  items: InfoItem[];
}

const channels: InfoItem[] = [
  {
    title: '〔📢〕game-news',
    description: 'Game updates, patch notes, and important development announcements.',
    icon: <Megaphone className="h-5 w-5" />
  },
  {
    title: '〔📢〕server-news',
    description: 'Community updates and Discord server announcements.',
    icon: <Bell className="h-5 w-5" />
  },
  {
    title: '〔📅〕events',
    description: 'Information about upcoming events, activities, and community-hosted events.',
    icon: <CalendarDays className="h-5 w-5" />
  },
  {
    title: '〔👀〕sneak-peeks',
    description: 'Preview upcoming content, weapons, updates, and features.',
    icon: <Eye className="h-5 w-5" />
  },
  {
    title: '〔🙋‍♂️〕support',
    description: 'Use this channel for item retrieval, role applications, Discord moderation issues, and general support.',
    icon: <Users className="h-5 w-5" />
  },
  {
    title: '〔🪲〕bugs',
    description: 'Report bugs, glitches, or game-related issues.',
    icon: <Bug className="h-5 w-5" />
  },
  {
    title: '〔💡〕game-suggestions',
    description: 'Submit ideas, feedback, and suggestions for the game.',
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    title: '〔🚫〕exploiters',
    description: 'Report exploiters or request account restoration support.',
    icon: <ShieldAlert className="h-5 w-5" />
  }
];

const roleSections: InfoSection[] = [
  {
    title: 'Main Roles',
    intro: 'Please use the correct community channels before contacting any role member directly.',
    items: [
      { title: '@OWNER', description: 'Contact only for business inquiries or recruitment-related matters.' },
      { title: '@D.', description: 'Members of the development team. Do not ping or DM them unless necessary.' },
      { title: '@Community Manager', description: 'Oversees the Discord community and server operations.' },
      { title: '@Pioneer', description: 'Experienced players, independent strategists, and guide/tutorial creators.' }
    ]
  },
  {
    title: 'Staff Roles',
    items: [
      { title: '@Moderator', description: 'Enforces server rules, maintains channel order, and helps resolve tickets.' },
      { title: '@Trial Moderator', description: 'Moderators in training.' },
      { title: '@Content Creator', description: 'Official or recognized content creators for Broken Blade.' },
      { title: '@Greeter', description: 'Helps new members with Discord navigation and general server questions.' }
    ]
  }
];

const levelRoles: InfoItem[] = [
  { title: '@Server Booster', description: 'Perks include Embed Links & Attach Files, Use External Emoji & Stickers, Stream in #streamvc, Create Nickname, and Bypass Slowmode.' },
  { title: '@First Place Role', description: 'Vanity Role.' },
  { title: '@[75]', description: 'Vanity Role.' },
  { title: '@[65]', description: 'Vanity Role.' },
  { title: '@[55]', description: 'Vanity Role.' },
  { title: '@[50]', description: 'Bypass Slowmode.' },
  { title: '@[45]', description: 'Vanity Role.' },
  { title: '@[40]', description: 'Create Nickname.' },
  { title: '@[35]', description: 'Vanity Role.' },
  { title: '@[30]', description: 'Use External Emoji & Stickers.' },
  { title: '@[25]', description: 'Vanity Role.' },
  { title: '@[20]', description: 'Vanity Role.' },
  { title: '@[15]', description: 'Unlocks high-level chat channel.' },
  { title: '@[10]', description: 'Embed Links & Attach Files.' },
  { title: '@[5]', description: 'Vanity Role.' }
];

const selfAssignableRoles: InfoItem[] = [
  { title: '@Server Updates Ping', description: 'Receive pings for Discord server and community updates.' },
  { title: '@Sneak Peeks Ping', description: 'Receive pings when developers share sneak peeks of upcoming content.' },
  { title: '@Giveaways Ping', description: 'Receive pings whenever a new giveaway is hosted.' },
  { title: '@Events Ping', description: 'Receive pings for events and community activities.' },
  { title: '@Wiki Updates Ping', description: 'Receive pings for updates regarding the official Broken Blade Wiki.' },
  { title: '@Content Creator Upload Ping', description: 'Receive pings when community content creators upload new videos or start streams.' }
];

const Home: React.FC = () => {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl pt-20 md:pt-24">
        <section className="mb-8 rounded-lg border-2 p-6 shadow-2xl bb-panel md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Broken Blade</p>
              <h1 className="mt-2 text-4xl font-black text-stone-50 md:text-6xl">Community Guide</h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-200">
                Use the correct channels, understand the server roles, and ask for help in the right place.
              </p>
            </div>
            <div className="rounded-lg border border-red-500/40 bg-red-950/20 px-4 py-3 text-sm font-semibold text-red-100">
              Start in 〔🙋‍♂️〕support when you need help.
            </div>
          </div>
        </section>

        <InfoGrid title="Important Channels" items={channels} columns="lg:grid-cols-4" />

        <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {roleSections.map((section) => (
            <InfoPanel key={section.title} section={section} />
          ))}
        </section>

        <InfoGrid title="Level Roles" items={levelRoles} columns="md:grid-cols-2 xl:grid-cols-3" />
        <InfoGrid title="Self-Assignable Roles" items={selfAssignableRoles} columns="md:grid-cols-2 xl:grid-cols-3" />

        <section className="mt-10 rounded-lg border-2 p-6 text-center shadow-xl bb-panel">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-red-200" />
          <h2 className="text-2xl font-black text-stone-50">Need Help?</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-red-100">
            For support, use <strong>〔🙋‍♂️〕support</strong> instead of directly messaging staff members.
            Please make sure you are using the correct channel before asking for help.
          </p>
        </section>
      </div>
    </main>
  );
};

interface InfoGridProps {
  title: string;
  items: InfoItem[];
  columns: string;
}

const InfoGrid: React.FC<InfoGridProps> = ({ title, items, columns }) => (
  <section className="mt-10">
    <div className="mb-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-700/70 to-transparent" />
      <h2 className="text-center text-2xl font-black text-stone-50 md:text-3xl">{title}</h2>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-700/70 to-transparent" />
    </div>
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${columns}`}>
      {items.map((item) => (
        <InfoTile key={`${title}-${item.title}`} item={item} />
      ))}
    </div>
  </section>
);

const InfoPanel: React.FC<{ section: InfoSection }> = ({ section }) => (
  <section className="rounded-lg border-2 p-5 shadow-xl bb-panel">
    <h2 className="text-2xl font-black text-stone-50">{section.title}</h2>
    {section.intro && <p className="mt-2 text-sm leading-relaxed text-red-100/85">{section.intro}</p>}
    <div className="mt-5 space-y-3">
      {section.items.map((item) => (
        <InfoTile key={`${section.title}-${item.title}`} item={item} compact />
      ))}
    </div>
  </section>
);

const InfoTile: React.FC<{ item: InfoItem; compact?: boolean }> = ({ item, compact }) => (
  <article
    className={`rounded-lg border p-4 transition-all duration-200 hover:border-red-400/70 hover:bg-red-950/25 ${
      compact ? '' : 'min-h-[132px]'
    }`}
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.22)', borderColor: 'rgba(185, 28, 28, 0.35)' }}
  >
    <div className="flex items-start gap-3">
      {item.icon && (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-red-100"
          style={{ backgroundColor: 'rgba(127, 29, 29, 0.22)', borderColor: 'rgba(239, 68, 68, 0.42)' }}
        >
          {item.icon}
        </div>
      )}
      <div className="min-w-0">
        <h3 className="text-lg font-black text-stone-50">{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-200">{item.description}</p>
      </div>
    </div>
  </article>
);

export default Home;
