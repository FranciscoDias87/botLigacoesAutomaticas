const supabase = require("./supabaseClient");

async function testarConexao() {
  console.log("Testando conexão com Supabase...");

  const { data, error } = await supabase.from("contacts").select("id").limit(1);

  if (error) {
    console.error("Erro ao consultar o banco:", error.message);
    process.exitCode = 1;
    return;
  }

  console.log("Conexão com Supabase estabelecida!");
  console.log("Consulta à tabela contacts realizada.");
  console.log("Registros retornados:", data.length);
}

testarConexao().catch((error) => {
  console.error("Falha inesperada:", error.message);
  process.exitCode = 1;
});
