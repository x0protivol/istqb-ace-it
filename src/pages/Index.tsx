import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Quiz from "./Quiz";
import Results from "./Results";

const Index = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
};

export default Index;