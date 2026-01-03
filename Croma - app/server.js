const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- CONEXÃO MySQL ----------------
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'Croma'
});

db.connect((err) => {
  if (err) console.log("Erro ao conectar:", err);
  else console.log("Conectado ao MySQL!");
});


function fatorAtividadeValue(fator) {
  switch (fator) {
    case "sedentario": return 1.2;
    case "leve": return 1.375;
    case "moderado": return 1.55;
    case "intenso": return 1.725;
    default: return 1.2;
  }
}

function calcularFormulasBasais(peso, altura, idade, genero) {
  const mifflin =
    genero === "masculino"
      ? 10 * peso + 6.25 * altura - 5 * idade + 5
      : 10 * peso + 6.25 * altura - 5 * idade - 161;

  const harris =
    genero === "masculino"
      ? 88.362 + 13.397 * peso + 4.799 * altura - 5.677 * idade
      : 447.593 + 9.247 * peso + 3.098 * altura - 4.330 * idade;

  let fao = 0;
  if (genero === "masculino") {
    if (idade >= 18 && idade <= 30) fao = 15.3 * peso + 679;
    else if (idade > 30 && idade <= 60) fao = 11.6 * peso + 879;
    else fao = 13.5 * peso + 487;
  } else {
    if (idade >= 18 && idade <= 30) fao = 14.7 * peso + 496;
    else if (idade > 30 && idade <= 60) fao = 8.7 * peso + 829;
    else fao = 10.5 * peso + 596;
  }

  return { mifflin, harris, fao };
}

function escolherMelhorFormula(formulas, imc) {
  if (imc < 18.5 || imc > 30) return { nome: "FAO/OMS/ONU", valor: formulas.fao };
  return { nome: "Mifflin-St Jeor", valor: formulas.mifflin };
}

function calcularMacros(peso, meta, tdee) {
  let protKg = 0;
  let gordKg = 0;

  if (meta === "perder_peso") {
    protKg = 2.0;
    gordKg = 0.8;
  } else if (meta === "manter_peso") {
    protKg = 1.6;
    gordKg = 0.9;
  } else if (meta === "ganhar_massa") {
    protKg = 2.2;
    gordKg = 1.0;
  }

  const proteinas = protKg * peso; 
  const gorduras = gordKg * peso;  

  const kcalProteina = proteinas * 4;
  const kcalGordura = gorduras * 9;

  const carbo = (tdee - (kcalProteina + kcalGordura)) / 4;

  return {
    calorias: Math.round(tdee),
    proteinas: Math.round(proteinas),
    gorduras: Math.round(gorduras),
    carboidratos: Math.round(carbo),
    agua: Number((peso * 0.035).toFixed(2))
  };
}


app.get('/usuario', (req, res) => {
  db.query("SELECT * FROM usuario", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


app.get('/usuario/:email', (req, res) => {
  const email = req.params.email;

  const sql = `
    SELECT 
      usuario.*,
      calculo.imc,
      calculo.formula,
      calculo.calorias,
      calculo.proteinas,
      calculo.carboidratos,
      calculo.gorduras,
      calculo.agua
    FROM usuario
    LEFT JOIN calculo ON usuario.email = calculo.email
    WHERE usuario.email = ?
    ORDER BY calculo.id DESC
    LIMIT 1
  `;

  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });

    res.json(results[0]);
  });
});

// CADASTRAR USUÁRIO 
app.post('/usuario', (req, res) => {
  const { email, senha, nome, peso, altura, idade, genero, fator_atividade, meta } = req.body;

  if (!email || !senha || !nome)
    return res.status(400).json({ error: "Preencha os campos obrigatórios" });

  const alturaM = altura / 100;
  const imc = peso / (alturaM * alturaM);

  const formulas = calcularFormulasBasais(peso, altura, idade, genero);
  const melhor = escolherMelhorFormula(formulas, imc);

  const tdee = melhor.valor * fatorAtividadeValue(fator_atividade);
  const macros = calcularMacros(peso, meta, tdee);

  const sqlUser = `
    INSERT INTO usuario
    (email, senha, nome, peso, altura, idade, genero, fator_atividade, meta)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sqlUser,
    [email, senha, nome, peso, altura, idade, genero, fator_atividade, meta],
    (err) => {
      if (err) {
        console.log("Erro ao cadastrar:", err);
        return res.status(500).json({ error: "Erro ao cadastrar usuário" });
      }

      const sqlCalc = `
        INSERT INTO calculo (email, imc, formula, calorias, proteinas, gorduras, carboidratos, agua)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(sqlCalc,
        [email, imc, melhor.nome, macros.calorias, macros.proteinas, macros.gorduras, macros.carboidratos, macros.agua],
        (err2) => {
          if (err2) {
            console.log("Erro ao salvar cálculo:", err2);
            return res.status(500).json({ error: "Erro ao salvar cálculo" });
          }

          return res.status(201).json({
            message: "Usuário cadastrado com sucesso!",
            imc: imc.toFixed(2),
            formula_usada: melhor.nome,
            tdee: Math.round(tdee),
            macros
          });
        }
      );
    }
  );
});

// LOGIN
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  db.query(
    "SELECT * FROM usuario WHERE email = ? AND senha = ?",
    [email, senha],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Erro no servidor" });

      if (results.length === 0)
        return res.status(401).json({ error: "Usuário ou senha inválidos" });

      res.json({
        message: "Login realizado com sucesso",
        usuario: {
          email: results[0].email,
          nome: results[0].nome
        }
      });
    }
  );
});

// BUSCA ALIMNTO
app.get("/nutrition/search", async (req, res) => {
  const termo = req.query.q;

  if (!termo || termo.trim() === "") {
    return res.json({ items: [] });
  }

  try {
    const url =
      `https://br.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(termo)}&search_simple=1&action=process&json=1&lang=pt`;

    const resposta = await fetch(url);
    const dados = await resposta.json();

    const items = (dados.products || [])
      .filter(p => p.nutriments)
      .map(p => ({
        name: p.product_name_pt || p.product_name || "Sem nome",
        brand: p.brands || "Sem marca",
        nutriments: {
          energy_kcal: p.nutriments["energy-kcal_100g"] || 0,
          proteins: p.nutriments.proteins_100g || 0,
          carbs: p.nutriments.carbohydrates_100g || 0,
          fats: p.nutriments.fat_100g || 0
        }
      }));

    res.json({ items });

  } catch (err) {
    console.log("Erro API:", err);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});

// SALVAR ALIMENTO CONSUMIDO 
app.post("/consumo", (req, res) => {
  const {
    email,
    alimento,
    quantidade,
    calorias,
    proteinas,
    carboidratos,
    gorduras
  } = req.body;

  if (!email || !alimento) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  const hoje = new Date().toISOString().slice(0, 10);

  const sql = `
    INSERT INTO consumo_alimentos
    (email, alimento, quantidade, calorias, proteinas, carboidratos, gorduras, data_consumo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [email, alimento, quantidade || 0, calorias || 0, proteinas || 0, carboidratos || 0, gorduras || 0, hoje],
    (err) => {
      if (err) return res.status(500).json({ error: "Erro ao salvar consumo", detalhes: err });
      res.json({ message: "Alimento registrado com sucesso" });
    }
  );
});


app.post("/agua/add", (req, res) => {
  const { email, quantidade } = req.body;

  if (!email || typeof quantidade !== 'number') {
    return res.status(400).json({ error: "Dados inválidos. Envie email e quantidade (number, ml)." });
  }

  const hoje = new Date().toISOString().slice(0, 10);

  const sql = `
    INSERT INTO consumo_agua (email, quantidade_ml, data_consumo)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [email, quantidade, hoje], (err) => {
    if (err) {
      console.log("Erro ao inserir água:", err);
      return res.status(500).json({ error: "Erro ao registrar água", detalhes: err });
    }
    res.json({ message: "Água registrada com sucesso" });
  });
});


app.get("/agua/dia", (req, res) => {
  const { email, data } = req.query;
  if (!email) return res.status(400).json({ error: "email obrigatório" });

  const dia = data || new Date().toISOString().slice(0, 10);

  const sql = `
    SELECT SUM(quantidade_ml) AS agua
    FROM consumo_agua
    WHERE email = ? AND data_consumo = ?
  `;

  db.query(sql, [email, dia], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    const agua = (results[0] && results[0].agua) ? Number(results[0].agua) : 0;
    res.json({ agua });
  });
});


app.get("/consumo/dia", (req, res) => {
  const { email, data } = req.query;

  const dia = data || new Date().toISOString().slice(0, 10);

  const sql = `
    SELECT 
      SUM(calorias) AS calorias,
      SUM(proteinas) AS proteinas,
      SUM(carboidratos) AS carboidratos,
      SUM(gorduras) AS gorduras
    FROM consumo_alimentos
    WHERE email = ? AND data_consumo = ?
  `;

  db.query(sql, [email, dia], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    res.json(results[0] || {
      calorias: 0,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0
    });
  });
});


app.get("/consumo/faltante", (req, res) => {
  const { email } = req.query;

  if (!email) return res.status(400).json({ error: "Email obrigatório" });

  const dia = new Date().toISOString().slice(0, 10);

  const sql = `
    SELECT
      c.calorias, c.proteinas, c.carboidratos, c.gorduras, c.agua
    FROM calculo c
    WHERE c.email = ?
    ORDER BY c.id DESC
    LIMIT 1;
  `;

  db.query(sql, [email], (err, metas) => {
    if (err) return res.status(500).json({ error: err });

    if (metas.length === 0) {
      return res.status(404).json({ error: "Nenhuma meta encontrada" });
    }

    const meta = metas[0];

    const sql2 = `
      SELECT 
        SUM(calorias) AS calorias,
        SUM(proteinas) AS proteinas,
        SUM(carboidratos) AS carboidratos,
        SUM(gorduras) AS gorduras
      FROM consumo_alimentos
      WHERE email = ? AND data_consumo = ?
    `;

    db.query(sql2, [email, dia], (err2, consumidos) => {
      if (err2) return res.status(500).json({ error: err2 });

      const cons = consumidos[0] || {
        calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0
      };

      
      const sqlAgua = `
        SELECT SUM(quantidade_ml) AS agua
        FROM consumo_agua
        WHERE email = ? AND data_consumo = ?
      `;

      db.query(sqlAgua, [email, dia], (err3, aguaRes) => {
        if (err3) return res.status(500).json({ error: err3 });
        const aguaConsumida = (aguaRes[0] && aguaRes[0].agua) ? Number(aguaRes[0].agua) : 0;
        res.json({
          calorias_faltantes: meta.calorias - cons.calorias,
          proteinas_faltantes: meta.proteinas - cons.proteinas,
          carboidratos_faltantes: meta.carboidratos - cons.carboidratos,
          gorduras_faltantes: meta.gorduras - cons.gorduras,
          agua_faltante: Math.max(0, Math.round((meta.agua * 1000) - aguaConsumida)) 
        });
      });
    });
  });
});


app.get("/consumo/list", (req, res) => {
  const email = req.query.email;
  const dia = new Date().toISOString().slice(0,10);

  if(!email) return res.status(400).json({ error: "email obrigatório" });

  const sql = `
    SELECT id, alimento, quantidade, calorias, proteinas, carboidratos, gorduras
    FROM consumo_alimentos
    WHERE email = ? AND data_consumo = ?
    ORDER BY id DESC
  `;

  db.query(sql, [email, dia], (err, results) => {
    if(err) return res.status(500).json({ error: err });
    res.json(results || []);
  });
});


async function traduzir(texto) {
  if (!texto) return texto;

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        texto
      )}&langpair=en|pt-br`
    );

    const data = await res.json();
    return data.responseData.translatedText || texto;
  } catch {
    return texto;
  }
}



app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
