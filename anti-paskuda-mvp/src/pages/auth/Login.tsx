import { Navigate } from 'react-router';
import { useAuth } from '../../auth/auth-context';
import { supabase } from '../../lib/supabaseCLient';
import head from '../../assets/head-1.png';
import boy from '../../assets/boy.jpg';
import googleLogo from '../../assets/g_logo.svg';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export default function Login() {
  const { t } = useTranslation();
  const { session, isLoading } = useAuth();
  const [isModalOpen, setIsOpenModal] = useState(false);
  const [isStartingSignIn, setIsStartingSignIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignInWithGoogle() {
    setIsStartingSignIn(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Could not start Google sign-in:', error);

      setErrorMessage('Could not start sign-in. Please try again.');
      setIsStartingSignIn(false);
    }
  }

  if (isLoading) {
    return <p role="status">Checking your session…</p>;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className=" flex flex-col text-center min-h-dvh items-center justify-evenly bg-retro-surface p-4">
      <header className="flex relative w-full max-w-sm flex-col items-center gap-1">
        <p>{t('welcome.hb')}</p>
        <h1 className="text-2xl">{t('appName')}</h1>
        <span className="gift-label absolute top-26 right-0">
          {t('welcome.label')}
        </span>
      </header>
      <figure className="w-50 max-w-full">
        <div className="retro-photo-frame">
          <img src={boy} alt="ph" className="block w-full object-cover" />
        </div>

        <figcaption className="mt-1 text-sm leading-none">
          {t('welcome.photo')}
        </figcaption>
      </figure>

      <p className="max-w-sm whitespace-pre-line text-xl leading-none">
        {t('welcome.desc')}
      </p>

      <Button onClick={() => setIsOpenModal(true)} className="w-full max-w-sm">
        {t('welcome.start')}
      </Button>

      <p className="text-sm">{t('welcome.made')}</p>

      <Modal
        open={isModalOpen}
        title={t('auth.title')}
        onClose={() => setIsOpenModal(false)}
      >
        <section className="flex-col items-center gap-6 text-center">
          <p className="mb-3 whitespace-pre-line text-2xl leading-none">
            {t('auth.welcomeMsg')}
          </p>

          <img src={head} className="w-50 mb-6 object-contain  mx-auto" />
          <Button
            onClick={handleSignInWithGoogle}
            disabled={isStartingSignIn}
            className="w-full"
          >
            <img src={googleLogo} className="mr-10" />
            {isStartingSignIn ? 'Opening Google…' : t('auth.login')}
          </Button>
          <p className="mt-4 text-retro-disabled-text anonymous-pro-regular-italic">
            {t('auth.explain')}
          </p>


          {errorMessage && (
            <p role="alert" className="mt-4">
              {errorMessage}
            </p>
          )}
        </section>
      </Modal>
    </main>
  );
}
