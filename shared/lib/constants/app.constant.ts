import { Icons } from "@/components/ui/icons";

const kAppName = "Music Quiz";
const kAppAbbr = "MQ";
const kAppTagline = "Test your music knowledge and discover new tunes";
const kAppDescription = `Interactive music quiz application where you can test your knowledge of songs, artists, and music trivia across different genres and eras.`;

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;


export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/d',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Quiz Admin',
    url: '/d/quiz',
    icon: 'dashboard',
    isActive: false,
    items: []
  }
];

export { kAppName, kAppAbbr, kAppTagline, kAppDescription };
