import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

const navItems = [
  { to: '/', label: 'nav.home' },
  { to: '/expenses', label: 'nav.expenses' },
  { to: '/debt', label: 'nav.debt' },
  { to: '/profile', label: 'nav.profile' },
];

export default function NavBar() {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 w-screen">
      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-12 items-center justify-center gap-2 
               border-2 px-2
              text-xl text-nav-text
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-nav-focus
              md:px-5
              ${
                isActive
                  ? `
                 anonymous-pro-bold-italic border-t-nav-edge-dark 
                 border-l-nav-edge-dark border-r-nav-edge-light 
                 border-b-nav-edge-light bg-nav-active
                  `
                  : `
                  anonymous-pro-bold
                    border-t-nav-edge-light border-l-nav-edge-light
                    border-r-nav-edge-dark border-b-nav-edge-dark
                     bg-nav-bg hover:bg-nav-hover
                  `
              }`
            }
          >
            {t(label)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
