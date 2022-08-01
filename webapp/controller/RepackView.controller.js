sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, FilterOperator, Filter, MessageToast, UIComponent) {
        "use strict";

        return Controller.extend("repack.repck.controller.RepackView", {
            onInit: function () {

                var oOwnerComponent = this.getOwnerComponent();
                this.oRouter = oOwnerComponent.getRouter();


                var oFuncLocModel = new JSONModel;
                var oView = this.getView()
                oView.setModel(oFuncLocModel, 'oFuncLocModel');

                this.oGlobalBusyDialog = new sap.m.BusyDialog();
                this.oRouter.getRoute("RouteRepackView").attachPatternMatched(this._onRouteMatch, this);
            },

            _onRouteMatch: function () {
                this.oGlobalBusyDialog.open();
                // DO something
                // alert("test RouteMatch Repack");
                this.oGlobalBusyDialog.close();
            },

            _onCHangeHUNuber: function () {
                // alert('changed');

                var oModel = this.getView().getModel();
                var that = this;
                var msg;
                var oFuncLocModel = [];
                var aFilters = [];
                const sPath = "/RepackSet";
                var oView = that.getView();
                // var oModel1 = oView.getModel("oFuncLocModel");

                oView.byId("_IDGenTable1").setVisible(false);
                oView.byId("buttonconfirm").setEnabled(false);

                var sExdiv = oView.byId("idhunemberscan").getValue();



                //sPath = sPath.concat("('", sExdiv, "')");
                // var oGlobalBusyDialog = new sap.m.oGlobalBusyDialog();
                if (sExdiv) {
                    //Add Zeros to make it 10 char 
                    sExdiv = this.addzero(sExdiv, 20);
                    aFilters.push(new Filter("EXIDV", FilterOperator.EQ, sExdiv));
                    oView.byId("idhunemberscan").setValue(sExdiv);

                    this.oGlobalBusyDialog.open(); //oGlobalBusyDialog.open();
                    oModel.read(sPath, {
                        filters: aFilters,
                        success: function (oData) {
                            var aHudetails = oData.results;

                            if (aHudetails.length > 0) {
                                for (var i = 0; i < aHudetails.length; i++) {
                                    var items = {
                                        hunumber: aHudetails[i].EXIDV,
                                        packmaterial: aHudetails[i].VHILM,
                                        qtymaterial: aHudetails[i].LFIMG,
                                        materialunit: aHudetails[i].VRKME,
                                        noofbox: aHudetails[i].NOBOX,
                                        qtymatperbox: aHudetails[i].LFIMG_PB
                                    }
                                    oFuncLocModel.push(items);
                                }
                                // oModel1.setProperty("/",  oFuncLocModel );
                                // oView.setModel(oFuncLocModel, 'oFuncLocModel');
                                oView.getModel("oFuncLocModel").setProperty("/items", oFuncLocModel);
                                oView.byId("_IDGenTable1").setVisible(true);
                                oView.byId("buttonconfirm").setEnabled(true);

                            }
                            else {
                                msg = "Invalid HU Number";
                                MessageToast.show(msg);
                            }
                            that.oGlobalBusyDialog.close();
                        }.bind(this),
                        error: function (err) {
                            that.oGlobalBusyDialog.close();
                            msg = err.message; //"Invalid HU Number";
                            MessageToast.show(msg);
                        }.bind(this)
                    });

                }
                else {
                    oView.byId("_IDGenTable1").setVisible(false);
                }
            },

            addzero: function (num, size) {
                num = num.toString();
                while (num.length < size) num = "0" + num;
                return num;
            },

            onresethu: function () {
                var oView = this.getView();
                // var oModel1 = oView.getModel("oFuncLocModel");

                var sExdiv = ""; //""                  
                oView.byId("idhunemberscan").setValue(sExdiv);
                oView.byId("_IDGenTable1").setVisible(false);
                oView.byId("buttonconfirm").setEnabled(false);

            },

            onConfirmhu: function () {
                var oView = this.getView();
                var sExdiv = oView.byId("idhunemberscan").getValue();

                var oOwnerComponent = this.getOwnerComponent();
                oOwnerComponent.Exdiv = sExdiv;

                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteScanPallet");
            }
        });
    });
