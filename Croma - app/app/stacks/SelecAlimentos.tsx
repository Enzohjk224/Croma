// SelectAlimentos.tsx
import { Cores } from "@/constants/Cores";
import { useRouter } from "expo-router";
import { ArrowLeft, MagnifyingGlass } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SelectAlimentos() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  
  const [modalVisible, setModalVisible] = useState(false);
  const [alimentoSelecionado, setAlimentoSelecionado] = useState<any | null>(null);
  const [quantidade, setQuantidade] = useState("100"); 
  const [refeicao, setRefeicao] = useState<"Café" | "Almoço" | "Jantar">("Café");
  const [submitting, setSubmitting] = useState(false);

  function VoltarR() {
    router.navigate("/tabs/Principal");
  }

  
  useEffect(() => {
    if (busca.length < 2) {
      setLista([]);
      return;
    }

    setLoading(true);

    fetch(
      `https://br.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        busca
      )}&search_simple=1&action=process&json=1&lang=pt`
    )
      .then((res) => res.json())
      .then((data) => {
        const produtos = data.products || [];

        
        const convertidos = produtos
          .filter((p: any) => p.nutriments) 
          .map((p: any) => ({
            name: p.product_name_pt || p.product_name || "Nome não disponível",
            brand: p.brands || "Sem marca",
            nutriments: p.nutriments || {},
          }));

        setLista(convertidos);
      })
      .catch((err) => {
        console.log("Erro:", err);
        setLista([]);
      })
      .finally(() => setLoading(false));
  }, [busca]);

  
  function abrirAdicionar(alimento: any) {
    setAlimentoSelecionado(alimento);
    setQuantidade("100");
    setRefeicao("Café");
    setModalVisible(true);
  }

  
  function calcularPorQuantidade(nutriments: any, qtdGramas: number) {
    const factor = qtdGramas / 100;
    const energyKcal =
      nutriments["energy-kcal_100g"] ??
      nutriments["energy-kcal"] ??
      Math.round((nutriments.energy_100g || 0) / 4.184) ??
      0;

    const kcal = Math.round(energyKcal * factor);
    const proteins = Number(((nutriments.proteins_100g || 0) * factor).toFixed(2));
    const carbs = Number(((nutriments.carbohydrates_100g || 0) * factor).toFixed(2));
    const fats = Number(((nutriments.fat_100g || 0) * factor).toFixed(2));

    return { kcal, proteins, carbs, fats };
  }

  
  async function confirmarAdicionar() {
    if (!alimentoSelecionado) return;
    const email = await AsyncStorage.getItem("usuarioEmail");
    if (!email) {
      Alert.alert("Erro", "Usuário não encontrado. Faça login novamente.");
      return;
    }

    const qtd = Number(quantidade || "0");
    if (isNaN(qtd) || qtd <= 0) {
      Alert.alert("Quantidade inválida", "Informe uma quantidade em gramas maior que zero.");
      return;
    }

    const nutric = calcularPorQuantidade(alimentoSelecionado.nutriments, qtd);

    const payload = {
      email,
      alimento: `${refeicao} - ${alimentoSelecionado.name}`,
      quantidade: qtd,
      calorias: nutric.kcal,
      proteinas: nutric.proteins,
      carboidratos: nutric.carbs,
      gorduras: nutric.fats,
    };

    try {
      setSubmitting(true);
      const resp = await fetch("http://10.180.13.20:3000/consumo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.log("Erro ao salvar consumo:", err);
        Alert.alert("Erro", "Não foi possível salvar o consumo.");
      } else {
        Alert.alert("Sucesso", "Alimento adicionado à dieta.");
        setModalVisible(false);
       
      }
    } catch (e) {
      console.log("Erro POST /consumo:", e);
      Alert.alert("Erro", "Erro de conexão ao salvar consumo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerTop}>
        <View style={styles.containerTop2}>
          <TouchableOpacity onPress={VoltarR}>
            <ArrowLeft size={32} color="#f4f4f4" />
          </TouchableOpacity>

          <Text style={styles.titulo}>Procurar alimento</Text>
        </View>

        <View style={styles.contentInput}>
          <MagnifyingGlass size={26} color="#757575" />
          <TextInput
            style={styles.input}
            placeholder="Pesquisar em português..."
            placeholderTextColor={Cores.branco}
            value={busca}
            onChangeText={setBusca}
          />
        </View>
      </View>

      <ScrollView style={styles.containerPrincipal}>
        <Text style={styles.sectionTitle}>Resultados</Text>

        {loading && <ActivityIndicator size="small" color={Cores.branco} />}

        {lista.map((alimento, index) => {
          const n = alimento.nutriments;
          const kcal =
            n["energy-kcal_100g"] ??
            n["energy-kcal"] ??
            Math.round((n.energy_100g || 0) / 4.184) ??
            0;

          return (
            <View key={index} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.nome} numberOfLines={2}>
                  {alimento.name}
                </Text>
                <Text style={styles.marca}>{alimento.brand}</Text>
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.calorias}>{kcal} kcal / 100g</Text>

                <View style={styles.macros}>
                  <Text style={[styles.macro, { color: Cores.rosa }]}>
                    C: {n.carbohydrates_100g ?? 0}
                  </Text>

                  <Text style={[styles.macro, { color: Cores.azul }]}>
                    P: {n.proteins_100g ?? 0}
                  </Text>

                  <Text style={[styles.macro, { color: Cores.amarelo }]}>
                    G: {n.fat_100g ?? 0}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.btnAdd}
                  onPress={() => abrirAdicionar(alimento)}
                >
                  <Text style={styles.btnAddText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={modalStyles.overlay}>
            <View style={modalStyles.modalBox}>
              <Text style={modalStyles.modalTitle}>Adicionar à dieta</Text>

              <Text style={modalStyles.label}>Refeição</Text>
              <View style={modalStyles.row}>
                {(["Café", "Almoço", "Jantar"] as const).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      modalStyles.chip,
                      refeicao === r ? modalStyles.chipActive : undefined,
                    ]}
                    onPress={() => setRefeicao(r)}
                  >
                    <Text
                      style={[
                        modalStyles.chipText,
                        refeicao === r ? modalStyles.chipTextActive : undefined,
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[modalStyles.label, { marginTop: 10 }]}>Quantidade (g)</Text>
              <TextInput
                keyboardType="numeric"
                style={modalStyles.input}
                value={quantidade}
                onChangeText={setQuantidade}
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                <Pressable
                  style={[modalStyles.actionBtn, { backgroundColor: "#ccc" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text>Cancelar</Text>
                </Pressable>

                <Pressable
                  style={[modalStyles.actionBtn, { backgroundColor: Cores.primariaEscura }]}
                  onPress={confirmarAdicionar}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff" }}>Confirmar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Cores.secundaria,
  },
  containerTop: {
    marginTop: 50,
    marginBottom: 20,
    alignItems: "center",
  },
  containerTop2: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titulo: {
    color: Cores.branco,
    fontSize: 20,
    fontWeight: "bold",
  },
  contentInput: {
    marginTop: 15,
    width: "90%",
    height: 56,
    backgroundColor: "#1f222a",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
  },
  input: { flex: 1, color: Cores.branco },
  containerPrincipal: {
    backgroundColor: Cores.primariaEscura,
    width: "100%",
    padding: 10,
  },
  sectionTitle: {
    color: Cores.branco,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  loading: {
    color: Cores.branco,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#15161b",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLeft: { flex: 1, paddingRight: 8 },
  nome: {
    color: Cores.branco,
    fontSize: 16,
    fontWeight: "bold",
  },
  marca: {
    color: "#ccc",
    fontSize: 13,
  },
  cardRight: {
    alignItems: "flex-end",
    width: 120,
  },
  calorias: {
    color: Cores.secundaria,
    fontSize: 13,
    fontWeight: "600",
  },
  macros: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  macro: { fontSize: 12, fontWeight: "700" },
  btnAdd: {
    marginTop: 10,
    backgroundColor: Cores.secundaria,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnAddText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "86%",
    backgroundColor: "#111216",
    padding: 16,
    borderRadius: 12,
  },
  modalTitle: { color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 8 },
  label: { color: "#ddd", fontSize: 13 },
  row: { flexDirection: "row", gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#222",
  },
  chipActive: { backgroundColor: Cores.primariaEscura },
  chipText: { color: "#ddd" },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  input: {
    marginTop: 6,
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 8,
    color: "#fff",
  },
  actionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
