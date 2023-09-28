const express = require( 'express' );
const router = express.Router();

// Importa los controladores
// const authenticationController = require( '../controllers/authenticationControllers' );
const pedidoController = require( '../controllers/pedidoController' );
const ofController = require( '../controllers/ofController' );
const guiaController = require( '../controllers/guiaController' );
const protectedController = require( '../controllers/protectedController' );

// Importa los middlewares
const verifyToken = require( '../middlewares/verifyToken' );

// Ruta principal
router.get( '/', ( req, res ) => {
    res.send( 'API is running' );
});

// Ruta para visualizar la información de los pedidos
router.get( '/pedidos', pedidoController.getPedidos );

// Ruta para registrar nuevos pedidos
router.post ( '/pedidos', pedidoController.postPedidos );

// Ruta para obtener los ItemCode por DocNum
router.get( '/pedidos/itemcodes/:docNum', pedidoController.getItemCodesByDocNum );

// Ruta para obtener las descripciones por DocNum
router.get( '/pedidos/descripciones/:docNum', pedidoController.getDescripcionesByDocNum );

// Ruta para obtener los Quantity por ItemCode
router.get( '/pedidos/cantidades/:itemCode', pedidoController.getCantidadesByItemCode );


// Ruta para visualizar el pedido seleccionado
router.get( '/tracking/:pedidoCliente', pedidoController.getPedidoByDocNum );

// Ruta para visualizar los pedidos
router.get( '/trackingList', pedidoController.getPedidosList );


// Ruta para obtener pedidos que tengan una orden de fabricación
router.get( '/fabricacion/with-of', ofController.getPedidosConOFs );

// Ruta para visualizar la información de los pedidos
router.get( '/fabricacion/ofs/:pedido', ofController.getOF );

// Ruta para visualizar la información de los códigos de item
router.get( '/fabricacion/ofs/:OF', ofController.getItemCodesByOF );

// Ruta para visualizar la información de los items
router.get( '/fabricacion/ofs/:OF', ofController.getDescripcionesByOF );

// Ruta para registrar nuevos pedidos
router.post( '/fabricacion', ofController.postOF );

// Ruta para obtener órdenes de fabricación existentes para un pedido
router.get( '/fabricacion/existing-ofs/:pedido', ofController.getExistingOFsForPedido );


// Ruta para visualizar la información de las guias
router.get( '/guia/ItemCode=:item&Comments=:pedido', guiaController.getGuia );

// Ruta para registrar nuevas guias
router.post( '/guia', guiaController.postGuia );

module.exports = router;