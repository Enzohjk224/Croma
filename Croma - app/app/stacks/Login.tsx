import {Text, View, StyleSheet, TextInput, TouchableOpacity, Alert} from "react-native"

import {Envelope, LockKey, } from "phosphor-react-native"
import { useRouter } from "expo-router";
import { Cores } from "@/constants/Cores";
import { useState } from "react";

export default function Login(){

    const router = useRouter();

    function Cadastrar(){
          router.navigate("/stacks/Cadastro");
  
      }

    
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleHome() {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos para continuar.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://10.180.13.20:3000/login", { //Trocar o Ip para o Ipv4 da rede em que o Pc está
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (data.error) {
        Alert.alert("Erro", data.error);
      } else {
        router.replace("/tabs/Principal");
      }
    } catch (error) {
      console.log("Erro ao conectar:", error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }


    return(
            <View style={styles.container} >

                <Text style={styles.bemVindo}> Bem Vindo Ao Croma!</Text>

                <View style={styles.content}>
                    <View style={styles.contentInput}>
                        <Envelope size={32} color="#757575"/>
                        <TextInput placeholder="Seu e-mail" style={styles.input} placeholderTextColor="#757575"
                        value={email}
                        onChangeText={setEmail}/>
                    </View>

                    <View style={styles.contentInput}>
                        <LockKey size={32} color="#757575"/>
                        <TextInput placeholder="Sua Senha" style={styles.input} placeholderTextColor="#757575"
                        secureTextEntry
                        value={senha}
                        onChangeText={setSenha}/>
                    </View>

                </View>

                <TouchableOpacity onPress={handleHome} style={styles.buttonSignIn} disabled={loading}>
                    <Text style={styles.buttonSignInText}>{loading ? "Entrando..." : "Entrar"}</Text>
                </TouchableOpacity>

                
                

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Não possui login ?</Text>
                    <TouchableOpacity onPress={Cadastrar}>
                        <Text style={styles.footerButtonText}>Cadastre-se</Text>
                    </TouchableOpacity>
                </View>
            </View>
        
    );
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Cores.primariaEscura,
        alignItems: "center",
        paddingHorizontal: 20,
    },
    bemVindo:{
        color: Cores.terciaria,
        marginTop: 200,
        fontSize: 24,
        fontWeight: 600,
    },
    content:{
        width: "100%",
        marginTop: 50,
        alignItems: "center",
        gap: 20,
    },
    contentInput:{
        width: "100%",
        height: 56,
        backgroundColor: "#1f222a",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        gap: 10,
    },
    input:{
        flex: 1,
        color: Cores.terciaria,
    },
    buttonSignIn:{
        backgroundColor: Cores.secundaria,
        width: "100%",
        height: 56,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
    },
    buttonSignInText:{
        color: Cores.terciaria,
        fontSize: 16,
        fontWeight: 800,
    },
    containerSeparator:{
        width: "100%",
        marginTop: 50,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    separatorText:{
        color: Cores.terciaria,
        fontSize: 16,
        fontWeight: "400",
    },
    separator:{
        height: 1,
        backgroundColor: Cores.terciaria,
        flex: 1,
    },
    footer:{
        marginTop: 50,
        flexDirection: "row",
        gap: 10,
    },
    footerButton:{
        width: 100,
        height: 60,
        backgroundColor: "#1f222a",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
    },
    footerText:{
        color: Cores.terciaria,
        fontSize: 16,
        fontWeight: "400",
    },
    footerButtonText:{
        color: Cores.secundaria,
        fontSize: 16,
        fontWeight: "400",
    },
});