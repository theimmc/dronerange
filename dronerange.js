// ==UserScript==
// @id             iitc-plugin-dronerange@theimmc
// @name           IITC plugin: Dronerange
// @category       Layer
// @version        0.1.0.20200607.1
// @namespace      https://github.com/theimmc/dronerange
// @description    [iitc] Shows the maximum distance reachable by drone
// @include        https://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'iitc';
plugin_info.dateTimeVersion = '20200607.1';
plugin_info.pluginId = 'dronerange';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.dronerange = function() {};
  window.plugin.dronerange.droneLayers = {};
  window.plugin.dronerange.MIN_MAP_ZOOM = 14;

  window.plugin.dronerange.portalAdded = function(data) {
    data.portal.on('add', function() {
      window.plugin.dronerange.draw(this.options.guid);
    });

    data.portal.on('remove', function() {
      window.plugin.dronerange.remove(this.options.guid);
    });
  }

  window.plugin.dronerange.remove = function(guid) {
    var previousLayer = window.plugin.dronerange.droneLayers[guid];
    if(previousLayer) {
      window.plugin.dronerange.droneCircleGroup.removeLayer(previousLayer);
      delete window.plugin.dronerange.droneLayers[guid];
    }
  }

  window.plugin.dronerange.draw = function(guid) {
    var d = window.portals[guid];

    var coo = d._latlng;
    var latlng = new L.LatLng(coo.lat,coo.lng);
    var portalLevel = d.options.level;
    var optCircle = {color:'blue',opacity:0.7,fillColor:'blue',fillOpacity:0.1,weight:1,clickable:false, dashArray: [10,6]};
    var range = 500;

    var circle = new L.Circle(latlng, range, optCircle);

    circle.addTo(window.plugin.dronerange.droneCircleGroup);
    window.plugin.dronerange.droneLayers[guid] = circle;
  }

  window.plugin.dronerange.showOrHide = function() {
    if(map.getZoom() >= window.plugin.dronerange.MIN_MAP_ZOOM) {
      // show the layer
      if(!window.plugin.dronerange.droneLayerGroup.hasLayer(window.plugin.dronerange.droneCircleGroup)) {
        window.plugin.dronerange.droneLayerGroup.addLayer(window.plugin.dronerange.droneCircleGroup);
        $('.leaflet-control-layers-list span:contains("Dronerange")').parent('label').removeClass('disabled').attr('title', '');
      }
    } else {
      // hide the layer
      if(window.plugin.dronerange.droneLayerGroup.hasLayer(window.plugin.dronerange.droneCircleGroup)) {
        window.plugin.dronerange.droneLayerGroup.removeLayer(window.plugin.dronerange.droneCircleGroup);
        $('.leaflet-control-layers-list span:contains("Dronerange")').parent('label').addClass('disabled').attr('title', 'Zoom in to show those.');
      }
    }
  }

  var setup = function() {
    // this layer is added to the layer chooser, to be toggled on/off
    window.plugin.dronerange.droneLayerGroup = new L.LayerGroup();

    // this layer is added into the above layer, and removed from it when we zoom out too far
    window.plugin.dronerange.droneCircleGroup = new L.LayerGroup();

    window.plugin.dronerange.droneLayerGroup.addLayer(window.plugin.dronerange.droneCircleGroup);

    window.addLayerGroup('Dronerange', window.plugin.dronerange.droneLayerGroup, true);

    window.addHook('portalAdded', window.plugin.dronerange.portalAdded);

    map.on('zoomend', window.plugin.dronerange.showOrHide);

    window.plugin.dronerange.showOrHide();
  }

// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
