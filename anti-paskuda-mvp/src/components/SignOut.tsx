import { useState } from 'react';
import { supabase } from '../lib/supabaseCLient';

export default function SignOut() {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignout() {
    const { error } = await supabase.auth.signOut();
    setErrorMessage(error?.message ?? null);
  }
  return (
    <>
      <button
        className="fixed top-0 right-0"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        signout
      </button>
      {isOpen && (
        <div>
          <p> Are u sure?</p>
          <button onClick={handleSignout}>Yes</button>
          <button onClick={() => setIsOpen((prev) => !prev)}>No</button>
        </div>
      )}
      {errorMessage && <p>ERROR</p>}
    </>
  );
}
