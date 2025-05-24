import express from "express";
import { BigQuery } from "@google-cloud/bigquery";
import { Storage } from "@google-cloud/storage";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
//import path from "path";

// Obtén el archivo de ambiente desde el argumento CLI o usa `.env` como predeterminado
const envFile = process.argv[2] || ".env";

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`Archivo de configuración cargado: ${envFile}`);
} else {
  console.error(`No se encontró el archivo de configuración: ${envFile}`);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 9090;

app.use(cors());

// Serve React app
/*app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});
*/

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



/* 
----------------------------- FILTRADO POR FECHA O RANGO DE FECHA --------------------------------
--------------------------------------------------------------------------------------------------
TESTING:
http://localhost:9090/analytics_app_audios/getFechaORRangoFecha?fecha=2024-10-28&inicioFecha=&finalFecha=
http://localhost:9090/analytics_app_audios/getFechaORRangoFecha?fecha=&inicioFecha=2024-10-27&finalFecha=2024-10-28
 

*/
app.get("/analytics_app_audios/getFechaORRangoFecha", async (req, res) => {
  const { fecha, inicioFecha, finalFecha } = req.query;
  const bigqueryClient = new BigQuery();

  let query = `
  SELECT * FROM \`datalake-gasco.parametric_merlin.index_audios\`
  WHERE (Fecha = @fecha)
  OR (Fecha BETWEEN @inicioFecha AND @finalFecha)
  OR (@fecha IS NULL AND (@inicioFecha IS NULL OR @finalFecha IS NULL))
  ORDER BY Fecha ASC, Hora ASC
`;

  const options = {
    query: query,
    params: {
      fecha: fecha || null,
      inicioFecha: inicioFecha || null,
      finalFecha: finalFecha || null,
    },
    types: {
      fecha: "STRING",
      inicioFecha: "STRING",
      finalFecha: "STRING",
    },
  };

  try {
    const [rows] = await bigqueryClient.query(options);
    res.json(rows);
  } catch (error) {
    console.error("Error executing query:", error.message);
    res.status(500).send(error.message);
  }
});

/* 
----------------------------- FILTRADO POR FECHA Y RANGO DE HORAS --------------------------------
--------------------------------------------------------------------------------------------------
TESTING:
http://localhost:9090/analytics_app_audios/getFechaANDRangoHora?fecha=2024-10-27&iniciohora=15:29&finalHora=16:00
 
*/
app.get("/analytics_app_audios/getFechaANDRangoHora", async (req, res) => {
  const { fecha, iniciohora, finalHora } = req.query;
  const bigqueryClient = new BigQuery();

  let query = `
  SELECT * FROM \`datalake-gasco.parametric_merlin.index_audios\`
  WHERE 
    Fecha = @fecha
  AND 
    Hora BETWEEN @iniciohora AND @finalHora
  ORDER BY Fecha ASC, Hora ASC
`;

  const options = {
    query: query,
    params: {
      fecha: fecha || null,
      iniciohora: iniciohora || null,
      finalHora: finalHora || null,
    },
    types: {
      fecha: "STRING",
      iniciohora: "STRING",
      finalHora: "STRING",
    },
  };

  try {
    const [rows] = await bigqueryClient.query(options);
    res.json(rows);
  } catch (error) {
    console.error("Error executing query:", error.message);
    res.status(500).send(error.message);
  }
});

/* 
----------------------------- FILTRADO POR FECHA O RANGO DE FECHAS Y TELEFONO --------------------------------
--------------------------------------------------------------------------------------------------------------
TESTING:
http://localhost:9090/analytics_app_audios/getFechaORRangoFechaANDTelefono?fecha=2024-11-11&inicioFecha=&finalFecha=&telefono=985756527
http://localhost:9090/analytics_app_audios/getFechaORRangoFechaANDTelefono?fecha=&inicioFecha=2024-11-01&finalFecha=2024-11-30&telefono=452517984

*/
app.get(
  "/analytics_app_audios/getFechaORRangoFechaANDTelefono",
  async (req, res) => {
    const { fecha, inicioFecha, finalFecha, telefono } = req.query;
    const bigqueryClient = new BigQuery();

    let query = `
    SELECT * FROM \`datalake-gasco.parametric_merlin.index_audios\`
    WHERE 
      (Fecha = @fecha AND Ani = @telefono)
      OR 
      (Fecha BETWEEN @inicioFecha AND @finalFecha AND Ani = @telefono)
    ORDER BY Fecha ASC, Hora ASC
  `;

    const options = {
      query: query,
      params: {
        fecha: fecha || null,
        inicioFecha: inicioFecha || null,
        finalFecha: finalFecha || null,
        telefono: telefono || null,
      },
      types: {
        fecha: "STRING",
        inicioFecha: "STRING",
        finalFecha: "STRING",
        telefono: "STRING",
      },
    };

    try {
      const [rows] = await bigqueryClient.query(options);
      res.json(rows);
    } catch (error) {
      console.error("Error executing query:", error.message);
      res.status(500).send(error.message);
    }
  }
);

/* 
-------------- FILTRADO POR (FECHA O RANGO DE FECHAS) Y (HORA O RANGO DE HORAS) Y TELEFONO) ------------------
--------------------------------------------------------------------------------------------------------------
TESTING:
http://localhost:9090/analytics_app_audios/getFechaHoraTelefono?fecha=2024-10-28&inicioFecha=&finalFecha=&hora=19:09&inicioHora=&finalHora=&telefono=974711902
http://localhost:9090/analytics_app_audios/getFechaHoraTelefono?fecha=2024-10-28&inicioFecha=&finalFecha=&hora=&inicioHora=10:05&finalHora=22:20&telefono=942679228
http://localhost:9090/analytics_app_audios/getFechaHoraTelefono?fecha=&inicioFecha=2024-10-27&finalFecha=2024-10-28&hora=18:56&inicioHora=&finalHora=&telefono=942679228
http://localhost:9090/analytics_app_audios/getFechaHoraTelefono?fecha=&inicioFecha=2024-10-27&finalFecha=2024-10-28&hora=&inicioHora=08:05&finalHora=20:10&telefono=997840357

*/

app.get("/analytics_app_audios/getFechaHoraTelefono", async (req, res) => {
  const {
    fecha,
    inicioFecha,
    finalFecha,
    hora,
    inicioHora,
    finalHora,
    telefono,
  } = req.query;
  const bigqueryClient = new BigQuery();

  let whereClauses = [];
  let params = {};

  if (fecha && hora && telefono) {
    whereClauses.push("Fecha = @fecha AND Hora = @hora AND Ani = @telefono");
    params.fecha = fecha;
    params.hora = hora;
    params.telefono = telefono;
  } else if (fecha && inicioHora && finalHora && telefono) {
    whereClauses.push(
      "Fecha = @fecha AND Hora BETWEEN @inicioHora AND @finalHora AND Ani = @telefono"
    );
    params.fecha = fecha;
    params.inicioHora = inicioHora;
    params.finalHora = finalHora;
    params.telefono = telefono;
  } else if (inicioFecha && finalFecha && hora && telefono) {
    whereClauses.push(
      "Fecha BETWEEN @inicioFecha AND @finalFecha AND Hora = @hora AND Ani = @telefono"
    );
    params.inicioFecha = inicioFecha;
    params.finalFecha = finalFecha;
    params.hora = hora;
    params.telefono = telefono;
  } else if (inicioFecha && finalFecha && inicioHora && finalHora && telefono) {
    whereClauses.push(
      "Fecha BETWEEN @inicioFecha AND @finalFecha AND Hora BETWEEN @inicioHora AND @finalHora AND Ani = @telefono"
    );
    params.inicioFecha = inicioFecha;
    params.finalFecha = finalFecha;
    params.inicioHora = inicioHora;
    params.finalHora = finalHora;
    params.telefono = telefono;
  }

  let query = `
    SELECT * FROM \`datalake-gasco.parametric_merlin.index_audios\`
  `;

  if (whereClauses.length > 0) {
    query += `WHERE ${whereClauses.join(" AND ")}`;
  }

  // Añadimos el orden por Fecha y Hora en orden descendente
  query += `
    ORDER BY Fecha ASC, Hora ASC
  `;

  const options = {
    query: query,
    params: params,
  };

  try {
    const [rows] = await bigqueryClient.query(options);
    res.json(rows);
  } catch (error) {
    console.error("Error executing query:", error.message);
    res.status(500).send(error.message);
  }
});


/*---------------------- DESCARGA DE AUDIO ARCHIVO.MP3 ------------------------*/

app.get("/analytics_app_audios/DescargarAudio", async (req, res) => {
  const { archivoRuta } = req.query;
  const storage = new Storage();
  const bucketName = process.env.BUCKET_NAME;

  try {
    const file = storage.bucket(bucketName).file(archivoRuta);
    const fileName = archivoRuta.split("/").pop(); // Extraer solo el nombre del archivo

    // Configurar la respuesta para que se descargue con el nombre original del archivo
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "audio/mpeg"); // Ajusta el tipo MIME según el formato del archivo

    // Crear un stream de lectura desde Google Cloud Storage y canalizarlo a la respuesta
    file.createReadStream()
      .on("error", (error) => {
        console.error("Error downloading file:", error.message);
        res.status(500).send(error.message);
      })
      .pipe(res);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send(error.message);
  }
});


/*--------------------------- LOGIN DE USUARIOS -----------------------------*/

app.get('/analytics_app_audios/loginUsers', async (req, res) => {
  const { username, password } = req.query; // Get username and password from query parameters
  const bigqueryClient = new BigQuery();

  if (!username || !password) {
    return res.status(400).send('Username and password are required.');
  }

  // Encode the plain text password to Base64
  const encodedPassword = Buffer.from(password).toString('base64');

  //console.log('Encoded password:', encodedPassword); // Debugging statement

  const query = `
    SELECT user, password
    FROM \`datalake-gasco.parametric_merlin.users\`
    WHERE user = @username AND password = @encodedPassword
  `;

  const options = {
    query: query,
    params: {
      username: decodeURIComponent(username),
      encodedPassword: encodedPassword,
    },
    types: {
      username: 'STRING',
      encodedPassword: 'STRING',
    },
  };

  try {
    const [rows] = await bigqueryClient.query(options);
    //console.log('Query result:', rows); // Debugging statement

    if (rows.length === 0) {
      res.status(401).send('Invalid username or password.');
    } else {
      res.json({ user: rows[0].user }); // Return the user details
    }
  } catch (error) {
    console.error('Error executing query:', error.message);
    res.status(500).send(error.message);
  }
});

/*---------------------------------------------------------------------------
 TEST DE CONECCION
---------------------------------------------------------------------------*/

app.get("/analytics_app_audios/testConnection", async (req, res) => {
  const bigqueryClient = new BigQuery();
  const query = "SELECT 1";
  try {
    await bigqueryClient.query(query);
    res.send("Connection successful");
  } catch (error) {
    res.status(500).send("Connection failed: " + error.message);
  }
});

app.get("/analytics_app_audios/getBigQueryData2", async (req, res) => {
  const bigqueryClient = new BigQuery();
  const query = `
    SELECT * 
    FROM \`datalake-gasco.parametric_merlin.users\`
  `;

  try {
    const [rows] = await bigqueryClient.query({ query });
    res.json(rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});