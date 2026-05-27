
const cds = require('@sap/cds')
const LOG = cds.log('asn')
const LOGUploadASN = cds.log('UploadASN')
const LOGUploadAdjustment = cds.log('UploadAdjustment')
const LOGUploadOrdenExpedicion = cds.log('UploadOrdenExpedicion')
const LOGUploadConfirmacionGuia = cds.log('UploadConfirmacionGuia')
const LOGUploadHoldDetail = cds.log('UploadHoldDetail')

module.exports = cds.service.impl(function () {


  this.on('UploadASN', async (req) => {
    try {

      const p = req.data
      if (!p) req.reject(400, 'json is required')

      // Errores fatales (no se puede procesar nada)
      if (!p.receiptkey) req.reject(400, 'receiptkey is required')
      if (!Array.isArray(p.details)) req.reject(400, 'details must be an array')

      const errors = []
      const results = []

      //Quita los nulls
      p.adddate = !p.adddate ? '' : p.adddate;
      p.susr1 = !p.susr1 ? '' : p.susr1;
      p.details = p.details.map(item => {
        // 1. Reemplazar null por ''
        Object.keys(item).forEach(key => {
          if (item[key] === null || item[key] === undefined) {
            item[key] = '';
          }
        });
        return item;
      });

      // 🔹 Construcción del nuevo JSON
      const transformedPayload = {
        Receiptkey: !p.receiptkey ? '' : p.receiptkey,
        //Adddate: p.adddate.replace(/-/g, ""),
        Adddate: !p.adddate ? '' : p.adddate.replace(/[-T:.Z]/g, '').substring(0, 8),
        Susr1: !p.susr1 ? '' : p.susr1,
        Return: [{
          "Id": "",
          "Number": "",
          "Type": "",
          "Message": ""
        }],
        Detail: p.details.map(d => ({
          Receiptkey: !p.receiptkey ? '' : p.receiptkey,
          Sku: !d.sku ? '' : d.sku,
          Storekey: !d.storerkey ? '' : d.storerkey,
          Qtyexpected: !d.qtyexpected ? '' : d.qtyexpected,
          Packuom3: !d.packuom3 ? '' : d.packuom3,
          Podocument: !d.purchaseorderdocument ? '' : d.purchaseorderdocument,
          Poline: !d.purchaseorderline ? '' : d.purchaseorderline,
          Qtyreceived: d.qtyreceived,
          //Tolot:  d.tolot,
          Tolot: d.lottable09,
          Expirydate: d.fecha_de_vencimiento.replace(/[-T:.Z]/g, '').substring(0, 8)
        }))
      }



      // SAP BPA DESTINATION

      const bpa_destination = await cds.connect.to("bpa_destination");
      //obtener los wf definitions y filtrar el que nos interese
      let oResultWFDefinitions = await bpa_destination.tx(req).get('/workflow/rest/v1/workflow-definitions');
      LOGUploadASN.info('SAP BPA CONSULTA WF DEFINITION', oResultWFDefinitions)
      let aWfDefinitionId = oResultWFDefinitions.filter(item => {
        return item.name == "Upload ASN"
      });



      /* var wfinstancesId = oResult.id; */
      // 🔹 Log para validar
      LOGUploadASN.info('SAP BPA TRANSFORMED JSON: ', transformedPayload)
      var ZFI_RANSA_SRV = await cds.connect.to('ZFI_RANSA_SRV');
      const headers = { "Accept": 'application/json', "Content-Type": 'application/json' };
      cds.env.features.fetch_csrf = true;
      var responseAsnHeader = await ZFI_RANSA_SRV.send('POST', "AsnHeaderSet", transformedPayload, headers);
      cds.env.features.fetch_csrf = false;
      // 🔹 Respuesta odata
      LOGUploadASN.info('Respuesta ODATA:', responseAsnHeader);
      let status = 'ok'
      if (responseAsnHeader.Return !== null) {
        responseAsnHeader.Return.forEach((d, index) => {
          if (d.Type === "E") {
            status = "error";
          }
          results.push({
            id: d.Id,
            number: d.Number,
            type: d.Type,
            message: d.Message
          })
        })
      } else {
        status = "error";
      }

      LOGUploadASN.info('SAP BPA CREACION INSTANCIA INICIO', aWfDefinitionId)
      let payloadBPA = {
        definitionId: aWfDefinitionId[0].id,
        context: {
          p,
          response: results
        }
      };
      LOGUploadASN.info('SAP BPA CREACION INSTANCIA INICIO', payloadBPA)
      let oResult = await bpa_destination.tx(req).post('/workflow/rest/v1/workflow-instances', payloadBPA);

      LOGUploadASN.info('SAP BPA CREACION INSTANCIA RESPUESTA', oResult)
      if (!oResult.id) {
        throw new Error('Failed to trigger the process.');
      }


      return {
        receiptkey: p.receiptkey,
        status,
        results
      }


    } catch (error) {
      const sapTransaction =
        error?.reason?.response?.body?.error?.innererror?.Error_Resolution?.SAP_Transaction
      error.message = sapTransaction || error.message;
      LOGUploadASN.error('ERROR UPLOADASN', error)
      req.reject(error)
    }
  })

  this.on('UploadAdjustment', async (req) => {
    try {

      const p = req.data
      if (!p) req.reject(400, 'json is required')

      // Errores fatales (no se puede procesar nada)
      if (!p.adjustmentkey) req.reject(400, 'adjustmentkey is required')
      //if (!p.storerkey) req.reject(400, 'storerkey is required')
      //if (!Array.isArray(p.details)) req.reject(400, 'details must be an array')

      const errors = []
      const results = []
      p.propietario = !p.propietario ? '' : p.propietario;
      p.storerkey = !p.storerkey ? '' : p.storerkey;
      p.transactionid = !p.transactionid ? '' : p.transactionid;
      p.sku = !p.sku ? '' : p.sku;
      p.qty = !p.qty ? '' : p.qty;
      p.packuom3 = !p.packuom3 ? '' : p.packuom3;
      p.lottable09 = !p.lottable09 ? '' : p.lottable09;
      // 🔹 Construcción del nuevo JSON
      const transformedPayload = {
        Adjustmentkey: p.adjustmentkey,
        Propietario: p.propietario,
        Storerkey: p.storerkey,
        Transactionid: p.transactionid,
        Sku: p.sku,
        Qty: p.qty,
        Packuom3: p.packuom3,
        Lottable09: p.lottable09,
        Return: [{
          "Id": "",
          "Number": "",
          "Type": "",
          "Message": ""
        }],
        Detail: [] /* p.details.map(d => ({
          Adjustmentkey: p.adjustmentkey,
          Sku: d.sku,
          Qty: d.qty,
          Packuom3: d.packuom3
        })) */
      }



      // SAP BPA DESTINATION

      const bpa_destination = await cds.connect.to("bpa_destination");
      //obtener los wf definitions y filtrar el que nos interese
      let oResultWFDefinitions = await bpa_destination.tx(req).get('/workflow/rest/v1/workflow-definitions');
      LOGUploadAdjustment.info('SAP BPA CONSULTA WF DEFINITION', oResultWFDefinitions)
      let aWfDefinitionId = oResultWFDefinitions.filter(item => {
        return item.name == "Upload Adjustment"
      });


      // 🔹 Log para validar
      LOGUploadAdjustment.info('SAP BPA TRANSFORMED JSON: ', transformedPayload)
      var ZFI_RANSA_SRV = await cds.connect.to('ZFI_RANSA_SRV');
      const headers = { "Accept": 'application/json', "Content-Type": 'application/json' };
      cds.env.features.fetch_csrf = true;
      var responseAdjustHeader = await ZFI_RANSA_SRV.send('POST', "AdjustHeaderSet", transformedPayload, headers);
      cds.env.features.fetch_csrf = false;
      // 🔹 Respuesta odata
      LOGUploadAdjustment.info('Respuesta ODATA:', responseAdjustHeader);
      let status = 'ok'
      if (responseAdjustHeader.Return !== null) {
        responseAdjustHeader.Return.forEach((d, index) => {
          if (d.Type === "E") {
            status = "error";
          }
          results.push({
            id: d.Id,
            number: d.Number,
            type: d.Type,
            message: d.Message
          })
        })
      } else {
        status = "error";
      }

      LOGUploadAdjustment.info('SAP BPA CREACION INSTANCIA INICIO', aWfDefinitionId)
      let payloadBPA = {
        definitionId: aWfDefinitionId[0].id,
        context: {
          p,
          response: results
        }
      };
      LOGUploadAdjustment.info('SAP BPA CREACION INSTANCIA INICIO', payloadBPA)
      let oResult = await bpa_destination.tx(req).post('/workflow/rest/v1/workflow-instances', payloadBPA);

      LOGUploadAdjustment.info('SAP BPA CREACION INSTANCIA RESPUESTA', oResult)
      if (!oResult.id) {
        throw new Error('Failed to trigger the process.');
      }

      return {
        adjustmentkey: p.adjustmentkey,
        status,
        results
      }


    } catch (error) {
      const sapTransaction =
        error?.reason?.response?.body?.error?.innererror?.Error_Resolution?.SAP_Transaction
      error.message = sapTransaction || error.message;
      LOGUploadAdjustment.error('ERROR UPLOADADJUSTMENT', error)
      req.reject(error)
    }
  })

  this.on('UploadOrdenExpedicion', async (req) => {
    try {

      const p = req.data
      if (!p) req.reject(400, 'json is required')

      // Errores fatales (no se puede procesar nada)
      if (!p.externorderkey) req.reject(400, 'externorderkey is required')
      if (!Array.isArray(p.details)) req.reject(400, 'details must be an array')

      const errors = []
      const results = []
      //Quita los nulls
      p.referencedocument = !p.referencedocument ? '' : p.referencedocument;
      p.externorderkey = !p.externorderkey ? '' : p.externorderkey;
      p.actualshipdate = !p.actualshipdate ? '' : p.actualshipdate.replace(/[-T:.Z]/g, '').substring(0, 8);
      p.details = p.details.map(item => {
        // 1. Reemplazar null por ''
        Object.keys(item).forEach(key => {
          if (item[key] === null || item[key] === undefined) {
            item[key] = '';
          }
        });
        return item;
      });

      // 🔹 Construcción del nuevo JSON
      const transformedPayload = {
        Referencedoc: p.referencedocument,
        Externorderkey: p.externorderkey,
        Actualshipdate: p.actualshipdate,
        Return: [{
          "Id": "",
          "Number": "",
          "Type": "",
          "Message": ""
        }],
        Detail: p.details.map(d => ({
          //Referencedoc: p.referencedocument,
          Externorderkey: p.externorderkey,
          Sku: d.sku,
          FullfillQty: d.fulfillqty,
          Qty: d.qty,
          Packuom3: d.packuom3,
          Lote: d.lottable09,
          Externlinenro: d.externlineno
        }))
      }

      // SAP BPA DESTINATION
      const bpa_destination = await cds.connect.to("bpa_destination");
      //obtener los wf definitions y filtrar el que nos interese
      let oResultWFDefinitions = await bpa_destination.tx(req).get('/workflow/rest/v1/workflow-definitions');
      LOGUploadOrdenExpedicion.info('SAP BPA CONSULTA WF DEFINITION', oResultWFDefinitions)
      let aWfDefinitionId = oResultWFDefinitions.filter(item => {
        return item.name == "Upload Order Expedition"
      });


      // 🔹 Log para validar
      LOGUploadOrdenExpedicion.info('SAP BPA TRANSFORMED JSON: ', transformedPayload)
      var ZFI_RANSA_SRV = await cds.connect.to('ZFI_RANSA_SRV');
      const headers = { "Accept": 'application/json', "Content-Type": 'application/json' };
      cds.env.features.fetch_csrf = true;
      var responseExpeditionHeader = await ZFI_RANSA_SRV.send('POST', "ExpeditionHeaderSet", transformedPayload, headers);
      cds.env.features.fetch_csrf = false;
      // 🔹 Respuesta odata
      LOGUploadOrdenExpedicion.info('Respuesta ODATA:', responseExpeditionHeader);
      let status = 'ok'
      if (responseExpeditionHeader.Return !== null) {
        responseExpeditionHeader.Return.forEach((d, index) => {
          if (d.Type === "E") {
            status = "error";
          }
          results.push({
            id: d.Id,
            number: d.Number,
            type: d.Type,
            message: d.Message
          })
        })
      } else {
        status = "error";
      }

      LOGUploadOrdenExpedicion.info('SAP BPA CREACION INSTANCIA INICIO', aWfDefinitionId)
      let payloadBPA = {
        definitionId: aWfDefinitionId[0].id,
        context: {
          p,
          response: results
        }
      };
      LOGUploadOrdenExpedicion.info('SAP BPA CREACION INSTANCIA INICIO', payloadBPA)
      let oResult = await bpa_destination.tx(req).post('/workflow/rest/v1/workflow-instances', payloadBPA);

      LOGUploadOrdenExpedicion.info('SAP BPA CREACION INSTANCIA RESPUESTA', oResult)
      if (!oResult.id) {
        throw new Error('Failed to trigger the process.');
      }

      return {
        referencedocument: p.referencedocument,
        status,
        results
      }


    } catch (error) {
      /* if(error.statusCode === 502){
        error.statusCode = 500;
      } */
      
      const sapTransaction =
        error?.reason?.response?.body?.error?.innererror?.Error_Resolution?.SAP_Transaction
      error.message = sapTransaction || error.message;
      LOGUploadOrdenExpedicion.error('ERROR UPLOADORDENEXPEDICION', error)
      req.error(error.statusCode, error.message);
      //req.reject(error)
    }
  })

  this.on('UploadConfirmacionGuia', async (req) => {
    try {

      const p = req.data
      if (!p) req.reject(400, 'json is required')

      // Errores fatales (no se puede procesar nada)
      if (!p.guia) req.reject(400, 'guia is required')
      if (!Array.isArray(p.pedidos)) req.reject(400, 'pedidos must be an array')

      const errors = []
      const results = []
      //Quita los nulls
      p.guia = !p.guia ? '' : p.guia;
      /* p.details = p.details.map(item => {
        // 1. Reemplazar null por ''
        Object.keys(item).forEach(key => {
          if (item[key] === null || item[key] === undefined) {
            item[key] = '';
          }
        });
        return item;
      }); */

      // 🔹 Construcción del nuevo JSON
      const transformedPayload = {
        Guia: p.guia,
        Return: [{
          "Id": "",
          "Number": "",
          "Type": "",
          "Message": ""
        }],
        Detail: p.pedidos.map(d => ({
          Guia: p.guia,
          Pedido: d
        }))
      }

      // SAP BPA DESTINATION
      const bpa_destination = await cds.connect.to("bpa_destination");
      //obtener los wf definitions y filtrar el que nos interese
      let oResultWFDefinitions = await bpa_destination.tx(req).get('/workflow/rest/v1/workflow-definitions');
      LOGUploadConfirmacionGuia.info('SAP BPA CONSULTA WF DEFINITION', oResultWFDefinitions)
      let aWfDefinitionId = oResultWFDefinitions.filter(item => {
        return item.name == "Upload Confirmacion Guia"
      });


      // 🔹 Log para validar
      LOGUploadConfirmacionGuia.info('SAP BPA TRANSFORMED JSON: ', transformedPayload)
      var ZFI_RANSA_SRV = await cds.connect.to('ZFI_RANSA_SRV');
      const headers = { "Accept": 'application/json', "Content-Type": 'application/json' };
      cds.env.features.fetch_csrf = true;
      var responseConfirmationRef = await ZFI_RANSA_SRV.send('POST', "ConfirmationRefSet", transformedPayload, headers);
      cds.env.features.fetch_csrf = false;
      // 🔹 Respuesta odata
      LOGUploadConfirmacionGuia.info('Respuesta ODATA:', responseConfirmationRef);
      let status = 'ok'
      if (responseConfirmationRef.Return !== null) {
        responseConfirmationRef.Return.forEach((d, index) => {
          if (d.Type === "E") {
            status = "error";
          }
          results.push({
            id: d.Id,
            number: d.Number,
            type: d.Type,
            message: d.Message
          })
        })
      } else {
        status = "error";
      }

      LOGUploadConfirmacionGuia.info('SAP BPA CREACION INSTANCIA INICIO', aWfDefinitionId)
      let payloadBPA = {
        definitionId: aWfDefinitionId[0].id,
        context: {
          p,
          response: results
        }
      };
      LOGUploadConfirmacionGuia.info('SAP BPA CREACION INSTANCIA INICIO', payloadBPA)
      let oResult = await bpa_destination.tx(req).post('/workflow/rest/v1/workflow-instances', payloadBPA);

      LOGUploadConfirmacionGuia.info('SAP BPA CREACION INSTANCIA RESPUESTA', oResult)
      if (!oResult.id) {
        throw new Error('Failed to trigger the process.');
      }

      return {
        guia: p.guia,
        status,
        results
      }


    } catch (error) {
      const sapTransaction =
        error?.reason?.response?.body?.error?.innererror?.Error_Resolution?.SAP_Transaction
      error.message = sapTransaction || error.message;
      LOGUploadConfirmacionGuia.error('ERROR UPLOADCONFIRMACIONGUIA', error)
      req.reject(error)
    }
  })

this.on('UploadHoldDetail', async (req) => {
    try {

      const p = req.data
      if (!p) req.reject(400, 'json is required')

      // Errores fatales (no se puede procesar nada)
      if (!p.sku) req.reject(400, 'sku is required')
      if (!p.storerkey) req.reject(400, 'storerkey is required')    

      const errors = []
      const results = []
      //Quita los nulls
      p.sku = !p.sku ? '' : p.sku;
      p.storerkey = !p.storerkey ? '' : p.storerkey;
      p.whseid = !p.whseid ? '' : p.whseid;
      p.lottable02 = !p.lottable02 ? '' : p.lottable02;
      p.lottable05 = !p.lottable05 ? '' : p.lottable05;
      p.lottable06 = !p.lottable06 ? '' : p.lottable06;
      p.lottable07 = !p.lottable07 ? '' : p.lottable07;
      p.lottable08 = !p.lottable08 ? '' : p.lottable08;
      p.lottable09 = !p.lottable09 ? '' : p.lottable09;
      p.pack_packuom3 = !p.pack_packuom3 ? '' : p.pack_packuom3;
      p.hold_code = !p.hold_code ? '' : p.hold_code;
      p.hold_qty = !p.hold_qty ? '' : p.hold_qty;
      p.hold_adddate = !p.hold_code ? '' : p.hold_adddate.replace(/[-T:.Z]/g, '').substring(0, 8);
      p.hold_addwho = !p.hold_addwho ? '' : p.hold_addwho;
      p.description2 = !p.description2 ? '' : p.description2;
      p.description = !p.description ? '' : p.description;

      // 🔹 Construcción del nuevo JSON
      const transformedPayload = {
        Sku:p.sku ,
        Storerkey:p.storerkey ,
        Whseid:p.whseid,
        Lottable02:p.lottable02,
        Lottable05:p.lottable05,
        Lottable06:p.lottable06,
        Lottable07:p.lottable07,
        Lottable08:p.lottable08,
        Lottable09:p.lottable09,
        Packuom3:p.pack_packuom3,
        HoldCode:p.hold_code,
        HoldQty:p.hold_qty,
        HoldAdddate:p.hold_adddate,
        HoldAddwho:p.hold_addwho,
        Description2:p.description2,
        Description:p.description,
        Return: [{
          "Id": "",
          "Number": "",
          "Type": "",
          "Message": ""
        }]
      }

      // SAP BPA DESTINATION
      const bpa_destination = await cds.connect.to("bpa_destination");
      //obtener los wf definitions y filtrar el que nos interese
      let oResultWFDefinitions = await bpa_destination.tx(req).get('/workflow/rest/v1/workflow-definitions');
      LOGUploadHoldDetail.info('SAP BPA CONSULTA WF DEFINITION', oResultWFDefinitions)
      let aWfDefinitionId = oResultWFDefinitions.filter(item => {
        return item.name == "Upload Hold"
      });


      // 🔹 Log para validar
      LOGUploadHoldDetail.info('SAP BPA TRANSFORMED JSON: ', transformedPayload)
      var ZFI_RANSA_SRV = await cds.connect.to('ZFI_RANSA_SRV');
      const headers = { "Accept": 'application/json', "Content-Type": 'application/json' };
      cds.env.features.fetch_csrf = true;
      var responseHold = await ZFI_RANSA_SRV.send('POST', "HoldSet", transformedPayload, headers);
      cds.env.features.fetch_csrf = false;
      // 🔹 Respuesta odata
      LOGUploadHoldDetail.info('Respuesta ODATA:', responseHold);
      let status = 'ok'
      if (responseHold.Return !== null) {
        responseHold.Return.forEach((d, index) => {
          if (d.Type === "E") {
            status = "error";
          }
          results.push({
            id: d.Id,
            number: d.Number,
            type: d.Type,
            message: d.Message
          })
        })
      } else {
        status = "error";
      }

      LOGUploadHoldDetail.info('SAP BPA CREACION INSTANCIA INICIO', aWfDefinitionId)
      let payloadBPA = {
        definitionId: aWfDefinitionId[0].id,
        context: {
          p,
          response: results
        }
      };
      LOGUploadHoldDetail.info('SAP BPA CREACION INSTANCIA INICIO', payloadBPA)
      let oResult = await bpa_destination.tx(req).post('/workflow/rest/v1/workflow-instances', payloadBPA);

      LOGUploadHoldDetail.info('SAP BPA CREACION INSTANCIA RESPUESTA', oResult)
      if (!oResult.id) {
        throw new Error('Failed to trigger the process.');
      }

      return {
        sku: p.sku,
        status,
        results
      }


    } catch (error) {
      const sapTransaction =
        error?.reason?.response?.body?.error?.innererror?.Error_Resolution?.SAP_Transaction
      error.message = sapTransaction || error.message;
      LOGUploadHoldDetail.error('ERROR UPLOADHOLDDETAIL', error)
      req.reject(error)
    }
  })
})