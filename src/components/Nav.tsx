import { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";

const links = [
  { to: "/inspect/cybercab", label: "Cybercab" },
  { to: "/inspect/model-y", label: "Model Y" },
  { to: "/book", label: "Book" },
  { to: "/fleet", label: "Fleet" },
  { to: "/coverage", label: "Coverage" },
  { to: "/rides", label: "Rides" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="shell nav-inner">
        <Logo />
        <button className="menu-btn" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          Menu
        </button>
        <nav className={`nav-links ${open ? "open" : ""}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
