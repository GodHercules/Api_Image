const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
const port = 3000;

// Configurar Multer para salvar em uma pasta temporária
const tempDir = path.join(__dirname, "temp");
fs.ensureDirSync(tempDir); // Garante que o diretório temporário exista

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Rota para o caminho raiz
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
      <html lang="pt-br">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Upload de Imagem</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  background-color: #f4f4f9;
              }
              form {
                  background: #fff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              input[type="file"] {
                  margin-bottom: 10px;
              }
              button {
                  background-color: #007BFF;
                  color: #fff;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 5px;
                  cursor: pointer;
              }
              button:hover {
                  background-color: #0056b3;
              }
          </style>
      </head>
      <body>
          <h1>Upload de Imagem</h1>
          <form action="/upload" method="post" enctype="multipart/form-data">
              <input type="file" name="image" required />
              <br />
              <button type="submit">Enviar Imagem</button>
          </form>
      </body>
      </html>
    `);
  });
  

// Endpoint para upload e processamento da imagem
app.post("/upload", upload.single("image"), (req, res) => {
  const filePath = req.file.path;

  // Chamar o script Python
  const pythonProcess = spawn("python3", ["python_script.py", filePath]);

  let pythonOutput = "";
  pythonProcess.stdout.on("data", (data) => {
    pythonOutput += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Erro no script Python: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).send("Erro ao processar a imagem");
    }

    // Responder com o resultado
    res.json({ resultado: pythonOutput.trim() });

    // Apagar o arquivo e a pasta temporária
    fs.remove(filePath, (err) => {
      if (err) console.error(`Erro ao remover o arquivo: ${err}`);
    });
  });
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
