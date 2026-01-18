import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Home } from "@/pages/Home";
import { About } from "./pages/About";
import { Projects } from "./pages/Projects";
import { Web } from "./pages/Web";

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col bg-bg text-text px-20 pt-16 ">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/web" element={<Web />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
    </div>
  );
}

export default App;
