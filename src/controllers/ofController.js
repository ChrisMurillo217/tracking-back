const jwt = require( 'jsonwebtoken' );
const { Request } = require( 'tedious' );
const { Connection } = require( 'tedious' );

const config = require( '../../dbConfig' );

// Controlador para obtener los pedidos con OF
exports.getPedidosConOFs = ( req, res ) => {
    const connection = new Connection( config );
    connection.connect();
  
    connection.on( 'connect', function ( err ) {
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            console.log( err );
            throw err;
        }
    
        const request = new Request(
            `SELECT DISTINCT p.pedidoCliente FROM pedidoTracking p INNER JOIN ofTrackingSap o ON p.pedidoCliente = o.Pedido WHERE p.pedidoCliente = o.Pedido`,
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( err );
                    return res.status( 500 ).json( { error: 'Error al obtener pedidos con OF' } );
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
    } );
}

// ofTrackingSap
// Controlador para obtener los pedidos del SAP para los formularios
exports.getOF = ( req, res ) => {
    const pedido = req.params.pedido;

    const connection = new Connection( config );
    connection.connect();
    
    connection.on( 'connect', function( err ){
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            console.log( err );
            throw err;
        }
        const request = new Request(
            `SELECT * FROM ofTrackingSap WHERE Pedido = '${pedido}'`, 
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( err );
                    return res.status( 500 ).json( { error: 'Error al obtener ordenes de fabricación' } );
                } else {
                    connection.close();
                }
            }
        );

        const ordenFabricacion = [];

        request.on( 'row', ( columns ) => {
            const OF = {};
            columns.forEach( ( column ) => {
                OF[column.metadata.colName] = column.value;
            } );
            ordenFabricacion.push( OF );
        } );
    
        request.on( 'doneInProc', () => {
            res.json( ordenFabricacion );
        } );
        
        connection.execSql( request );
    } )
}

// Controlador para obtener los códigos de items de cada OF
exports.getItemCodesByOF = ( req, res ) => {
    const of = req.params.of

    const connection = new Connection( config );
    connection.connect();
    
    connection.on( 'connect', function( err ){
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            console.log( err );
            throw err;
        }
        const request = new Request(
            `SELECT DISTINCT Item FROM ofTrackingSap WHERE OF = '${of}'`, 
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( err );
                    return res.status( 500 ).json({ error: 'Error al obtener códigos de item' });
                } else {
                    connection.close();
                }
            }
        );
        
        const ofs = [];

        request.on( 'row', ( columns ) => {
            const of = {};
            columns.forEach( ( column ) => {
                of[column.metadata.colName] = column.value;
            } );
            ofs.push( of );
        } );
        
        request.on( 'doneInProc', () => {
            res.json( ofs );
        } );
        
        connection.execSql( request );
    } )
}

// Controlador para obtener los items de cada OF
exports.getDescripcionesByOF = ( req, res ) => {
    const of = req.params.of
    
    const connection = new Connection( config );
    connection.connect();
    
    connection.on( 'connect', function( err ){
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            console.log( err );
            throw err;
        }
        const request = new Request(
            `SELECT DISTINCT Descripcion FROM ofTrackingSap WHERE OF = '${of}'`, 
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( err );
                    return res.status( 500 ).json({ error: 'Error al obtener las descripciones' });
                } else {
                    connection.close();
                }
            }
        );
            
        const ofs = [];
        
        request.on( 'row', ( columns ) => {
            const of = {};
            columns.forEach( ( column ) => {
                of[column.metadata.colName] = column.value;
            } );
            ofs.push( of );
        } );
        
        request.on( 'doneInProc', () => {
            res.json( ofs );
        } );
        
        connection.execSql( request );
    } )
}
   
// ofabricacionTracking
// Controlador para guardar en la BD
exports.postOF = ( req, res ) => {
    const { Pedido, OF, StartDate, DueDate, Item, Descripcion } = req.body;

    const connection = new Connection( config );
    connection.connect();

    connection.on( 'connect', function ( err ) {
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            console.log( err );
            throw err;
        }

        const request = new Request(
            `INSERT INTO ofabricacionTracking (idPedido, ordFabricacion, itemCode, dscriptionItem, startDate, dueDate)
            VALUES ('${Pedido}', '${OF}', '${Item}', '${Descripcion}', '${StartDate}', '${DueDate}')`,
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( 'Error al registrar la orden de fabricación:', err.message );
                    res.status( 500 ).json( { error: 'Algo salió mal al registrar la orden de fabricación' } );
                } else {
                    connection.close(); // Cierra la conexión después de completar la consulta
                    res.json( { message: 'Orden de fabricación registrada exitosamente' } );
                }
            }
        );

        connection.execSql( request );
    } );
}

// Controlador para obtener las órdenes de fabricación existentes para un pedido
exports.getExistingOFsForPedido = ( req, res ) => {
    const pedido = req.params.pedido;
  
    const connection = new Connection( config );
    connection.connect();
    
    connection.on( 'connect', function ( err ) {
        if ( err ) {
            console.error( 'Error al conectar a la BD:', err.message );
            return res.status( 500 ).json( { error: 'Error al obtener órdenes de fabricación existentes' } );
        }
        
        const request = new Request(
            `SELECT DISTINCT ordFabricacion FROM ofabricacionTracking WHERE idPedido = '${pedido}'`,
            ( err, rowCount ) => {
                if ( err ) {
                    console.error( err );
                    return res.status( 500 ).json( { error: 'Error al obtener órdenes de fabricación existentes' } );
                } else {
                    connection.close();
                }
            }
            );
            
            const existingOFs = [];
    
        request.on( 'row', ( columns ) => {
            existingOFs.push( columns[0].value );
        } );
        
        request.on( 'doneInProc', () => {
            res.json( existingOFs );
        } );
    
        connection.execSql( request );
    } );
};
