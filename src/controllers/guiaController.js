const jwt = require( 'jsonwebtoken' );
const { Request } = require( 'tedious' );
const { Connection } = require( 'tedious' );

const config = require( '../../dbConfig' );

// guiasTrackingSap
// Controlador para obtener las guias del SAP
exports.getGuia = ( req, res ) => {
    const item = req.params.item;
    const pedido = req.params.pedido;

    const connection = new Connection( config );
    connection.connect();

    connection.on( 'connect', function( err ) {
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            console.log( err );
            throw err;
        }

        const request = new Request(
            `SELECT * FROM guiasTrackingSap 
            WHERE CardCode = 'CN0590055328001' 
            AND ItemCode = '${item}' 
            AND Comments LIKE '%${pedido}%'`,
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( err );
                    return res.status( 500 ).json( { error: ' Error al obetener las guías'} );
                } else {
                    connection.close();
                }
            }
        );

        const guia = [];

        request.on( 'row', ( columns ) => {
            const numGuia = {};
            columns.forEach( ( column ) => {
                numGuia[column.metadata.colName] = column.value;
            } );
            guia.push( numGuia );
        } );

        request.on( 'doneInProc', () => {
            res.json( guia );
        } );

        connection.execSql( request );
    } );
} 

// guiaTracking
// Controlador para guardar en la BD
exports.postGuia = ( req, res ) => {
    const { Comments, ItemCode, DocNum, DocDate } = req.body;

    const connection = new Connection( config );
    connection.connect();

    connection.on( 'connect', function ( err ) {
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            console.log( err );
            throw err;
        }

        const request = new Request(
            `INSERT INTO guiaTracking ( idPedido, ItemCode, DocNum, DocDate )
            VALUES ( '${Comments}', '${ItemCode}', '${DocNum}', '${DocDate}' )`,
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( 'Error al registrar la guia:', err.message );
                    res.status( 500 ).json( { error: 'Algo salió mal al registrar la guia' } );
                } else {
                    connection.close();
                    res.json( { message: 'Guia registrada exitosamente' } );
                }
            }
        );

        connection.execSql( request );
    } );
}