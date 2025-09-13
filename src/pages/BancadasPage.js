import { useContext, useState } from "react";
import { GaiolasContext } from "../context/GaiolasContext";

function BancadasPage() {
  const { gaiolas, bancadas, atualizarStatus, toggleBancada, solicitarRota } =
    useContext(GaiolasContext);
  const [modalAberto, setModalAberto] = useState(false);
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [bancadaSelecionada, setBancadaSelecionada] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);

  // Abre modal de finalização de conferência
  const abrirModal = (b, g) => {
    setBancadaSelecionada(b.id);
    setRotaSelecionada(g);
    setModalAberto(true);
  };

  const marcarSubStatus = (subStatus) => {
    if (!rotaSelecionada || !bancadaSelecionada) return;
    atualizarStatus(bancadaSelecionada, rotaSelecionada.idx, "conferida", subStatus);
    setModalAberto(false);
    setRotaSelecionada(null);
    setBancadaSelecionada(null);
  };

  // === ABRIR SELEÇÃO MANUAL ===
  const abrirManual = (b) => {
    setBancadaSelecionada(b.id);
    setManualOpen(true);
  };

  // === SELECIONAR ROTA MANUALMENTE ===
  const selecionarManual = (rota) => {
    if (!bancadaSelecionada) return;

    const bancada = bancadas.find((b) => b.id === bancadaSelecionada);
    if (!bancada || bancada.status !== "livre") {
      alert("Bancada indisponível.");
      return;
    }

    // Verifica vizinhas ocupadas
    const anterior = gaiolas.find((g) => g.letter === rota.letter && g.num === rota.num - 1);
    const proximo = gaiolas.find((g) => g.letter === rota.letter && g.num === rota.num + 1);

    if ((rota.num % 2 === 0 && anterior?.status === "em_conferencia") ||
        (rota.num % 2 !== 0 && proximo?.status === "em_conferencia")) {
      alert("Não é possível selecionar esta rota agora (vizinha ocupada).");
      return;
    }

    // Solicita a rota como no RotasPage, mas atribuindo diretamente à bancada
    solicitarRota(rota, bancadaSelecionada);

    setManualOpen(false);
    setBancadaSelecionada(null);
  };

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

            {/* Botão de seleção manual */}
            {b.status === "livre" && (
              <button onClick={() => abrirManual(b)} style={{ marginBottom: "8px" }}>
                Selecionar Rota Manual
              </button>
            )}

            {/* Rotas Atuais */}
            {b.fila?.length === 0 ? (
              <p>Nenhuma rota atribuída</p>
            ) : (
              <div>
                <h4>Rota atual:</h4>
                {b.fila.map((rotaRef, idx) => {
                  if (!rotaRef) return null;
                  const gAtual = gaiolas.find(
                    (g) => g.letter === rotaRef.letter && g.num === rotaRef.num
                  );
                  if (!gAtual) return null;

                  return (
                    <div
                      key={gAtual.letter + gAtual.num}
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
                            gAtual.status === "pendente"
                              ? "#d9534f"
                              : gAtual.status === "em_fila"
                              ? "#0275d8"
                              : gAtual.status === "em_conferencia"
                              ? "#f0ad4e"
                              : gAtual.status === "conferida" && gAtual.subStatus === "buffer"
                              ? "#0275d8"
                              : gAtual.status === "conferida" && gAtual.subStatus === "expedida"
                              ? "#5cb85c"
                              : "#ccc",
                          color: "white",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          marginBottom: "4px",
                        }}
                      >
                        {gAtual.letter}-{gAtual.num}
                      </div>

                      {gAtual.status !== "conferida" || gAtual.subStatus === "buffer" ? (
                        <button
                          onClick={() => abrirModal(b, { ...gAtual, idx })}
                          style={{ padding: "4px", width: "100%" }}
                        >
                          Finalizar Conferência
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Histórico de rotas conferidas */}
            {b.historico?.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <h4>Histórico:</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {b.historico.map((h, idx) => (
                    <div
                      key={"hist-" + idx}
                      style={{
                        width: "40px",
                        height: "40px",
                        background:
                          h.subStatus === "buffer"
                            ? "#0275d8"
                            : h.subStatus === "expedida"
                            ? "#5cb85c"
                            : "#5cb85c",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        fontSize: "15px",
                        marginRight: "3px",
                        fontWeight: "bold",
                      }}
                      title={`${h.letter}-${h.num}`}
                    >
                      {h.letter}-{h.num}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de finalização de conferência */}
      {modalAberto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <h3>Marcar rota {rotaSelecionada?.letter}-{rotaSelecionada?.num}</h3>
            <button onClick={() => marcarSubStatus("buffer")}>Buffer</button>
            <button onClick={() => marcarSubStatus("expedida")}>Expedida</button>
            <button onClick={() => setModalAberto(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal de seleção manual */}
      {manualOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, 50px)",
              gap: "8px",
              justifyContent: "center",
              maxWidth: "600px",
            }}
          >
            <h3 style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              Selecionar Rota Manual
            </h3>

            {gaiolas.map((g) => {
              const anterior = gaiolas.find(x => x.letter === g.letter && x.num === g.num - 1);
              const proximo = gaiolas.find(x => x.letter === g.letter && x.num === g.num + 1);

              const disponivel =
                g.status === "pendente" &&
                !((g.num % 2 === 0 && anterior?.status === "em_conferencia") ||
                  (g.num % 2 !== 0 && proximo?.status === "em_conferencia"));

              return (
                <div
                  key={g.letter + g.num}
                  style={{
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: disponivel ? "#d9534f" : "#ccc",
                    color: "white",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    cursor: disponivel ? "pointer" : "not-allowed",
                  }}
                  onClick={() => disponivel && selecionarManual(g)}
                  title={disponivel ? `Selecionar rota ${g.letter}-${g.num}` : "Indisponível"}
                >
                  {g.letter}-{g.num}
                </div>
              );
            })}

            <button
              onClick={() => setManualOpen(false)}
              style={{ gridColumn: "1 / -1", marginTop: "12px", padding: "6px" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BancadasPage;
