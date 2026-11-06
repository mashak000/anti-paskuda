import { Outlet, useLocation } from 'react-router';
import SignOut from '../components/SignOut';
import { useTranslation } from 'react-i18next';
import SetupStepper from '../pages/setup/SetupStepper';

export default function SetupLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const step =
    pathname === '/setup/profile'
      ? { step: 1, total: 2 }
      : { step: 2, total: 2 };

  return (
    <main className="min-h-screen mt-8">
      <header>
        <div>
          <h1>{t('appName')}</h1>
          <p className="ml-8 mt-1 text-retro-disabled-text">{t('motto')}</p>
        </div>
        <SetupStepper step={step} />
      </header>

      <SignOut />
      <Outlet />
    </main>
  );
}
