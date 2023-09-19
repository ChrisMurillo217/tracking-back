const jwt = require( 'jsonwebtoken' );
const { Request } = require( 'tedious' );
const { Connection } = require( 'tedious' );

const config = require( '../../dbConfig' );

// Controlador para obtener los pedidos del SAP para los formularios
exports.getPedidos = ( req, res ) => {
    const connection = new Connection( config );
    connection.connect();
    
    connection.on( 'connect', function( err ){
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            console.log( err );
            throw err;
        }
        const request = new Request(
            `SELECT * FROM pedidoTrackingSap WHERE CardCode = 'CN0590055328001'`, 
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( err );
                    return res.status( 500 ).json( { error: 'Error al obtener pedidos' } );
                } else {
                    connection.close();
                }
            }
        );

        const pedidos = [];

        request.on( 'row', ( columns ) => {
            const pedido = {};
            columns.forEach( ( column ) => {
                pedido[column.metadata.colName] = column.value;
            } );
            pedidos.push( pedido );
        } );
    
        request.on( 'doneInProc', () => {
            res.json( pedidos );
        } );
        
        connection.execSql( request );
    } )
}

// Controlador para guardar en la BD
exports.postPedidos = ( req, res ) => {
    const { CardCode, CardName, DocNum, CANCELED, ItemCode, Dscription, TaxDate, DocDueDate } = req.body;

    const connection = new Connection( config );
    connection.connect();

    connection.on( 'connect', function ( err ) {
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            console.log( err );
            throw err;
        }

        const request = new Request(
            `INSERT INTO pedidoTracking (idClienteP, nombreClienteP, pedidoCliente, estadoPedido, codigoItems, items, fechaContabilizacion, fechaEntrega)
            VALUES ( '${CardCode}', '${CardName}', '${DocNum}', '${CANCELED}', JSON_ARRAY( '${ItemCode.join("', '")}' ), JSON_ARRAY( '${Dscription.join("', '")}' ), '${TaxDate}', '${DocDueDate}' )`,
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( 'Error al registrar el pedido:', err.message );
                    res.status( 500 ).json( { error: 'Algo salió mal al registrar el pedido' } );
                } else {
                    connection.close(); // Cierra la conexión después de completar la consulta
                    res.json( { message: 'Pedido registrado exitosamente' } );
                }
            }
        );

        connection.execSql( request );
    } );
}

// Controlador para obtener los pedidos de la BD
exports.getPedidosList = ( req, res ) => {
    const connection = new Connection( config );
    connection.connect();
    
    connection.on( 'connect', function( err ){
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            console.log( err );
            throw err;
        }
        const request = new Request(
            `SELECT * FROM pedidoTracking WHERE idClienteP = 'CN0590055328001'`, 
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( err );
                    return res.status( 500 ).json( { error: 'Error al obtener pedidos' } );
                } else {
                    connection.close();
                }
            }
        );

        const pedidos = [];

        request.on( 'row', ( columns ) => {
            const pedido = {};
            columns.forEach( ( column ) => {
                pedido[column.metadata.colName] = column.value;
            });
            pedidos.push( pedido );
        } );
    
        request.on( 'doneInProc', () => {
            res.json( pedidos );
        } );
        
        connection.execSql( request );
    } )
}

// Controlador para obtener los ItemCode del SAP para los formularios
exports.getItemCodesByDocNum = ( req, res ) => {
    const docNum = req.params.docNum;
  
    const connection = new Connection( config );
    connection.connect();
  
    connection.on( 'connect', function ( err ) {
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            console.log( err );
            return res.status( 500 ).json( { error: 'Error al obtener los ItemCode' } );
        }
    
        const request = new Request(
            `SELECT ItemCode FROM pedidoTrackingSap WHERE DocNum = '${docNum}'`,
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( err );
                    return res.status( 500 ).json( { error: 'Error al obtener los ItemCode' } );
                } else {
                    connection.close();
                }
            }
        );
    
        const itemCodes = [];
    
        request.on( 'row', ( columns ) => {
            itemCodes.push( columns[0].value );
        } );
    
        request.on( 'doneInProc', () => {
            res.json( itemCodes );
        } );
    
        connection.execSql( request );
    } );
};

// Controlador para obtener los Dscription del SAP para los formularios
exports.getDescripcionesByDocNum = ( req, res ) => {
    const docNum = req.params.docNum;

    const connection = new Connection( config );
    connection.connect();

    connection.on( 'connect', function ( err ) {
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            console.log( err );
            return res.status( 500 ).json( { error: 'Error al obtener las descripciones' } );
        }

        const request = new Request(
            `SELECT Dscription FROM pedidoTrackingSap WHERE DocNum = '${docNum}'`,
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( err );
                    return res.status( 500 ).json( { error: 'Error al obtener las descripciones' } );
                } else {
                    connection.close();
                }
            }
        );

        const descripciones = [];

        request.on( 'row', ( columns ) => {
            descripciones.push( columns[0].value );
        } );

        request.on( 'doneInProc', () => {
            res.json( descripciones );
        } );

        connection.execSql( request );
    } );
};
