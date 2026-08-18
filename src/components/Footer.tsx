import { Link } from "react-router-dom";
import { company } from "../data/company";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div>
          <Logo />
          <p className="tiny">
            Private Cybercab and Model Y service across Greater Orlando. Not affiliated
            with Tesla, Inc. beyond operating Tesla vehicles.
          </p>
          <p className="tiny muted">
            Photos: Cybercab by Ulkl (public domain); Model Y Juniper by Damian B Oh
            (CC BY-SA 4.0), via Wikimedia Commons.
          </p>
        </div>
        <div>
          <strong>Dispatch</strong>
          <p className="tiny">
            {company.phone}
            <br />
            {company.email}
            <br />
            {company.hours}
          </p>
        </div>
        <div>
          <strong>Go</strong>
          <p className="tiny">
            <Link to="/inspect/cybercab">Inspect Cybercab</Link>
            <br />
            <Link to="/inspect/model-y">Inspect Model Y</Link>
            <br />
            <Link to="/book">Book a ride</Link>
            <br />
            <Link to="/fleet">Hangar</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
