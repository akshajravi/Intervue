import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-md px-4 py-3">
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="pl-2">
            <Link className="text-xl font-bold text-black" to="/">Intervue</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link className="text-secondary-700 hover:text-primary transition-colors" to="/about">About</Link>
            <Link className="text-secondary-700 hover:text-primary transition-colors" to="/login">Login</Link>
            <Link className="text-secondary-700 hover:text-primary transition-colors" to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;