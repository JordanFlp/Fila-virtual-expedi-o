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
          <div key={b.id} style={{ border: "2px solid #022f40", padding: "12px", borderRadius: "8px", width: "180px", background: b.status === "desativada" ? "#ccc" : "#fff" }}>
            <h3>Bancada {b.id}</h3>
            <p>Status: {b.status}</p>
            <button onClick={() => toggleBancada(b.id)} style={{ marginBottom: "8px" }}>
              {b.status === "desativada" ? "Ativar" : "Desativar"}
            </button>

            {b.fila.length === 0 ? (
              <p>Nenhuma rota atribuída</p>
            ) : (
              <div>
                <h4>Rota atual:</h4>
                {b.fila.map((g, idx) => (
                  <div key={g.letter + g.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{
                      width: "80px",
                      height: "50px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: g.status === "pendente" ? "#d9534f" : g.status === "em_conferencia" ? "#f0ad4e" : g.status === "conferida" ? "#5cb85c" : "#0275d8",
                      color: "white",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      marginBottom: "4px",
                    }}>
                      {g.letter}-{g.num}
                    </div>

                    <select
                      value={g.status}
                      disabled={b.status === "desativada"}
                      onChange={(e) => atualizarStatus(b.id, idx, e.target.value)}
                      style={{ padding: "4px", width: "100%" }}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BancadasPage;
