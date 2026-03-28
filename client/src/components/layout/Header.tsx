/**
 * Header — compone TopBar + Navbar en un solo bloque
 */
import TopBar from './TopBar';
import Navbar from './Navbar';

interface TopBarProps {
  // Add TopBar props if needed
  [key: string]: any;
}

interface NavbarProps {
  logoSrc?: string;
  logoAlt?: string;
  navItems?: NavItem[];
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

interface HeaderProps {
  topBarProps?: TopBarProps;
  navbarProps?: NavbarProps;
}

export default function Header({ topBarProps = {}, navbarProps = {} }: HeaderProps) {
  return (
    <header>
      <TopBar {...topBarProps} />
      <Navbar {...navbarProps} />
    </header>
  );
}
