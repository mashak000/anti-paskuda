import { useState } from 'react';
import { supabase } from '../lib/supabaseCLient';
import Button from './Button';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';

export default function SignOut() {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  async function handleSignout() {
    const { error } = await supabase.auth.signOut();
    setErrorMessage(error?.message ?? null);
  }
  return (
    <>
      <Button className="fixed top-0 right-0" onClick={() => setIsOpen(true)}>
        {t('auth.logout')}
      </Button>
      <Modal
        title={t('auth.exit')}
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <p className="mb-4">{t('auth.sure')}</p>
        <Button onClick={handleSignout}>{t('yes')}</Button>
      </Modal>
      {errorMessage && <p>ERROR</p>}
    </>
  );
}
