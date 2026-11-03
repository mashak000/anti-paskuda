import { Outlet } from 'react-router';
import NavBar from '../components/Navbar';
import SignOut from '../components/SignOut';

function AppLayout() {
  return (
    <>
      <SignOut />
      <Outlet />
      <NavBar />
    </>
  );
}

export default AppLayout;
