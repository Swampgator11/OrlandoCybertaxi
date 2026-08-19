import type { ReactNode } from "react";
import Footer from "./Footer";
import Nav from "./Nav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="site">
      <div className="lamp" aria-hidden="true" />
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
