// só o bibliotecario pode ver essa pagina
// só o bibliotecario pode ver essa pagina
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const DeleteLivro = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Remover Livro do Acervo</h2>

      <form>
        <div>
          <label>Nome do Livro:</label>
          <input type="text" value={"livro"} />
        </div>
        <div>
          <label>Autor:</label>
          <input type="text" value={"autor"} />
        </div>

        <div>
          <label>Categoria:</label>
          <input type="text" value={"categoria"} />
        </div>
        <div>
          <label>Ano:</label>
          <input type="text" value={"Ano"} />
        </div>
        <div>
          <label>Editora:</label>
          <input type="text" value={"editora"} />
        </div>

        <div>
          <button type="submit">Remover Livro</button>
        </div>
      </form>
    </div>
  );
};

export default DeleteLivro;
