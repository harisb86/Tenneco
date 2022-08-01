sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, FilterOperator, Filter, MessageToast) {
        "use strict";

        return Controller.extend("repack.repck.controller.RepackView", {
            onInit: function () {
                // var oFuncLocModel = new JSONModel;
                var oView = this.getView()
                // oView.setModel(oFuncLocModel, 'oFuncLocModel');
                var oOwnerComponent = this.getOwnerComponent();
                this.oRouter = oOwnerComponent.getRouter();
                this.sExidv = "";
                this.oRouter.getRoute("RouteScanPallet").attachPatternMatched(this._onRouteMatch, this);
                this.oGlobalBusyDialog = new sap.m.BusyDialog();
            },

            _onRouteMatch: function () {
                this.oGlobalBusyDialog.open();
                var oView = this.getView();
                // DO something
                // alert("test RouteMatch ScnPallet");
                var oComponent = this.getOwnerComponent();
                // alert(oComponent.Exdiv);
                this.sExdiv = oComponent.Exdiv;
                const newLocal = "hunumber1";
                oView.byId(newLocal).setValue(this.sExdiv);
                this.oGlobalBusyDialog.close();
            },

            _onCHangeScanPallet: function () {
                var msg = "Incorrect PSA pallet number";
                var msg1 = "Correct PSA pallet number";
                var oModel = this.getView().getModel();
                var that = this;
                var sPath = "/RepackSet";
                var sExdiv;
                var oView = this.getView();
                var nPSAPalletNum = this.getView().byId("scanpsapallet").getValue();
                var bValid = this._validatePSA(nPSAPalletNum);
                if (bValid === false) {
                    msg = "Invalid formate for PSA pallet number";
                    this.getView().byId("scanpsapallet").setValue("")
                    oView.byId("buttonrepack").setEnabled(false);
                    MessageToast.show(msg);
                }
                else {
                    //Check is HU already Exist 
                    oView.byId("buttonrepack").setEnabled(true);
                    sExdiv = this.addzero(nPSAPalletNum, 20);
                    sPath = sPath.concat("('", sExdiv, "')");

                    this.oGlobalBusyDialog.open(); //oGlobalBusyDialog.open();
                    oModel.read(sPath, {
                        success: function (oData) {
                            var aHudetails = oData.EXIDV;
                            if (!aHudetails) {
                                // Valid PSA PAllet / Lets Repack 
                                msg = "HU does not Exist, Correct PSA pallet number";
                                oView.byId("buttonrepack").setEnabled(true);
                                MessageToast.show(msg);
                            }
                            else {
                                msg = "HU Alredy Exist, Incorrect PSA pallet number";
                                oView.byId("buttonrepack").setEnabled(false);
                                MessageToast.show(msg);
                            }
                            that.oGlobalBusyDialog.close();
                        },
                        error: function (err) {
                            that.oGlobalBusyDialog.close();
                            // msg = err.message; //"Invalid HU Number";
                            // MessageToast.show(msg); 
                            msg = "Error in HU Odata , Correct PSA Pallet Number";
                            oView.byId("buttonrepack").setEnabled(true);
                            MessageToast.show(msg);
                        }
                    });


                };
            },

            _validatePSA: function (num) {
                num = num.toString();
                // var len = num.length;
                // var last2 = num.slice(-2);

                if (num.length !== 9) {
                    return false;
                } else if (num.slice(-2) !== '00') {
                    return false;
                } else {
                    return true;
                };
            },
            addzero: function (num, size) {
                num = num.toString();
                while (num.length < size) num = "0" + num;
                return num;
            },

            onrepack: function () {
                // Call repack Service with HUS numbers  
                var oModel = this.getView().getModel();
                var that = this;
                var msg;
                var sPath = "/RepackSet";
                var oView = that.getView();
                var sExdiv = this.getView().byId("hunumber1").getValue();
                var nPSAPalletNum = this.getView().byId("scanpsapallet").getValue();

                if (sExdiv && nPSAPalletNum) {
                    var notification_data = {
                        "EXIDV": sExdiv,
                        "EXIDV_NEW": nPSAPalletNum
                    };

                    this.oGlobalBusyDialog.open(); //oGlobalBusyDialog.open(); 
                    oModel.create(sPath, notification_data, {
                        success: function (oData) {
                            that.oGlobalBusyDialog.close();
                            msg = "HU Packed Successfully!";
                            MessageToast.show(msg);
                        },
                        error: function (error) {
                            that.oGlobalBusyDialog.close();
                            msg = "Error in HU Packing";
                            MessageToast.show(msg);

                            sap.m.MessageBox.error(that.getErrorText(error), {
                                title: "TitleError"
                            });
                        }
                    });
                }

            },

            getErrorText: function (oError) {
                var oErrorText = oError.responseText;
                var bundle = this.getView().getModel("i18n");
                try {
                    var errorMessageObject = JSON.parse(oErrorText);
                    var messageText = errorMessageObject.error.message.value;
                } catch (err) {
                    try {
                        switch (typeof oErrorText) {
                            case "string":
                                // XML or simple text
                                if (oErrorText.indexOf("<?xml") === 0) {
                                    var oXML = jQuery.parseXML(oErrorText);
                                    var oXMLMsg = oXML.querySelector("message");
                                    if (oXMLMsg) {
                                        messageText = oXMLMsg.textContent;
                                    }
                                } else {
                                    // Nope just return the string
                                    messageText = oErrorText;
                                }
                                break;
                            case "object":
                                // Exception
                                messageText = oErrorText.toString();
                                break;
                        }
                    } catch (err2) {
                        messageText = bundle.getProperty("unknownError");
                    }
                }
                return messageText;
            },

            onresetscr: function () {
                var oView = this.getView();
                // var oModel1 = oView.getModel("oFuncLocModel");

                var sExdiv = ""; //""                  
                oView.byId("scanpsapallet").setValue(sExdiv);
                oView.byId("buttonrepack").setVisible(false);

            },
            oncancel: function () {
                this.onresetscr();
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("TargetRepackView");
            }

        });
    });
