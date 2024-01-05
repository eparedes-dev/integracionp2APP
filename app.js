const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const authCode = '65229178007645246109x109793';
const app = express();
const port = 8080;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.use(express.static('public'));


// Ruta para manejar la solicitud del formulario
app.post('/buscar', async (req, res) => {
  const usuario = req.body.usuario;

  try {
    // Realiza la solicitud a la API interna para obtener la ciudad del usuario
    const internalApiResponse = await axios.get(`http://localhost:3000/clientes/${usuario}`);
    const cliente = internalApiResponse.data;

    // Obtiene la ciudad del usuario
    const ciudad = cliente.Ciudad;

    // Realiza la solicitud a la API de Geocode.xyz utilizando la ciudad como dirección
    const geocodeResponse = await axios.get(`https://geocode.xyz/${ciudad}?auth=${authCode}&json=1`);

    const geocodeData = geocodeResponse.data;

    // Envía los datos de Geocode a la plantilla HTML
    res.send(`
      <html>
        <head>
          <title>Resultados de Geocode</title>
        </head>
        <body>
          <h1>Resultados de Geocode para ${usuario}</h1>
          <p>Latitud: ${geocodeData.latt}</p>
          <p>Longitud: ${geocodeData.longt}</p>
          <p>Ciudad: ${cliente.Ciudad}</p>
          <!-- Puedes agregar más detalles según la estructura de la respuesta de Geocode -->
        </body>
      </html>
    `);

    const datosRegistro = {
        usuario: cliente.Usuario,
        ciudad: cliente.Ciudad,
        latitud: geocodeData.latt,
        longitud: geocodeData.longt
      };
    
    axios.post('http://localhost:3000/registroConsulta', datosRegistro)
      .then(response => {
        console.log('Registro insertado correctamente:', response.data);
      })
      .catch(error => {
        console.error('Error al intentar insertar el registro:', error.message);
      });
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).send(`Error: ${error.response.statusText}`);
    } else {
      res.status(500).send('Error interno del servidor');
    }
  }
});



// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor web en ejecución en http://localhost:${port}`);
});
