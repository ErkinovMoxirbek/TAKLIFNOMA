import { Routes, Route, Navigate } from "react-router-dom";
import Taklifnoma from "./Taklifnoma/Taklifnoma";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Taklifnoma />} />
      </Routes>
  );
}