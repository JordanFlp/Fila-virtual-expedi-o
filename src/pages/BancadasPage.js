import { useContext } from "react";
import { GaiolasContext } from "../context/GaiolasContext";

function BancadasPage() {
  const { bancadas, atualizarStatus, toggleBancada } = useContext(GaiolasContext);

  const statusOptions = ["pendente", "em_conferencia", "conferida", "buffer"];

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bancadas - Conferente</h1>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {bancadas.map((b) => (
          <div
            key={b.id}
            style={{
              border: "2px solid #022f40",
              padding: "12px",
              borderRadius: "8px",
              width: "220px",
              background: b.status === "desativada" ? "#ccc" : "#fff",
            }}
          >
            <h3>Bancada {b.id}</h3>
            <p>Status: {b.status}</p>
            <button onClick={() => toggleBancada(b.id)} style={{ marginBottom: "8px" }}>
              {b.status === "desativada" ? "Ativar" : "Desativar"}
            </button>

            {/* Rotas Atuais */}
            {b.fila?.length === 0 ? (
              <p>Nenhuma rota atribuída</p>
            ) : (
              <div>
                <h4>Rota atual:</h4>
                {b.fila.map((g, idx) => (
                  <div
                    key={g.letter + g.num}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "80px",
                        height: "50px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background:
                          g.status === "pendente"
                            ? "#d9534f"
                            : g.status === "em_conferencia"
                            ? "#f0ad4e"
                            : g.status === "conferida"
                            ? "#5cb85c"
                            : "#0275d8",
                        color: "white",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        marginBottom: "4px",
                      }}
                    >
                      {g.letter}-{g.num}
                    </div>

                    <select
                      value={g.status}
                      disabled={b.status === "desativada"}
                      onChange={(e) => atualizarStatus(b.id, idx, e.target.value)}
                      style={{ padding: "4px", width: "100%" }}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Histórico de rotas conferidas */}
            {b.historico?.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <h4>Histórico:</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {b.historico.map((g, idx) => (
                    <div
                      key={"hist-" + idx}
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "#5cb85c",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        fontSize: "15px",
                        marginRight: "3px",
                        fontWeight: "bold",
                      }}
                      title={`${g.letter}-${g.num}`}
                    >
                      {g.letter}-{g.num}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BancadasPage;
