import { Outlet } from 'react-router';
import NavBar from '../components/Navbar';

function AppLayout() {
  return (
    <>
      <Outlet />
      <NavBar />
    </>
  );
}

export default AppLayout;
