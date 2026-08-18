import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Book from "./pages/Book";
import Confirmation from "./pages/Confirmation";
import Contact from "./pages/Contact";
import Coverage from "./pages/Coverage";
import Fleet from "./pages/Fleet";
import Home from "./pages/Home";
import Inspect from "./pages/Inspect";
import Rides from "./pages/Rides";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/inspect/:type" element={<Inspect />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/coverage" element={<Coverage />} />
        <Route path="/rides" element={<Rides />} />
        <Route path="/rides/:id" element={<Confirmation />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
