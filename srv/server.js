const cds = require('@sap/cds');
const express = require('express');

cds.on('bootstrap', (app) => {
  app.use(express.json());

  app.use((req, res, next) => {
    if (
      req.path.includes('UploadASN') && 
      req.method === 'POST'
    ) {
      if (req.body) {
        // Campos permitidos a nivel raíz
        const camposRaizPermitidos = ['receiptkey', 'adddate','susr1','details'];

        // Campos permitidos dentro de cada objeto del array details
        const camposDetailsPermitidos = ['sku', 'storerkey', 'qtyexpected','packuom3','purchaseorderdocument','purchaseorderline','codigo_almacen','qtyreceived','tolot','fecha_de_vencimiento','lottable09']; // <-- pon aquí tus campos

        // 1. Limpiar campos raíz
        Object.keys(req.body).forEach(key => {
          if (!camposRaizPermitidos.includes(key)) {
            delete req.body[key];
          }
        });

        // 2. Limpiar campos dentro del array details
        if (Array.isArray(req.body.details)) {
          req.body.details = req.body.details.map(item => {
            Object.keys(item).forEach(key => {
              if (!camposDetailsPermitidos.includes(key)) {
                delete item[key];
              }
            });
            return item;
          });
        }
      }
    }
    if (
      req.path.includes('UploadAdjustment') && 
      req.method === 'POST'
    ) {
      if (req.body) {
        // Campos permitidos a nivel raíz
        const camposRaizPermitidos = ['adjustmentkey', 'propietario','storerkey','transactionid','sku', 'qty','packuom3','lottable09'];

        // Campos permitidos dentro de cada objeto del array details
        const camposDetailsPermitidos = []; // <-- pon aquí tus campos

        // 1. Limpiar campos raíz
        Object.keys(req.body).forEach(key => {
          if (!camposRaizPermitidos.includes(key)) {
            delete req.body[key];
          }
        });

        // 2. Limpiar campos dentro del array details
        /* if (Array.isArray(req.body.details)) {
          req.body.details = req.body.details.map(item => {
            Object.keys(item).forEach(key => {
              if (!camposDetailsPermitidos.includes(key)) {
                delete item[key];
              }
            });
            return item;
          });
        } */
      }
    }

    if (
      req.path.includes('UploadOrdenExpedicion') && 
      req.method === 'POST'
    ) {
      if (req.body) {
        // Campos permitidos a nivel raíz
        const camposRaizPermitidos = ['referencedocument','externorderkey', 'details'];

        // Campos permitidos dentro de cada objeto del array details
        const camposDetailsPermitidos = ['sku', 'fulfillqty', 'packuom3','lottable09','externlineno','qty']; // <-- pon aquí tus campos

        // 1. Limpiar campos raíz
        Object.keys(req.body).forEach(key => {
          if (!camposRaizPermitidos.includes(key)) {
            delete req.body[key];
          }
        });

        // 2. Limpiar campos dentro del array details
        if (Array.isArray(req.body.details)) {
          req.body.details = req.body.details.map(item => {
            Object.keys(item).forEach(key => {
              if (!camposDetailsPermitidos.includes(key)) {
                delete item[key];
              }
            });
            return item;
          });
        }
      }
    }

    if (
      req.path.includes('UploadConfirmacionGuia') && 
      req.method === 'POST'
    ) {
      if (req.body) {
        // Campos permitidos a nivel raíz
        const camposRaizPermitidos = ['guia','pedidos'];

        // Campos permitidos dentro de cada objeto del array details
        /* const camposDetailsPermitidos = ['pedidos']; // <-- pon aquí tus campos */

        // 1. Limpiar campos raíz
        Object.keys(req.body).forEach(key => {
          if (!camposRaizPermitidos.includes(key)) {
            delete req.body[key];
          }
        });

        // 2. Limpiar campos dentro del array details
        /* if (Array.isArray(req.body.details)) {
          req.body.details = req.body.details.map(item => {
            Object.keys(item).forEach(key => {
              if (!camposDetailsPermitidos.includes(key)) {
                delete item[key];
              }
            });
            return item;
          });
        } */
      }
    }

    if (
      req.path.includes('UploadHoldDetail') && 
      req.method === 'POST'
    ) {
      if (req.body) {
        // Campos permitidos a nivel raíz
        const camposRaizPermitidos = ['sku','storerkey', 'whseid', 'lottable02', 
                                      'lottable05', 'lottable06', 'lottable07', 'lottable08', 
                                      'lottable09', 'pack_packuom3', 'hold_code', 'hold_qty', 
                                      'hold_adddate','hold_addwho', 'description2', 'description'];

        // Campos permitidos dentro de cada objeto del array details
        /* const camposDetailsPermitidos = ['sku', 'fulfillqty', 'packuom3','lottable09','externlineno']; */ // <-- pon aquí tus campos

        // 1. Limpiar campos raíz
        Object.keys(req.body).forEach(key => {
          if (!camposRaizPermitidos.includes(key)) {
            delete req.body[key];
          }
        });

        // 2. Limpiar campos dentro del array details
        /* if (Array.isArray(req.body.details)) {
          req.body.details = req.body.details.map(item => {
            Object.keys(item).forEach(key => {
              if (!camposDetailsPermitidos.includes(key)) {
                delete item[key];
              }
            });
            return item;
          });
        } */
      }
    }
    next();
  });
});