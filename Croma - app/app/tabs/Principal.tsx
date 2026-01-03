// Principal.tsx
import { useRouter } from "expo-router";
import {
  DotsThreeOutlineVertical,
  MinusCircle,
  PlusCircle,
} from "phosphor-react-native";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Cores } from "@/constants/Cores";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://10.180.13.20:3000"; //Trocar o Ip para o Ipv4 da rede em que o Pc está

export default function Principal() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<any>(null);
  const [totaisConsumidos, setTotaisConsumidos] = useState<any>({
    calorias: 0,
    proteinas: 0,
    carboidratos: 0,
    gorduras: 0,
    
    agua: 0,
  });
  const [consumosList, setConsumosList] = useState<any[]>([]);
  const [loadingTotais, setLoadingTotais] = useState(false);

  const [aguaConsumida, setAguaConsumida] = useState(0);
  const [loadingAgua, setLoadingAgua] = useState(false);

  function handlePDetalhes() {
    router.navigate("/stacks/PDetalhes");
  }

  function AbrirSelecao() {
    router.navigate("/stacks/SelecAlimentos");
  }

  
  useEffect(() => {
    async function buscarTudo() {
      const email = await AsyncStorage.getItem("usuarioEmail");
      if (!email) return;

      
      fetch(`${API_BASE}/usuario/${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => setUsuario(data))
        .catch((err) => console.log("Erro ao buscar usuário:", err));

      
      setLoadingTotais(true);
      fetch(`${API_BASE}/consumo/dia?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          setTotaisConsumidos({
            calorias: data.calorias ?? 0,
            proteinas: data.proteinas ?? 0,
            carboidratos: data.carboidratos ?? 0,
            gorduras: data.gorduras ?? 0,
            agua: 0 
          });
        })
        .catch((err) => {
          console.log("Erro ao buscar totais:", err);
        })
        .finally(() => setLoadingTotais(false));

      
      try {
        const resp = await fetch(`${API_BASE}/consumo/list?email=${encodeURIComponent(email)}`);
        if (resp.ok) {
          const arr = await resp.json();
          setConsumosList(arr || []);
        } else {
          setConsumosList([]);
        }
      } catch (e) {
        setConsumosList([]);
      }

      
      try {
        const resp = await fetch(`${API_BASE}/agua/dia?email=${encodeURIComponent(email)}`);
        if (resp.ok) {
          const json = await resp.json();
          const agua = json.agua ?? 0;
          setAguaConsumida(agua);
          setTotaisConsumidos(prev => ({ ...prev, agua }));
        }
      } catch (e) {
        console.log("Erro ao buscar água:", e);
      }
    }

    buscarTudo();
  }, []);

  async function adicionarAgua(qtd: number) {
    const email = await AsyncStorage.getItem("usuarioEmail");
    if (!email) return;

    setLoadingAgua(true);

    try {
      const resp = await fetch(`${API_BASE}/agua/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          quantidade: qtd 
        }),
      });

      if (!resp.ok) {
        console.log("Erro ao adicionar água, status:", resp.status);
      }

      const resp2 = await fetch(`${API_BASE}/agua/dia?email=${encodeURIComponent(email)}`);
      if (resp2.ok) {
        const json = await resp2.json();
        const aguaTotal = json.agua ?? 0;
        setAguaConsumida(aguaTotal);
        setTotaisConsumidos(prev => ({ ...prev, agua: aguaTotal }));
      } else {
        setAguaConsumida(prev => Math.max(0, prev + qtd));
        setTotaisConsumidos(prev => ({ ...prev, agua: Math.max(0, (prev.agua || 0) + qtd) }));
      }
    } catch (err) {
      console.log("Erro ao registrar água:", err);
    } finally {
      setLoadingAgua(false);
    }
  }

  function handleAddAgua() {
    adicionarAgua(250);
  }

  function botaoAgua() {
    adicionarAgua(100);
  }

  function handleRemoveAgua() {
    adicionarAgua(-250); 
  }

  function restante(metaVal: number | undefined, consumidoVal: number | undefined) {
    const meta = metaVal ?? 0;
    const cons = consumidoVal ?? 0;
    const r = Math.max(0, Math.round(meta - cons));
    return r;
  }

  function consumosPorRefeicao(ref: "Café" | "Almoço" | "Jantar") {
    return consumosList.filter((c) => (c.alimento || "").startsWith(ref + " -"));
  }

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLeftText}>Croma</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerRightText}>{usuario ? usuario.nome : "Carregando..."}</Text>
        </View>
      </View>

      <ScrollView>
        <Text style={styles.Croma}>Bem Vindo ao Croma!</Text>
        <View style={styles.inputContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleStyle}>Avanço Diário</Text>
          </View>

          <View style={styles.progressoContainer}>
            <View style={styles.barrasContainer}>
              {/* CARBOIDRATOS */}
              <Text style={styles.textProgresso}>
                Carboidratos: {Math.round(totaisConsumidos.carboidratos)}g / {Math.round(usuario?.carboidratos ?? 0)}g
              </Text>
              <View style={styles.barraFundo}>
                <View
                  style={[
                    styles.barraPreenchida,
                    {
                      width: `${Math.min(
                        (totaisConsumidos.carboidratos / (usuario?.carboidratos || 1)) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>

              {/* PROTEÍNAS */}
              <Text style={styles.textProgresso}>
                Proteínas: {Math.round(totaisConsumidos.proteinas)}g / {Math.round(usuario?.proteinas ?? 0)}g
              </Text>
              <View style={styles.barraFundo}>
                <View
                  style={[
                    styles.barraPreenchida,
                    {
                      width: `${Math.min(
                        (totaisConsumidos.proteinas / (usuario?.proteinas || 1)) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>

              {/* GORDURAS */}
              <Text style={styles.textProgresso}>
                Gorduras: {Math.round(totaisConsumidos.gorduras)}g / {Math.round(usuario?.gorduras ?? 0)}g
              </Text>
              <View style={styles.barraFundo}>
                <View
                  style={[
                    styles.barraPreenchida,
                    {
                      width: `${Math.min(
                        (totaisConsumidos.gorduras / (usuario?.gorduras || 1)) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>

              {/* ÁGUA */}
              <Text style={styles.textProgresso}>
                Água: {Math.round(totaisConsumidos.agua)}ml / {(usuario?.agua ?? 0) * 1000}ml
              </Text>

              <View style={styles.barraFundo}>
                <View
                  style={[
                    styles.barraPreenchida,
                    {
                      width: `${Math.min(
                        (totaisConsumidos.agua / ((usuario?.agua ?? 0) * 1000 || 1)) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.circuloContainer}>
              <View style={styles.circulo}>
                <Text style={styles.calorias}>
                  {Math.round(totaisConsumidos.calorias)} / {Math.round(usuario?.calorias ?? 0)} {"\n"} kcal
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.topoCard}>
            <Text style={styles.tipoRefeicao}>Café da manhã</Text>

            <TouchableOpacity style={styles.botaoPontos}>
              <DotsThreeOutlineVertical size={32} color="#8D86C9" />
            </TouchableOpacity>
          </View>

          <View style={styles.Separacao} />

          {consumosPorRefeicao("Café").length > 0 ? (
            consumosPorRefeicao("Café").map((c: any) => (
              <View key={c.id || c.alimento + Math.random()} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: "#fff" }}>{c.alimento.replace("Café - ", "")} • {c.quantidade}g</Text>
                <Text style={{ color: "#aaa", fontSize: 12 }}>
                  {c.calorias} kcal • P {c.proteinas}g • C {c.carboidratos}g • G {c.gorduras}g
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: Cores.branco, paddingHorizontal: 10 }}>Nenhum alimento registrado</Text>
          )}

          <View style={styles.Separacao} />

          <View style={styles.macrosContainer}>
            <View style={styles.macroItem}>
              <Text style={[styles.valor, { color: Cores.rosa }]}>{Math.round(totaisConsumidos.carboidratos)}</Text>
              <Text style={[styles.label, { color: Cores.rosa }]}>Carboidratos</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.valor, { color: Cores.azul }]}>{Math.round(totaisConsumidos.proteinas)}</Text>
              <Text style={[styles.label, { color: Cores.azul }]}>Proteína</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.valor, { color: Cores.amarelo }]}>{Math.round(totaisConsumidos.gorduras)}</Text>
              <Text style={[styles.label, { color: Cores.amarelo }]}>Gordura</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.valor, { color: Cores.roxo }]}>{Math.round(totaisConsumidos.calorias)}</Text>
              <Text style={[styles.label, { color: Cores.roxo }]}>Calorias</Text>
            </View>
          </View>

          <View style={styles.Separacao} />

          <TouchableOpacity style={styles.botaoAdicionar} onPress={AbrirSelecao}>
            <Text style={styles.botaoTexto}>＋ Adicionar alimentos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.topoCard}>
            <Text style={styles.tipoRefeicao}>Almoço</Text>

            <TouchableOpacity style={styles.botaoPontos}>
              <DotsThreeOutlineVertical size={32} color="#8D86C9" />
            </TouchableOpacity>
          </View>

          <View style={styles.Separacao} />

          {consumosPorRefeicao("Almoço").length > 0 ? (
            consumosPorRefeicao("Almoço").map((c: any) => (
              <View key={c.id || c.alimento + Math.random()} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: "#fff" }}>{c.alimento.replace("Almoço - ", "")} • {c.quantidade}g</Text>
                <Text style={{ color: "#aaa", fontSize: 12 }}>
                  {c.calorias} kcal • P {c.proteinas}g • C {c.carboidratos}g • G {c.gorduras}g
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: Cores.branco, paddingHorizontal: 10 }}>Nenhum alimento registrado</Text>
          )}

          <View style={styles.Separacao} />

          <View style={styles.macrosContainer}>
            <View style={styles.macroItem}>
              <Text style={[styles.valor, { color: Cores.rosa }]}>{Math.round(totaisConsumidos.carboidratos)}</Text>
              <Text style={[styles.label, { color: Cores.rosa }]}>Carboidratos</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.valor, { color: Cores.azul }]}>{Math.round(totaisConsumidos.proteinas)}</Text>
              <Text style={[styles.label, { color: Cores.azul }]}>Proteína</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.valor, { color: Cores.amarelo }]}>{Math.round(totaisConsumidos.gorduras)}</Text>
              <Text style={[styles.label, { color: Cores.amarelo }]}>Gordura</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.valor, { color: Cores.roxo }]}>{Math.round(totaisConsumidos.calorias)}</Text>
              <Text style={[styles.label, { color: Cores.roxo }]}>Calorias</Text>
            </View>
          </View>

          <View style={styles.Separacao} />

          <TouchableOpacity style={styles.botaoAdicionar} onPress={AbrirSelecao}>
            <Text style={styles.botaoTexto}>＋ Adicionar alimentos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.topoCard}>
            <Text style={styles.tipoRefeicao}>Jantar</Text>

            <TouchableOpacity style={styles.botaoPontos}>
              <DotsThreeOutlineVertical size={32} color="#8D86C9" />
            </TouchableOpacity>
          </View>

          <View style={styles.Separacao} />

          {consumosPorRefeicao("Jantar").length > 0 ? (
            consumosPorRefeicao("Jantar").map((c: any) => (
              <View key={c.id || c.alimento + Math.random()} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: "#fff" }}>{c.alimento.replace("Jantar - ", "")} • {c.quantidade}g</Text>
                <Text style={{ color: "#aaa", fontSize: 12 }}>
                  {c.calorias} kcal • P {c.proteinas}g • C {c.carboidratos}g • G {c.gorduras}g
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: Cores.branco, paddingHorizontal: 10 }}>Nenhum alimento registrado</Text>
          )}

          <View style={styles.Separacao} />

          <View style={styles.macrosContainer}>
            <View style={styles.macroItem}>
              <Text style={[styles.valor, { color: Cores.rosa }]}>{Math.round(totaisConsumidos.carboidratos)}</Text>
              <Text style={[styles.label, { color: Cores.rosa }]}>Carboidratos</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.valor, { color: Cores.azul }]}>{Math.round(totaisConsumidos.proteinas)}</Text>
              <Text style={[styles.label, { color: Cores.azul }]}>Proteína</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.valor, { color: Cores.amarelo }]}>{Math.round(totaisConsumidos.gorduras)}</Text>
              <Text style={[styles.label, { color: Cores.amarelo }]}>Gordura</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.valor, { color: Cores.roxo }]}>{Math.round(totaisConsumidos.calorias)}</Text>
              <Text style={[styles.label, { color: Cores.roxo }]}>Calorias</Text>
            </View>
          </View>

          <View style={styles.Separacao} />

          <TouchableOpacity style={styles.botaoAdicionar} onPress={AbrirSelecao}>
            <Text style={styles.botaoTexto}>＋ Adicionar alimentos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aguaCard}>
          <View style={styles.aguaCardTopo}>
            <Text style={styles.aguaText}>Água</Text>
          </View>

          <View style={styles.separacaoAgua} />

          <View style={styles.fundoCard}>
            {loadingAgua ? (
              <ActivityIndicator color="#00255F" size="small" />
            ) : (
              <Text style={styles.quantiAgua}>
                {aguaConsumida}ml / {(usuario?.agua ?? 0) * 1000}ml
              </Text>
            )}

            <View style={styles.containerButtons}>
              <TouchableOpacity onPress={handleRemoveAgua}>
                <MinusCircle size={32} color="#00255F" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.selectAgua} onPress={botaoAgua}>
                <Text style={{ color: "#00255F", fontWeight: "bold" }}>+100ml</Text>
              </TouchableOpacity>


              <TouchableOpacity onPress={handleAddAgua}>
                <PlusCircle size={32} color="#00255F" />
              </TouchableOpacity>
            </View>

            <View style={[styles.barraFundo, { marginTop: 15, width: "90%" }]}>
              <View
                style={[
                  styles.barraPreenchida,
                  {
                    width: `${Math.min(
                      ( (totaisConsumidos.agua ?? 0) / ((usuario?.agua ?? 0) * 1000 || 1) ) * 100,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Cores.primariaEscura,
  },
  header: {
    marginTop: 80,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerLeftText: {
    color: Cores.secundaria,
    fontSize: 24,
    fontWeight: "800",
  },
  headerRightText: {
    color: Cores.secundaria,
    fontSize: 15,
    fontWeight: "800",
  },
  Croma: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  inputContainer: {
    width: "100%",
    backgroundColor: Cores.secundaria,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  detailsButton: {
    backgroundColor: Cores.primariaEscura,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  progressoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  barrasContainer: {
    flex: 1,
    justifyContent: "center",
  },
  Progresso: {
    backgroundColor: "#f4f4f4",
    width: "100%",
    height: 16,
    justifyContent: "center",
    borderRadius: 12,
    marginVertical: 4,
    paddingLeft: 8,
  },
  textProgresso: {
    fontSize: 12,
    fontWeight: "600",
  },
  circuloContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  circulo: {
    width: 140,
    height: 70,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderWidth: 4,
    borderBottomWidth: 0,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  calorias: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  titleStyle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Cores.primariaEscura,
  },
  barraFundo: {
    width: "100%",
    height: 16,
    backgroundColor: "#d9d9d9",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 4,
  },
  barraPreenchida: {
    height: "100%",
    backgroundColor: Cores.primariaEscura,
    borderRadius: 10,
  },
  detailsText: {
    color: "#f4f4f4",
  },
  card: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: Cores.secundaria,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  topoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
  },
  tipoRefeicao: {
    color: Cores.primariaEscura,
    fontSize: 14,
    fontWeight: "bold",
  },
  botaoPontos: {},
  Separacao: {
    height: 1,
    backgroundColor: Cores.terciaria,
    marginBottom: 8,
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  macroItem: {
    alignItems: "center",
    flex: 1,
  },
  valor: {
    fontWeight: "bold",
    fontSize: 16,
  },
  label: {
    color: "#bbb",
    fontSize: 12,
    marginTop: 2,
  },
  botaoAdicionar: {
    marginTop: 8,
    backgroundColor: "transparent",
    alignItems: "center",
    marginBottom: 15,
  },
  botaoTexto: {
    color: Cores.terciaria,
    fontWeight: "bold",
  },
  aguaCard: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: Cores.secundaria,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  aguaCardTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
  },
  aguaText: {
    color: "#f4f4f4",
    fontSize: 14,
    fontWeight: "bold",
  },
  separacaoAgua: {
    width: "100%",
    backgroundColor: "#00255F",
    height: 10,
    marginTop: 10,
  },
  fundoCard: {
    alignItems: "center",
    marginTop: 10,
  },
  quantiAgua: {
    color: "#00255F",
  },
  containerButtons: {
    flexDirection: "row",
    gap: 50,
  },
  selectAgua: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#d9d9d9",
    justifyContent: "center",
    alignItems: "center",
  },
});
