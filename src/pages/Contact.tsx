import { useState, type FormEvent } from "react";
import { company } from "../data/company";

const KEY = "oct-messages-v1";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = { name, email, message, at: new Date().toISOString() };
    const prev = JSON.parse(localStorage.getItem(KEY) || "[]") as unknown[];
    localStorage.setItem(KEY, JSON.stringify([payload, ...prev]));
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  }

  return (
    <section className="section">
      <div className="shell grid-2">
        <div>
          <p className="kicker">Dispatch office</p>
          <h2>Talk to the desk</h2>
          <p className="lede">
            Lake Nona operations. We answer for airport stands, park exits, and downtown
            last-calls.
          </p>
          <p>
            {company.phone}
            <br />
            {company.email}
            <br />
            Owner: {company.ownerEmail}
          </p>
        </div>
        <form className="panel form" onSubmit={onSubmit}>
          {sent && <div className="banner">Message saved. Dispatch will follow up.</div>}
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            How can we help?
            <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
          </label>
          <button className="btn primary" type="submit">
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
