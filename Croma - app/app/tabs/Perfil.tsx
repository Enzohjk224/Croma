import { Cores } from "@/constants/Cores";
import {Alert, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Perfil(){
    const router = useRouter();
    const [usuario, setUsuario] = useState<any>(null);

    
  useEffect(() => {
    async function buscarUsuario() {
      const email = await AsyncStorage.getItem("usuarioEmail");
      if (email) {
        fetch(`http://10.180.13.20:3000/usuario/${email}`)//Trocar o Ip para o Ipv4 da rede em que o Pc está
          .then((res) => res.json())
          .then((data) => setUsuario(data))
          .catch((err) => console.log("Erro ao buscar usuário:", err));
      }
    }
    buscarUsuario();
  }, []);

  async function handleLogout() {

    
     router.navigate("/stacks/Login");
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("usuarioEmail"); 
          setUsuario(null); 
          router.replace("/stacks/Login"); 
        },
      },
    ]);
  }

    return(
        <View style={styles.container}>

            <View style={styles.containerTopo}>
                <Text style={styles.titulo}>Perfil</Text>
            </View>
            
            <View style={styles.containerPrincipal}>
                <View style={styles.containerBox}>
                    <Text style={styles.dados}>Seus Dados</Text>
                    <View style={styles.containerFoto}>
                        <Image
                            style={styles.Logo}
                            source={require('../assets/images/logooo.png')}
                        />
                        <View style={styles.containerInfo}>
                            <Text style={styles.nomeUsuario}>{usuario ? usuario.nome : "Carregando..."}</Text>
                            <Text style={styles.email}>{usuario?.email}</Text>
                        </View>
                    </View>
                    <View style={styles.containerDados}>
                        <View style={styles.tipoDados}>
                            <Text style={[styles.textoDados, {color:Cores.rosa}]}>{usuario?.altura}</Text>
                            <Text style={styles.textoDados}>Altura</Text>
                        </View>
                        <View style={styles.tipoDados}>
                            <Text style={[styles.textoDados, {color:Cores.azul}]}>{usuario?.peso}</Text>
                            <Text style={styles.textoDados}>Peso</Text>
                        </View>
                        <View style={styles.tipoDados}>
                            <Text style={[styles.textoDados, {color:Cores.roxo}]}>{usuario?.genero}</Text>
                            <Text style={styles.textoDados}>Gênero</Text>
                        </View>
                        <View style={styles.tipoDados}>
                            <Text style={[styles.textoDados, {color:Cores.amarelo}]}>{usuario?.idade}</Text>
                            <Text style={styles.textoDados}>Idade</Text>
                        </View>
                    </View>
                    <View style={styles.separador}/>
                    <View style={styles.containerNivel}>
                        <Text style={styles.atividadeNivel}>{usuario?.fator_atividade}</Text>
                        <Text style={styles.atividade}>NÍVEL DE ATIVIDADE</Text>
                    </View>
                    <View style={styles.separador}/>
                    <View style={styles.containerObjetivo}>
                        <Text style={styles.tipobjetivo}>{usuario?.formula}</Text>
                        <Text style={styles.objetivo}>FORMULA</Text>
                    </View>
                    <View style={styles.separador}/>
                    <TouchableOpacity style={styles.buttonSair} onPress={handleLogout}>
                        <Text style={styles.textSair}>Sair</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Cores.secundaria,
    },
    containerTopo: {
        marginLeft: 15,
        height: 50,
        marginTop: 50,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Cores.branco,
    },
    containerPrincipal: {
        width: '100%',
        backgroundColor: Cores.primariaEscura,
        height: '100%',
    },
    containerBox: {
        backgroundColor: Cores.secundaria,
        width: '90%',
        marginTop: 10,
        alignItems: 'center',
        marginLeft: 20,
        height: 'auto',
        borderRadius: 16,

    },
    dados: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Cores.branco,
    },
    containerFoto: {
        height: 250,
        width: 250,
        marginTop: 10,
        marginBottom: 30,
    },
    Logo: {
        width: '100%',
        height: '100%',
    },
    containerInfo: {
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: 60,
        backgroundColor: Cores.primariaEscura,
        marginTop: 10,
        borderRadius: 10,
    },
    nomeUsuario: {
        color: Cores.branco,
        fontSize: 18,
        fontWeight: 'bold',
    },
    email: {
        color: Cores.branco,
        fontSize: 18,
    },
    containerDados: {
        width: '100%',
        height: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        marginTop: 50,
        gap: 40,
    },
    tipoDados: {
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center',

    },
    separador: {
        height: 1,
        width: '100%',
        backgroundColor: Cores.terciaria,
        marginBottom: 8,
        marginTop: 8,
    },
    textoDados: {
        color: Cores.branco,
    },
    containerNivel: {
        justifyContent: 'center',
        alignItems: 'center',

    },
    atividadeNivel: {
        color: Cores.primariaEscura,
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 1,
    },
    atividade: {
        color: Cores.terciaria,
        fontSize: 14,

    },
    containerObjetivo: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipobjetivo: {
        color: Cores.primariaEscura,
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 1,
    },
    objetivo: {
        color: Cores.terciaria,
        fontSize: 14,
    },
    buttonSair: {
        width: '90%',
        height: 40,
        backgroundColor: Cores.rosa,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
        borderRadius: 10,
    },
    textSair: {
        color: Cores.terciaria,
        fontWeight: 'bold',
    },
});