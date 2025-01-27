require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const Usuario = require("./models/Usuario");
const Emprestimo = require("./models/Emprestimos");
const Reserva = require("./models/Reservas");
const Livro = require("./models/Livros");
const app = express();
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

// Função para autenticar usuário
const autenticarUsuario = async (email, password) => {
  const usuario = await Usuario.findOne({ email });
  if (usuario) {
    if (usuario.role === "admin") {
      if (usuario.password === password) {
        return usuario;
      }
    } else if (await bcrypt.compare(password, usuario.password)) {
      return usuario;
    }
  }
  return null;
};
//login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await autenticarUsuario(email, password);

    if (usuario) {
      const token = jwt.sign(
        { id: usuario._id, role: usuario.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token });
    } else {
      res.status(401).json({ message: "Email ou senha inválidos" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erro interno do servidor", error: err.message });
  }
});

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ message: "Token de autenticação não fornecido" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }
    req.usuario = decoded;
    next();
  });
};

//permissão de admin
app.get("/role", verifyToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json({ role: usuario.role, name: usuario.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar usuário" });
  }
});

// cadastro
app.post("/usuarios", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUsuario = new Usuario({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: "usuario",
    });

    const savedUsuario = await newUsuario.save();
    res.status(201).json(savedUsuario);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send({ code: 11000, message: "Email já cadastrado" });
    } else {
      res.status(500).json({ message: "Erro ao cadastrar usuário" });
    }
  }
});

//historico de emprestimos usuario
app.get("/emprestimos/historico-do-usuario", verifyToken, async (req, res) => {
  try {
    const emprestimosUsuario = await Emprestimo.find({
      usuarioId: req.usuario.id,
    }).exec();

    const emprestimosComLivros = await Promise.all(
      emprestimosUsuario.map(async (emprestimo) => {
        const livro = await Livro.findOne({ livroId: emprestimo.livroId });
        return {
          ...emprestimo._doc,
          livro: livro
            ? { titulo: livro.titulo, capa: null }
            : { titulo: "Título desconhecido", capa: null },
        };
      })
    );

    res.json(emprestimosComLivros);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erro ao buscar histórico de empréstimos" });
  }
});

// buscar emprestimos pelo email
app.get("/emprestimos", verifyToken, async (req, res) => {
  const emailUsuario = req.query.email;

  if (!emailUsuario) {
    return res.status(400).json({ message: "E-mail do usuário não fornecido" });
  }

  try {
    console.log(`Buscando usuário com e-mail: ${emailUsuario}`);
    const usuario = await Usuario.findOne({ email: emailUsuario });

    if (!usuario) {
      console.log("Usuário não encontrado");
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    console.log(`Usuário encontrado: ${usuario._id}`);
    const emprestimosUsuario = await Emprestimo.find({
      usuarioId: usuario._id,
    }).exec();

    if (emprestimosUsuario.length === 0) {
      console.log("Nenhum empréstimo encontrado para o usuário");
      return res
        .status(404)
        .json({ message: "Nenhum empréstimo encontrado para este usuário" });
    }
    console.log(
      `Número de empréstimos encontrados: ${emprestimosUsuario.length}`
    );
    const emprestimosComLivros = await Promise.all(
      emprestimosUsuario.map(async (emprestimo) => {
        const livro = await Livro.findOne({ livroId: emprestimo.livroId });
        console.log(`Processando livro com ID: ${emprestimo.livroId}`);
        return {
          ...emprestimo._doc,
          livro: livro
            ? { titulo: livro.titulo }
            : { titulo: "Título desconhecido"},
        };
      })
    );

    res.json(emprestimosComLivros);
  } catch (error) {
    console.error("Erro ao buscar empréstimos:", error);
    res.status(500).json({ message: "Erro ao buscar empréstimos" });
  }
});

//consulta de livros (catalogo)
app.get("/livros", verifyToken, async (req, res) => {
  const { categoria, disponivel } = req.query;

  try {
    let query = {};

    if (categoria) {
      query.categoria = categoria;
    }

    if (disponivel !== undefined) {
      query.disponivel = disponivel === "true";
    }

    const livros = await Livro.find();
    res.json(livros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar livros" });
  }
});

// solicitar empresitmo
app.post("/emprestimo/:livroId", verifyToken, async (req, res) => {
  const livroId = req.params.livroId;

  try {
    const livro = await Livro.findOne({ livroId });

    if (!livro || !livro.disponivel) {
      return res.status(400).json({ message: "Livro não disponível" });
    }

    const hoje = new Date();
    const dataDevolucao = new Date();
    dataDevolucao.setDate(hoje.getDate() + 15);

    const emprestimo = new Emprestimo({
      usuarioId: req.usuario.id,
      livroId,
      status: "emprestado",
      dataEmprestimo: hoje.toISOString(),
      dataDevolucao: dataDevolucao.toISOString(),
    });

    await emprestimo.save();

    livro.disponivel = false;
    await livro.save();

    res.status(201).json(emprestimo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao solicitar empréstimo" });
  }
});

// extender empresimo
app.put("/emprestimos/extender/:id", verifyToken, async (req, res) => {
  const emprestimoId = req.params.id;

  try {
    const emprestimo = await Emprestimo.findOne({
      _id: emprestimoId,
      usuarioId: req.usuario.id,
    });

    if (!emprestimo) {
      return res
        .status(400)
        .json({ message: "Empréstimo não encontrado ou acesso negado" });
    }

    if (emprestimo.extendido) {
      return res
        .status(400)
        .json({ message: "Prazo já foi estendido anteriormente" });
    }

    const novaDataDevolucao = new Date(emprestimo.dataDevolucao);
    novaDataDevolucao.setDate(novaDataDevolucao.getDate() + 15);

    emprestimo.dataDevolucao = novaDataDevolucao.toISOString();
    emprestimo.extendido = true;
    await emprestimo.save();

    res.json({ message: "Prazo de devolução estendido", emprestimo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao estender prazo de devolução" });
  }
});

//registrar devolução
app.post("/emprestimos/return/:id", verifyToken, async (req, res) => {
  if (req.usuario.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acesso restrito para administradores" });
  }

  const emprestimoId = req.params.id;

  try {
    const emprestimo = await Emprestimo.findOne({ _id: emprestimoId });

    if (!emprestimo) {
      return res
        .status(400)
        .json({ message: "Empréstimo não encontrado ou acesso negado" });
    }

    emprestimo.status = "devolvido";
    await emprestimo.save();

    const livro = await Livro.findOne({ livroId: emprestimo.livroId });
    if (livro) {
      livro.disponivel = true;
      await livro.save();
    }

    res.json({ message: "Livro devolvido com sucesso", emprestimo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao registrar devolução" });
  }
});

//remover reserva
app.delete("/reservas/:id", verifyToken, async (req, res) => {
  const reservaId = req.params.id;

  try {
    const reserva = await Reserva.findOne({
      _id: reservaId,
      usuarioId: req.usuario.id,
    });

    if (!reserva) {
      return res
        .status(400)
        .json({ message: "Reserva não encontrada ou acesso negado" });
    }

    const livro = await Livro.findById(reserva.livroId);
    if (livro) {
      livro.disponivel = true;
      await livro.save();
    }
  
    await Reserva.findByIdAndDelete(reservaId);

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao remover reserva" });
  }
});

//adicionar livro
app.post("/livros", verifyToken, async (req, res) => {
  if (req.usuario.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acesso restrito para administradores" });
  }

  try {
    const novoLivro = new Livro({
      ...req.body,
      livroId: uuidv4(),
      disponivel: true,
    });
    await novoLivro.save();

    res.status(201).json(novoLivro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao adicionar livro" });
  }
});

// Adicionar capa
app.patch("/livros/:livroId", verifyToken, async (req, res) => {
  if (req.usuario.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acesso restrito para administradores" });
  }

  const livroId = req.params.livroId;
  const atualizacoes = req.body;

  try {
    const livroAtualizado = await Livro.findOneAndUpdate(
      { livroId },
      atualizacoes,
      { new: true }
    );

    if (!livroAtualizado) {
      return res.status(404).json({ message: "Livro não encontrado" });
    }

    res.json({
      message: "Livro atualizado com sucesso",
      livro: livroAtualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar livro" });
  }
});

//deletar livro
app.delete("/livros/:livroId", verifyToken, async (req, res) => {
  if (req.usuario.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acesso restrito para administradores" });
  }

  const livroId = req.params.livroId;

  try {
    await Livro.findOneAndDelete({ livroId });
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao deletar livro" });
  }
});

//adicionar bibliotecário (apenas admin consegue)
app.post("/usuarios/admin", verifyToken, async (req, res) => {
  if (req.usuario.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acesso restrito para administradores" });
  }

  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Usuario({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();

    res.status(201).json(newAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao adicionar bibliotecário" });
  }
});

//registrar emprestimo
app.put("/emprestimos/status/:id", verifyToken, async (req, res) => {
  if (req.usuario.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acesso restrito para administradores" });
  }

  const emprestimoId = req.params.id;
  const { status } = req.body;

  try {
    const emprestimo = await Emprestimo.findById(emprestimoId);

    if (!emprestimo) {
      return res.status(404).json({ message: "Empréstimo não encontrado" });
    }

    emprestimo.status = status || emprestimo.status;
    await emprestimo.save();

    res.json(emprestimo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar status do empréstimo" });
  }
});

//detalhes de um livro
app.get("/livros/:livroId", verifyToken, async (req, res) => {
  const livroId = req.params.livroId;

  try {
    const livro = await Livro.findOne({ livroId });

    if (!livro) {
      return res.status(404).json({ message: "Livro não encontrado" });
    }

    res.json(livro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar detalhes do livro" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
