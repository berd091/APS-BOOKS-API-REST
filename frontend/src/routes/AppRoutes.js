import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Cadastro from "../pages/Auth/Cadastro";
import Login from "../pages/Auth/Login";
import Catalogo from "../pages/Books/Catalogo";
import DetalhesLivro from "../pages/Books/DetalhesLivro";
import Usuario from "../pages/user/Usuario";
import EmprestimoLivro from "../pages/Books/EmprestimoLivro";
import AddLivro from "../pages/Books/AddLivro";
import DeleteLivro from "../pages/Books/DeleteLivro";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/usuario" element={<Usuario />} />{" "}
        {/* botar pra entrar com id */}
        <Route path="/livros/:id" element={<DetalhesLivro />} />
        <Route path="/emprestimo/:id" element={<EmprestimoLivro />} />
        <Route path="/admin" element={<AddLivro />} />{" "}
        <Route path="/admin2" element={<DeleteLivro />} />
        {/* botar pra entrar com id de admin */}
        {/* so admin pode entrar na pagina de add e delete livro */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
