import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Home } from "@/pages/Home";
import { About } from "./pages/About";
import { Projects } from "./pages/Projects";
import { Web } from "./pages/Web";

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col items-center bg-bg text-text">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/web" element={<Web />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
      <footer className="fixed bottom-0 left-0 w-full text-center py-1 text-sm text-muted bg-surface">
        &copy; {new Date().getFullYear()} Geonotes. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
