import type { ReactNode } from "react";
import Footer from "./Footer";
import Nav from "./Nav";
import Ticker from "./Ticker";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="grain" />
      <Nav />
      <Ticker />
      <main>{children}</main>
      <Footer />
    </>
  );
}
