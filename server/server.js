const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const server = jsonServer.create();
const router = jsonServer.router('./db.json');
const middlewares = jsonServer.defaults();

const db = require('./db.json');

server.use(middlewares);
server.use(jsonServer.bodyParser);


const autenticarUsuario = (email, password) => {
  const usuario = router.db.get('usuarios').find({ email }).value();
  if (usuario) {
    if (usuario.role === 'admin') {
      if (usuario.password === password) {
        return usuario;
      }
    } 
    else if (bcrypt.compareSync(password, usuario.password)) {
      return usuario;
    }
  }
  
  return null;
};

// login
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const usuario = autenticarUsuario(email, password);

  if (usuario) {
    const token = jwt.sign({ id: usuario.id, role: usuario.role }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Email ou senha inválidos' });
  }
});


const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token de autenticação não fornecido' });
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.usuario = decoded;
    next();
  });
};


//cadastro
server.post('/usuarios', (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newusuario = { id: Date.now(), name, email, password: hashedPassword, role: 'usuario' };

  router.db.get('usuarios').push(newusuario).write();
  res.status(201).json(newusuario);
});

//historico de emprestimos usuario 
server.get('/emprestimos/historico-do-usuario', verifyToken, (req, res) => {
  const emprestimosUsuario = router.db.get('emprestimos').filter({ usuarioId: req.usuario.id }).value();
  res.json(emprestimosUsuario);
});

//consulta de livros (catalogo)
server.get('/livros', verifyToken, (req, res) => {
  const { categoria, disponivel } = req.query;
  
  let livros = router.db.get('livros').value();

  if (categoria) {
    livros = livros.filter(b => b.categoria === categoria);
  }
  
  if (disponivel !== undefined) {
    livros = livros.filter(b => b.disponivel === (disponivel === 'true'));
  }

  res.json(livros);
});


// solicitar empresitmo
server.post('/emprestimos', verifyToken, (req, res) => {
  const { livroId } = req.body;
  const livro = router.db.get('livros').find({ id: livroId }).value();

  if (!livro || !livro.disponivel) {
    return res.status(400).json({ message: 'Livro não disponível' });
  }

  const hoje = new Date();
  const dataDevolucao = new Date();
  dataDevolucao.setDate(hoje.getDate() + 15);

  const emprestimo = {
    id: Date.now(),
    usuarioId: req.usuario.id,
    livroId,
    status: 'emprestado',
    dataEmprestimo: hoje.toISOString(),
    dataDevolucao: dataDevolucao.toISOString(),
  };

  router.db.get('emprestimos').push(emprestimo).write();
  router.db.get('livros').find({ id: livroId }).assign({ disponivel: false }).write();

  res.status(201).json(emprestimo);
});

// extender empresimo
server.put('/emprestimos/extender/:id', verifyToken, (req, res) => {
  const emprestimoId = parseInt(req.params.id);
  const emprestimo = router.db.get('emprestimos').find({ id: emprestimoId, usuarioId: req.usuario.id }).value();

  if (!emprestimo) {
    return res.status(400).json({ message: 'Empréstimo não encontrado ou acesso negado' });
  }

  const novaDataDevolucao = new Date(emprestimo.dataDevolucao);
  novaDataDevolucao.setDate(novaDataDevolucao.getDate() + 15);

  router.db.get('emprestimos').find({ id: emprestimoId }).assign({ dataDevolucao: novaDataDevolucao.toISOString() }).write();

  res.json({ message: 'Prazo de devolução estendido', emprestimo: { ...emprestimo, dataDevolucao: novaDataDevolucao.toISOString() } });
});

//registrar devolução
server.post('/emprestimos/return/:id', verifyToken, (req, res) => {
  const emprestimoId = parseInt(req.params.id);
  const emprestimo = router.db.get('emprestimos').find({ id: emprestimoId, usuarioId: req.usuario.id }).value();

  if (!emprestimo) {
    return res.status(400).json({ message: 'Empréstimo não encontrado ou acesso negado' });
  }

  router.db.get('emprestimos').find({ id: emprestimoId }).assign({ status: 'devolvido' }).write();
  router.db.get('livros').find({ id: emprestimo.livroId }).assign({ disponivel: true }).write();

  res.json({ message: 'Livro devolvido com sucesso', emprestimo });
});

//remover reserva
server.delete('/reservas/:id', verifyToken, (req, res) => {
  const reservaId = parseInt(req.params.id);
  const reserva = router.db.get('reservas').find({ id: reservaId, usuarioId: req.usuario.id }).value();

  if (!reserva) {
    return res.status(400).json({ message: 'Reserva não encontrada ou acesso negado' });
  }

  router.db.get('livros').find({ id: reserva.livroId }).assign({ disponivel: true }).write();
  router.db.get('reservas').remove({ id: reservaId }).write();

  res.status(204).end();
});

//adicionar livro
server.post('/livros', verifyToken, (req, res) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito para administradores' });
  }

  const livro = { ...req.body, id: Date.now(), disponivel: true };
  router.db.get('livros').push(livro).write();

  res.status(201).json(livro);
});


//deletar livro
server.delete('/livros/:id', verifyToken, (req, res) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito para administradores' });
  }

  const livroId = parseInt(req.params.id);
  router.db.get('livros').remove({ id: livroId }).write();

  res.status(204).end();
});

//adicionar bibliotecário (apenas admin consegue)
server.post('/usuarios/admin', verifyToken, (req, res) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito para administradores' });
  }

  const { name, email, password } = req.body;
  const newAdmin = { id: Date.now(), name, email, password, role: 'admin' };

  router.db.get('usuarios').push(newAdmin).write();
  res.status(201).json(newAdmin);
});

//registrar emprestimo
server.put('/emprestimos/status/:id', verifyToken, (req, res) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito para administradores' });
  }

  const emprestimo = db.emprestimos.find(l => l.id === parseInt(req.params.id));
  if (!emprestimo) {
    return res.status(404).json({ message: 'Empréstimo não encontrado' });
  }

  emprestimo.status = req.body.status || emprestimo.status;
  res.json(emprestimo);
});

//detalhes de um livro 
server.get('/livros/:id', verifyToken, (req, res) => {
  const livroId = parseInt(req.params.id);
  const livro = router.db.get('livros').find({ id: livroId }).value();

  if (!livro) {
    return res.status(404).json({ message: 'Livro não encontrado' });
  }

  res.json(livro);
});



server.use(router);
server.listen(3001, () => {
  console.log('Servidor rodando na porta 3000');
});