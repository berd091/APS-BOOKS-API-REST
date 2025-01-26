import React, { useState } from "react";
import "./navBar.css";

import { useNavigate, Navigate } from "react-router-dom";
import { Link } from "react-router-dom";

function NavBar() {
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();

  const abrirMenu = () => {
    setAberto(!aberto);
  };

  function handleFotoClick() {
    navigate(`/usuario`);
  }

  return (
    <div className="navBar">
      <div className="navbar-container">
        <div className="navBarHeader">
          <button className="menuHamButton" onClick={abrirMenu}>
            <p>
              MENU HAMBURGUER
              {/* abre o menu  */}
            </p>
          </button>
          <p className="imagelogo">{/* LOGO DA BIBLIOTECA SE QUISER */}</p>
          <p className="imageuser" onClick={handleFotoClick}>
            PÁGINA DO USUARIO
            {/* HISTORICO */}
          </p>
        </div>
      </div>
      <div className="">
        {aberto ? (
          <div className="menu menuAberto">
            <div className="botoesDiv">
              <button className="botao1">
                <Link to="/admin" style={{ textDecoration: "none" }}>
                  Adicionar Livros
                </Link>
              </button>
              <button className="botao2">
                <Link to="/admin2" style={{ textDecoration: "none" }}>
                  Remover Livros
                </Link>
              </button>
              <button className="botao3">
                <Link to="/catalogo" style={{ textDecoration: "none" }}>
                  Catálogo
                </Link>
              </button>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

export default NavBar;
