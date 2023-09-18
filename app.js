const express = require( 'express' );
const cors = require( 'cors' );
const { Connection } = require( 'tedious' );

const config = require( './dbConfig' );

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: 'http://localhost:4200', // Reemplaza con la URL de tu aplicación Angular en desarrollo
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
};

app.use( cors( corsOptions ) ); // Habilita CORS para permitir solicitudes desde otros dominios
app.use( express.json() ); // Habilita el análisis de JSON en las solicitudes entrantes
app.use( express.urlencoded( { extended: false } ) ); // Habilita el análisis de URL codificadas en las solicitudes entrantes

// Importa las rutas
const routes = require( './src/routes' );

// Configuración de la BD
const connection = new Connection( config );
connection.connect(); // Establece la conexión con la BD

app.use( ( err, req, res, next ) => {
    console.error( err.stack );
    res.status( 500 ).json({ error: 'Something went wrong!' });
});
  

connection.on( 'connect', function ( err ) {
    if ( err ) {
        console.error( 'Error al conectar a la BD:', err.message );
        console.log( err );
        throw err;
    }

    app.use( '/api', routes ); // Agrega las rutas a la aplicación Express

    app.listen( port, console.log( `Listening on port ${port}` ) );
});