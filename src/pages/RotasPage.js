import { useContext, useState, useEffect } from "react";
import { GaiolasContext } from "../context/GaiolasContext";

function RotasPage() {
  const { gaiolas, bancadas, solicitarRota } = useContext(GaiolasContext);

  const [letter, setLetter] = useState("");
  const [num, setNum] = useState(1);
  const [mensagem, setMensagem] = useState("");
  const [filaAtual, setFilaAtual] = useState([]);

  // Atualiza fila global
  useEffect(() => {
    const fila = gaiolas.filter((g) => g.status === "em_fila");
    setFilaAtual(fila);
  }, [gaiolas, bancadas]);

  const mostrarMensagem = (texto) => {
    setMensagem(texto);
    setTimeout(() => setMensagem(""), 3000);
  };

  const handleSolicitar = () => {
    const rota = gaiolas.find((g) => g.letter === letter && g.num === num);

    if (!rota) {
      mostrarMensagem("Rota não encontrada");
      return;
    }

        if (["em_conferencia", "em_fila", "conferida"].includes(rota.status)) {
      // Se estiver em conferida, só permitir se estiver em buffer
      if (rota.status === "conferida" && rota.subStatus === "buffer") {
        // Permitido solicitar
      } else {
        mostrarMensagem(
          rota.status === "em_fila"
            ? `Rota ${letter}-${num} já está na fila`
            : `Rota ${letter}-${num} já está em conferência ou expedida`
        );
        return;
      }
    }


    let vizinhaOcupada = false;
    if (num % 2 === 0) {
      const anterior = gaiolas.find((g) => g.letter === letter && g.num === num - 1);
      if (anterior && anterior.status === "em_conferencia") vizinhaOcupada = true;
    } else {
      const proximo = gaiolas.find((g) => g.letter === letter && g.num === num + 1);
      if (proximo && proximo.status === "em_conferencia") vizinhaOcupada = true;
    }

    const bancadaLivre = bancadas.find((b) => b.status === "livre");

    if (vizinhaOcupada) {
      solicitarRota(rota);
      mostrarMensagem(`Rota ${letter}-${num} adicionada à fila (vizinha ocupada)`);
      return;
    }

    if (bancadaLivre) {
      solicitarRota(rota, bancadaLivre.id);
      mostrarMensagem(`Rota ${letter}-${num} atribuída à bancada ${bancadaLivre.id}`);
    } else {
      solicitarRota(rota);
      mostrarMensagem(`Todas as bancadas ocupadas. Rota ${letter}-${num} adicionada à fila`);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Rotas - Motorista</h1>
      <div style={{ marginBottom: "16px" }}>
        <label>
          Letra:
          <input
            type="text"
            maxLength={1}
            value={letter}
            onChange={(e) => setLetter(e.target.value.toUpperCase())}
            style={{ marginRight: "12px" }}
          />
        </label>
        <label>
          Número:
          <input
            type="number"
            value={num}
            onChange={(e) => setNum(Number(e.target.value))}
            style={{ marginRight: "12px" }}
          />
        </label>
        <button onClick={handleSolicitar}>Solicitar Rota</button>
      </div>

      {mensagem && (
        <div
          style={{
            marginBottom: "24px",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "#f0f0f0",
          }}
        >
          {mensagem}
        </div>
      )}

      <h2>Bancadas (visualização)</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        {bancadas.map((b) => (
          <div
            key={b.id}
            style={{
              border: "1px solid #022f40",
              padding: "12px",
              borderRadius: "6px",
              width: "160px",
              background:
                b.status === "livre"
                  ? "#5cb85c"
                  : b.status === "em_conferencia"
                  ? "#f0ad4e"
                  : "#d9534f",
              color: "white",
            }}
          >
            <strong>Bancada {b.id}</strong>
            <div>
              Status:{" "}
              {b.status === "em_conferencia" && b.fila.length > 0
                ? `Em conferência (${(() => {
                    const g = gaiolas.find(
                      (x) => x.letter === b.fila[0].letter && x.num === b.fila[0].num
                    );
                    return g ? `${g.letter}-${g.num}` : "";
                  })()})`
                : b.status}
            </div>

          </div>
        ))}
      </div>

      <h2>Fila Global</h2>
      <div
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          minHeight: "50px",
        }}
      >
        {filaAtual.length > 0 ? filaAtual.map((g) => `${g.letter}-${g.num}`).join(", ") : "Fila vazia"}
      </div>
    </div>
  );
}

export default RotasPage;
