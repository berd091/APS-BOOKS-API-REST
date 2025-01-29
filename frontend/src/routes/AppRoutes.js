import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Cadastro from "../pages/Auth/Cadastro";
import Login from "../pages/Auth/Login";
import Catalogo from "../pages/Books/Catalogo";
import DetalhesLivro from "../pages/Books/DetalhesLivro";
import Usuario from "../pages/user/Usuario";
import EmprestimoLivro from "../pages/Books/EmprestimoLivro";
import AddLivro from "../pages/admin/AddLivro";
import DeleteLivro from "../pages/admin/DeleteLivro";
import RegistrarDevolucao from "../pages/admin/RegistrarDevolucao";
import RegistroBibliotecario from "../pages/admin/RegistroBibliotecario";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/devolucao" element={<RegistrarDevolucao />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/usuario" element={<Usuario />} />{" "}
        <Route path="/livros/:id" element={<DetalhesLivro />} />
        <Route path="/emprestimo/:id" element={<EmprestimoLivro />} />
        <Route path="/admin" element={<AddLivro />} />{" "}
        <Route path="/admin2" element={<DeleteLivro />} />
        <Route path="/registro-bibliotecario" element={<RegistroBibliotecario />} />
        <Route path="*" element={<Catalogo />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
