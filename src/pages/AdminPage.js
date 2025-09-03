import { useState, useContext } from "react";
import { GaiolasContext } from "../context/GaiolasContext";

function AdminPage() {
  const { gaiolas, setGaiolas, bancadas, setBancadas } = useContext(GaiolasContext);
  const [startLetter, setStartLetter] = useState("A");
  const [endLetter, setEndLetter] = useState("D");
  const [lastLimit, setLastLimit] = useState(36);
  const [numBancadas, setNumBancadas] = useState(16);
  const [rotasHora, setRotasHora] = useState(0);

  const generateGaiolas = () => {
    const result = [];
    const startCode = startLetter.charCodeAt(0);
    const endCode = endLetter.charCodeAt(0);

    for (let code = startCode; code <= endCode; code++) {
      const letter = String.fromCharCode(code);
      const maxNumber = code === endCode ? lastLimit : 36;
      for (let num = 1; num <= maxNumber; num++) {
        result.push({ letter, num, status: "pendente" });
      }
    }

    setGaiolas(result);
    setRotasHora(Math.ceil(result.length / (numBancadas * 3))); // 3h de operação
    generateBancadas(); // cria ou atualiza as bancadas
  };

  const generateBancadas = () => {
    const b = [];
    for (let i = 1; i <= numBancadas; i++) {
      b.push({ id: i, status: "livre", rotaAtual: null, fila: [] });
    }
    setBancadas(b);
  };

  const makeDuplasAlternadas = (arr) => {
    const linha1 = [];
    const linha2 = [];
    for (let i = 0; i < arr.length; i += 2) {
      if ((i / 2) % 2 === 0) linha1.push(arr.slice(i, i + 2));
      else linha2.push(arr.slice(i, i + 2));
    }
    return { linha1, linha2 };
  };

  const getRuas = () => {
    const letrasUnicas = [...new Set(gaiolas.map((g) => g.letter))];
    const ruasDireita = [];
    const ruasEsquerda = [];

    letrasUnicas.forEach((letra) => {
      const arr = gaiolas.filter((g) => g.letter === letra);
      const duplas = makeDuplasAlternadas(arr);
      if ((letra.charCodeAt(0) - "A".charCodeAt(0)) % 2 === 0) {
        ruasDireita.push({ letra, duplas });
      } else {
        ruasEsquerda.push({ letra, duplas });
      }
    });

    return {
      ruasDireita: ruasDireita.reverse(),
      ruasEsquerda: ruasEsquerda.reverse(),
    };
  };

  const { ruasDireita, ruasEsquerda } = getRuas();

  const renderLinhaDuplas = (linha) => (
    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
      {linha.map((dupla, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            gap: "4px",
            border: "1px solid #022f40",
            padding: "4px",
            borderRadius: "6px",
            background: "#49a0d3",
          }}
        >
          {dupla.map((g) => (
            <div
              key={g.letter + g.num}
              style={{
                width: "50px",
                height: "50px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background:
                  g.status === "pendente"
                    ? "red"
                    : g.status === "em_conferencia"
                    ? "yellow"
                    : g.status === "conferida"
                    ? "green"
                    : "blue",
                color: "white",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              {g.letter}-{g.num}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderRua = (rua) => (
    <div key={rua.letra} style={{ marginBottom: "16px" }}>
      <h4>
        Rua {rua.letra} - Total:{" "}
        {rua.duplas.linha1.length * 2 + rua.duplas.linha2.length * 2} gaiolas
      </h4>
      {renderLinhaDuplas(rua.duplas.linha1)}
      {renderLinhaDuplas(rua.duplas.linha2)}
    </div>
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin - Geração de Gaiolas e Bancadas</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Letra inicial:
          <input
            type="text"
            maxLength={1}
            value={startLetter}
            onChange={(e) => setStartLetter(e.target.value.toUpperCase())}
            style={{ marginLeft: "4px", marginRight: "12px" }}
          />
        </label>

        <label>
          Letra final:
          <input
            type="text"
            maxLength={1}
            value={endLetter}
            onChange={(e) => setEndLetter(e.target.value.toUpperCase())}
            style={{ marginLeft: "4px", marginRight: "12px" }}
          />
        </label>

        <label>
          Máximo da última letra:
          <input
            type="number"
            value={lastLimit}
            onChange={(e) => setLastLimit(Number(e.target.value))}
            style={{ marginLeft: "4px", marginRight: "12px" }}
          />
        </label>

        <label>
          Bancadas:
          <input
            type="number"
            value={numBancadas}
            onChange={(e) => setNumBancadas(Number(e.target.value))}
            style={{ marginLeft: "4px", marginRight: "12px" }}
          />
        </label>

        <button onClick={generateGaiolas} style={{ marginLeft: "4px" }}>
          Gerar Gaiolas e Bancadas
        </button>
      </div>

      <h3>Total de gaiolas geral: {gaiolas.length}</h3>
      <h3>Rotas por hora por bancada (3h de operação): {rotasHora || "-"}</h3>

      <div style={{ display: "flex", gap: "50px", alignItems: "flex-end" }}>
        <div>
          <h3>Esquerda</h3>
          {ruasEsquerda.map((rua) => renderRua(rua))}
        </div>

        <div>
          <h3>Direita</h3>
          {ruasDireita.map((rua) => renderRua(rua))}
        </div>
      </div>

          <div style={{ marginTop: "2rem" }}>
          <h3>Status das Bancadas</h3>
          {bancadas.map((b) => {
            const rotaAtual = b.fila.length > 0 ? b.fila[0] : null;

            return (
              <div key={b.id} style={{ marginBottom: "8px" }}>
                <strong>Bancada {b.id}</strong> - {b.status.replace("_", " ")}
                <div>
                  <strong>Rota atual:</strong>{" "}
                  {rotaAtual ? `${rotaAtual.letter}-${rotaAtual.num}` : "-"}
                </div>
              </div>
            );
          })}
        </div>


    </div>
    
  );
}

export default AdminPage;
