import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy load components for better performance
const Dashboard = lazy(() => import("./Dashboard"));
const Quiz = lazy(() => import("./Quiz"));
const Results = lazy(() => import("./Results"));

const Index = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Suspense>
  );
};

export default Index;