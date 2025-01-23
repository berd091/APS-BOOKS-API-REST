import { React, useState, useEffect } from "react";

import { useNavigate, Navigate } from "react-router-dom";

const Usuario = () => {
  return (
    <div className="pagina">
      <h1 className="titulo">Histórico de Empréstimos</h1>
      <div className="emprestimos">
        <h1>lista de livros</h1>
        <div className="emprestimo">
          <h1>nome livro</h1>
          <span>data do empréstimo </span>
          <span>status do emprestimo </span>
          <span>data de devolucao (se aplicavel)</span>
        </div>
        <div className="emprestimo">
          <h1>nome livro</h1>
          <span>data do empréstimo</span>
          <span>status do emprestimo</span>
        </div>
      </div>
    </div>
  );
};
export default Usuario;
