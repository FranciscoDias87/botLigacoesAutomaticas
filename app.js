require("dotenv").config();

const express = require("express");

const {
  cadastrarContato,
  listarContatos,
  bloquearContato,
} = require("./consentService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//verificação básica do sevidor
app.get("/", (req, res) => {
  res.json({
    sistema: "Bot de Ligações Automáticas",
    status: "online",
    modo: "teste",
    ligacoesReaisHabilitadas: false,
  });
});

//"saude" do servidor
app.get("/health", (req, res) => {
  res.status(200).send("Saude do servidor: OK");
});

//cadastar contatos autorizados
app.post("/contatos", async (req, res) => {
  try {
    const contato = await cadastrarContato(req.body);
    return res
      .status(201)
      .json({ mensagem: "Contato Cadastrado com Sucesso.", contato });
  } catch (error) {
    console.error("Erro detalhado ao cadastrar contato: ", error);
    const mensagem = error.message;

    const status =
      mensagem.includes("obrigatório") ||
      mensagem.includes("consentimento") ||
      mensagem.includes("inválido") ||
      mensagem.includes("bloqueio") ||
      mensagem.includes("já está cadastrado")
        ? 400
        : 500;

    return res.status(status).json({ erro: mensagem });
  }
});

//listar contatos
app.get("/contatos", async (req, res) => {
  try {
    const contatos = await listarContatos();

    return res.json({
      total: contatos.length,
      contatos,
    });
  } catch (error) {
    console.error("Erro ao listar contatos: ", error.message);
    return res.status(500).json({
      erro: "Não foi possível consultar os contatos.",
    });
  }
});

//bloquear contatos
app.post("/contatos/bloquear", async (req, res) => {
  try {
    const resultado = await bloquearContato(req.body.telefone);

    return res.json({
      mensagem: "Numero Bloqueado com Sucesso.",
      ...resultado,
    });
  } catch (error) {
    const mensagem = error.message;

    const status =
      mensagem.includes("obrigatório") ||
      mensagem.includes("inválido") ||
      mensagem.includes("deve ser")
        ? 400
        : 500;
    console.error("Erro ao bloquear contato: ", error.message);
    return res.status(status).json({ erro: mensagem });
  }
});

//tratamento json inválido
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return res
      .status(400)
      .json({ erro: "JSON inválido. Confira o corpo da requisição." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}...`);
  console.log("Modo de Teste: Ligações Reais Desativadas...");
});
