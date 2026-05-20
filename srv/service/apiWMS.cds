service ApiWMS @(path: '/api/wms') {

  /**
   * UPLOAD ASN
   */
  // Tipos del payload (Header + Details[])
  type ASNDetailPayload {
    sku                   : String(50);
    storerkey             : String(15);
    qtyexpected           : String(30);
    packuom3              : String(10);
    purchaseorderdocument : String(50);
    purchaseorderline     : String(50);
    codigo_almacen        : String(50);
    qtyreceived           : Decimal(22, 5);
    tolot                 : String(10);
    fecha_de_vencimiento  : String(50);
    lottable09            : String(50);
  }

  // Tipo header (según tu JSON)
  type ASNHeaderPayload {
    receiptkey : String(30);
    adddate    : String(50); //Timestamp;
    susr1      : String(100); //Timestamp;
    details    : array of ASNDetailPayload;
  }

  type ItemError {
    index        : Integer; // posición en details[]
    externlineno : String(20);
    sku          : String(50);
    field        : String(80); // qué campo falló (opcional)
    code         : String(40); // VALIDATION_ERROR / UPSTREAM_ERROR / etc.
    message      : String(255);
  }

  type ItemResult {
    id      : String(20);
    number  : String(3);
    type    : String(1);
    message : String(255);
  }

  type UploadResult {
    receiptkey : String(30);
    status     : String(20); // OK / PARTIAL / ERROR
    //totalItems  : Integer;
    //successItems: Integer;
    //failedItems : Integer;
    //errors      : array of ItemError;
    results    : array of ItemResult;
  }

  /**
   * UPLOAD ADJUSTEMENT
   */
  // Tipos del payload (Header + Details[])
  type AdjustDetailPayload {
    sku      : String(50);
    qty      : Decimal(22, 5);
    packuom3 : String(10);
  }

  // Tipo header (según tu JSON)
  type AdjustHeaderPayload {
    adjustmentkey : String(30);
    propietario   : String(15);
    storerkey     : String(15);
    transactionid : String(4);
    lottable09    : String(50);
    details       : array of AdjustDetailPayload;
  }

  type AdjustResult {
    adjustmentkey : String(30);
    status        : String(20);
    results       : array of ItemResult;
  }

  /**
   * UPLOAD UploadOrdenExpedición
   */
  // Tipos del payload (Header + Details[])
  type ExpeditionDetailPayload {
    sku          : String(50);
    fulfillqty   : Decimal(22, 5);
    qty: Decimal(22, 5);
    packuom3     : String(10);
    lottable09   : String(50);
    externlineno : String(30);
  }

  // Tipo header (según tu JSON)
  type ExpeditionHeaderPayload {
    referencedocument : String(65);
    externorderkey    : String(32);
    details           : array of ExpeditionDetailPayload;
  }

  type ExpeditionResult {
    externorderkey : String(32);
    status         : String(20);
    results        : array of ItemResult;
  }

  /**
   * UPLOAD UploadConfirmacionGuia
   */
  /* type ConfirmacionGuiaDetailPayload {
    sku                           : String(50);
  }
 */
  // Tipo header (según tu JSON)
  type ConfirmacionGuiaHeaderPayload {
    guia    : String(20);
    pedidos : array of String(100);
  }

  type ConfirmacionGuiaResult {
    guia    : String(100);
    status  : String(20);
    results : array of ItemResult;
  }

  /**
   * UPLOAD UploadHoldDetail
   */
  /* type ConfirmacionGuiaDetailPayload {
    sku                           : String(50);
  }
 */
  // Tipo header (según tu JSON)
  type UploadHoldDetailHeaderPayload {
    sku           : String(50);
    storerkey     : String(15);
    whseid        : String(30);
    lottable02    : String(50);
    lottable05    : String(50);
    lottable06    : String(50);
    lottable07    : String(50);
    lottable08    : String(50);
    lottable09    : String(50);
    pack_packuom3 : String(10);
    hold_code     : String(20);
    hold_qty      : Decimal(22, 5);
    hold_adddate  : String(50);
    hold_addwho   : String(256);
    description2  : String(256);
  }

  type UploadHoldDetailResult {
    sku    : String(50);
    status  : String(20);
    results : array of ItemResult;
  }


  //# ------------------------------------------------------------
  //#   Action
  //# ------------------------------------------------------------
  //confirmacionRecepcionMercancia
  action UploadASN(receiptkey: ASNHeaderPayload:receiptkey,
                   adddate: ASNHeaderPayload:adddate,
                   susr1: ASNHeaderPayload:susr1,
                   details: ASNHeaderPayload:details)                           returns UploadResult;

  //confirmacionSalidaAdjunto
  action UploadAdjustment(adjustmentkey: AdjustHeaderPayload:adjustmentkey,
                          propietario: AdjustHeaderPayload:propietario,
                          storerkey: AdjustHeaderPayload:storerkey,
                          transactionid: AdjustHeaderPayload:transactionid,
                          sku: AdjustDetailPayload:sku,
                          qty: AdjustDetailPayload:qty,
                          packuom3: AdjustDetailPayload:packuom3,
                          lottable09: AdjustHeaderPayload:lottable09)           returns AdjustResult;

  //confirmacionSalidaDespacho
  action UploadOrdenExpedicion(referencedocument: ExpeditionHeaderPayload:referencedocument,
                               externorderkey: ExpeditionHeaderPayload:externorderkey,
                               details: ExpeditionHeaderPayload:details)        returns ExpeditionResult;


  action UploadConfirmacionGuia(guia: ConfirmacionGuiaHeaderPayload:guia,
                                pedidos: ConfirmacionGuiaHeaderPayload:pedidos) returns ConfirmacionGuiaResult;

  action UploadHoldDetail(sku: UploadHoldDetailHeaderPayload:sku,
                          storerkey: UploadHoldDetailHeaderPayload:storerkey,
                          whseid: UploadHoldDetailHeaderPayload:whseid,
                          lottable02: UploadHoldDetailHeaderPayload:lottable02,
                          lottable05: UploadHoldDetailHeaderPayload:lottable05,
                          lottable06: UploadHoldDetailHeaderPayload:lottable06,
                          lottable07: UploadHoldDetailHeaderPayload:lottable07,
                          lottable08: UploadHoldDetailHeaderPayload:lottable08,
                          lottable09: UploadHoldDetailHeaderPayload:lottable09,
                          pack_packuom3: UploadHoldDetailHeaderPayload:pack_packuom3,
                          hold_code: UploadHoldDetailHeaderPayload:hold_code,
                          hold_qty: UploadHoldDetailHeaderPayload:hold_qty,
                          hold_adddate: UploadHoldDetailHeaderPayload:hold_adddate,
                          hold_addwho: UploadHoldDetailHeaderPayload:hold_addwho,
                          description2: UploadHoldDetailHeaderPayload:description2
                          )       returns UploadHoldDetailResult;
}
