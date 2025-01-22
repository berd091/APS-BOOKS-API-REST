import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Cadastro from "../pages/Auth/Cadastro";
import Login from "../pages/Auth/Login";
import Catalogo from "../pages/Books/Catalogo";
import DetalhesLivro from "../pages/Books/DetalhesLivro";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/livros/:id" element={<DetalhesLivro />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
