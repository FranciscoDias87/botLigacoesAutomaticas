require("dotenv").config();

const express = require("express");

const app = express();

const {
  cadastrarContato,
  listarContatos, 
  bloquearContato
 } = require("./consentService");

const PORT = process.env.PORT || 3000;

app.use(express.json());



app.get("/", (req, res) => {
  res.json({
    sistema: "Bot de Ligações Automáticas",
    status: "online",
    modo: "teste",
    ligacoesReaisHabilitadas: false
  });
});

app.get("/health", (req, res) => {
  res.status(200).send('Saude do servidor: OK');
});

app.post("/contatos", (req, res)=>{
  try{
    const contato = cadastrarContato(req.body);
    res.status(201).json(contato);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/contatos", (req, res)=>{
  res.status(200).json(listarContatos());
});

app.post("/contatos/bloquear", (req, res)=>{
  try{
    const {telefone} = req.body;
    if (!telefone){
      return res.status(400).json({
        erro: "Telefone é obrigatório para bloquear um contato."
      });
    }
    res.json(bloquearContato(telefone));
  }catch (error){    
    res.status(400).json({ erro: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
} );
