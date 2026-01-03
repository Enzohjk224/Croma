
import {Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Dimensions} from "react-native"
import { Cores } from '@/constants/Cores'
import { ArrowLeft, LockKey } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { navigate } from "expo-router/build/global-state/routing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';


export default function Cadastro(){

    const router = useRouter();
    
        function VoltarR(){
            router.navigate("/stacks/Login");
        }

        
    const [form, setForm] = useState({
        email: "",
        senha: "",
        nome: "",
        peso: "",
        altura: "",
        idade: "",
        genero: "",
        fator_atividade: "",
        meta: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (name: string, value: string) => {
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = () => {
        setLoading(true);

    const usuario = {
      email: form.email,
      senha: form.senha,
      nome: form.nome,
      peso: parseInt(form.peso),
      altura: parseInt(form.altura),
      idade: parseInt(form.idade),
      genero: form.genero,
      fator_atividade: form.fator_atividade,
      meta: form.meta,
    };

    fetch('http://10.180.13.20:3000/usuario', {//Trocar o Ip para o Ipv4 da rede em que o Pc está
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data.error) {
          Alert.alert('Erro', data.error);
        } else {

        await AsyncStorage.setItem("usuarioEmail", form.email);

          Alert.alert('Sucesso', data.message, [
            {
                text: "OK",
                onPress: () => { router.replace("/tabs/Principal"); }
            }
          ]);
        }
      })
      .catch((err) => {
        console.log('Erro ao conectar:', err);
        Alert.alert('Erro', 'Não foi possível conectar ao servidor');
      })
      .finally(() => setLoading(false));
  };

    return(
        <View style={styles.container}>
            <View style={styles.containerTopo}>
                <TouchableOpacity onPress={VoltarR}>
                    <ArrowLeft  size={32} color="#f4f4f4"/>
                </TouchableOpacity>
                <Text style={styles.titulo}>Cadastro</Text>
            </View>
            <ScrollView style={[styles.containerPrincipal, { padding: 20 }]}>
                   <View style={styles.contentInput}>
                        <TextInput placeholder="Seu nome de Usuario..." value={form.nome} onChangeText={(v) => handleChange('nome', v)}
                        style={styles.input} placeholderTextColor={Cores.terciaria}/>
                    </View>
                    <View style={styles.contentInput}>
                        <TextInput placeholder="Seu Email..." value={form.email} onChangeText={(v) => handleChange('email', v)}
                        style={styles.input} placeholderTextColor={Cores.terciaria}/>
                    </View>
                    <View style={styles.contentInput}>
                        <TextInput placeholder="Seu Senha..." value={form.senha} onChangeText={(v) => handleChange('senha', v)}
                        style={styles.input} placeholderTextColor={Cores.terciaria}/>
                    </View>
                    <View style={styles.contentInput}>
                        <TextInput placeholder="Seu Peso..." value={form.peso} onChangeText={(v) => handleChange('peso', v)}
                        style={styles.input} placeholderTextColor={Cores.terciaria}/>
                    </View>
                    <View style={styles.contentInput}>
                        <TextInput placeholder="Seu Altura..." value={form.altura} onChangeText={(v) => handleChange('altura', v)}
                        style={styles.input} placeholderTextColor={Cores.terciaria}/>
                    </View>
                    <View style={styles.contentInput}>
                        <TextInput placeholder="Seu Idade..." value={form.idade} onChangeText={(v) => handleChange('idade', v)}
                        style={styles.input} placeholderTextColor={Cores.terciaria}/>
                    </View>
                    <Picker style={styles.contentInput}
                        selectedValue={form.genero}
                        onValueChange={(v) => handleChange("genero", v)}
                        >
                        <Picker.Item label="Selecione seu gênero" value="" />
                        <Picker.Item label="Masculino" value="masculino" />
                        <Picker.Item label="Feminino" value="feminino" />
                    </Picker>

                    <Picker style={styles.contentInput}
                        selectedValue={form.fator_atividade}
                        onValueChange={(v) => handleChange("fator_atividade", v)}
                        >
                        <Picker.Item label="Selecione seu nível" value="" />
                        <Picker.Item label="Sedentário" value="sedentario" />
                        <Picker.Item label="Leve (1-3x/sem)" value="leve" />
                        <Picker.Item label="Moderado (3-5x/sem)" value="moderado" />
                        <Picker.Item label="Intenso (6-7x/sem)" value="intenso" />
                    </Picker>

                    <Picker style={styles.contentInput}
                        selectedValue={form.meta}
                        onValueChange={(value) => handleChange("meta", value)}
                        >
                        <Picker.Item label="Perder peso" value="perder_peso" />
                        <Picker.Item label="Manter peso" value="manter_peso" />
                        <Picker.Item label="Ganhar massa" value="ganhar_massa" />
                    </Picker>

                
                    <TouchableOpacity style={styles.buttonCadastrar} onPress={handleSubmit} disabled={loading}>
                        <Text style={styles.textButton}>{loading ? "Cadastrando..." : "Cadastrar-se"}</Text>
                    </TouchableOpacity>
            </ScrollView>
            
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
        width: '100%',
        marginTop: 50,
        alignItems: 'center',
        flexDirection: 'row',
        gap: '25%',
    },
    titulo: {
        color: Cores.branco,
        fontWeight: 'bold',
        fontSize: 20,
    },
    containerPrincipal: {
        width: '100%',
        backgroundColor: Cores.primariaEscura,
        height: '100%',
    },
    contentInput: {
        width: "90%",
        marginLeft: 20,
        height: 56,
        backgroundColor: Cores.secundaria,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        gap: 10,
        marginTop: 20,
    },
    input:{
        flex: 1,
        color: Cores.branco,
    },
    buttonCadastrar: {
        width: '90%',
        marginLeft: 20,
        backgroundColor: Cores.secundaria,
        height: 56,
        borderRadius: 12,
        marginTop: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    textButton: {
        color: Cores.branco,
        fontWeight: 'bold',
        fontSize: 18,

    },
});
