import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);


  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        {/* Logo */}
        <Link className="navbar-brand " to="/">
          FOLDERIT
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen ? 'true' : 'false'}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        


        {/* Right Side Links */}
        <ul className="navbar-nav ms-auto ">
          <li className="nav-item mr-3">
            <Link className="nav-link" to="/search">
            Search
            </Link>
          </li>
          <li className="nav-item">
            <Link className="btn btn-outline-primary me-2" to="/login">
              Sign In
            </Link>
          </li>
          <li className="nav-item">
            {/* <Link className="btn btn-primary" to="/try">
                Try for Free
              </Link> */}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 