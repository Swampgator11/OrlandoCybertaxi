import type { ReactNode } from "react";
import Footer from "./Footer";
import Nav from "./Nav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="grain" />
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
