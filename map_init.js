import { OsmBakeryParser } from "./modules/data/osm/osm_data_grabber.js"
import { ZOOM_LEVEL } from "./config/config.js"

function onLocationFound(e) {
    var radius = e.accuracy / 2;
    let bbox = map.getBounds();
    console.log("coucu")

}

function signal_markup_clicked(e) {
    // Change style of clicked markup
    // Open nav
    // call slot for form update
    console.log(e.layer._leaflet_id)
    // slot_markup_clicked(e.layer)
}


var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

var grayscale = L.tileLayer(mbUrl, { id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr }),
    streets = L.tileLayer(mbUrl, { id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr });

// EXAMPLE
function get_bbox() {
    let res_array = []
    res_array.push(map.getBounds().getNorthEast()["lat"])
    res_array.push(map.getBounds().getNorthEast()["lng"])
    res_array.push(map.getBounds().getSouthWest()["lat"])
    res_array.push(map.getBounds().getSouthWest()["lng"])

    console.debug("Array of bbox")
    console.debug(res_array)
    return res_array
}


async function add_json_feat_top_map() {
    let bbx = get_bbox()
    var osm_worker = new OsmBakeryParser(bbx[0], bbx[1], bbx[2], bbx[3])
    // FIXME: Impossible to retrieve data with promise. only top to bottm.
    var geo_datas = await osm_worker.get_bakeries_from_turbo_osm();

    feature_group.addData(geo_datas["features"]);
    }


function onEachFeature(feature, layer) {
    console.debug("Go threw OnEachFeature")
    console.debug("feature")
    console.debug(feature)
    console.debug("layer")
    console.debug(layer)
    if (feature.properties && feature.properties.name) {
        // layer.bindPopup(feature.properties.enseigne);
        layer.bindTooltip(feature.properties.name, { permanent: true, className: "my-label", offset: [-10, 0], direction: "left" });
    } else {
        layer.bindTooltip("NONAME", { permanent: true, className: "my-label", offset: [-10, 0], direction: "left" });
    }
}

function pointToLayer(feature, layer) {
    console.debug("go threw point to layer");
    console.debug(feature);
    console.debug(layer);
    var lat = feature.geometry.coordinates[1];
    var lon = feature.geometry.coordinates[0];
    return L.marker([lat, lon]); // TODO: Improve when data from backend
    let x = feature.properties.global_note;
    switch (true) {
        case (x == undefined):
            return L.marker([lat, lon], { icon: unnotedBakeryIcon });
        case (x == null):
            return L.marker([lat, lon], { icon: unnotedBakeryIcon });
        case (x == 0):
            return L.marker([lat, lon], { icon: unnotedBakeryIcon });
        case (x > 0 && x < 2):
            return L.marker([lat, lon], { icon: badBakeryIcon });
        case (x >= 2 && x < 4):
            return L.marker([lat, lon], { icon: mediumBakeryIcon });
        case (x >= 4):
            return L.marker([lat, lon], { icon: goodBakeryIcon });
    }
}
// LABELGUN FUNCTIONS
function resetLabels(markers) {
    //labelgun function

    var i = 0;
    markers.eachLayer(function (label) {
        addLabel(label, ++i);
    });
    labelEngine.update();

}

function addLabel(layer, id) {
    //labelgun function

    console.debug("Go threw addLabal func")
    console.debug(layer)
    console.debug(id)

    // This is ugly but there is no getContainer method on the tooltip :(
    var label = layer.getTooltip()._source._tooltip._container;
    if (label) {

            // We need the bounding rectangle of the label itself
            var rect = label.getBoundingClientRect();

            // We convert the container coordinates (screen space) to Lat/lng
            var bottomLeft = map.containerPointToLatLng([rect.left, rect.bottom]);
            var topRight = map.containerPointToLatLng([rect.right, rect.top]);
            var boundingBox = {
                bottomLeft: [bottomLeft.lng, bottomLeft.lat],
                topRight: [topRight.lng, topRight.lat]
            };

            // Ingest the label into labelgun itself
            labelEngine.ingestLabel(
                boundingBox,
                id,
                parseInt(Math.random() * (5 - 1) + 1), // Weight
                label,
                "Test " + id,
                false
            );

            // If the label hasn't been added to the map already
            // add it and set the added flag to true
            if (!layer.added) {
                layer.addTo(map);
                layer.added = true;
            }

        }
    }

var map = L.map('map', {
    zoom: 15,
    center: [45.70, 4.75],
    zoomControl: false,
    layers: [grayscale]
});

map.on('locationfound', onLocationFound);

var baseLayers = {
    "Grayscale": grayscale,
    "Streets": streets
};




// var bakeries_lyr = L.geoJSON().addTo(map);

// Labelgun!
// This is core of how Labelgun works. We must provide two functions, one
// that hides our labels, another that shows the labels. These are essentially
// callbacks that labelgun uses to actually show and hide our labels
// In this instance we set the labels opacity to 0 and 1 respectively. 
var hideLabel = function (label) { label.labelObject.style.opacity = 0; };
var showLabel = function (label) { label.labelObject.style.opacity = 1; };
var labelEngine = new labelgun.default(hideLabel, showLabel);


var bakeries_lyr = L.markerClusterGroup.layerSupport([]);
bakeries_lyr.addTo(map).on("click", signal_markup_clicked);

var overlayMaps = {
    "Boulangeries": bakeries_lyr
};


var BakeryIcon = L.Icon.extend({
    options: {
        iconSize: [42, 35],
        shadowSize: [50, 64],
        // iconAnchor: [88, 35],
        shadowAnchor: [4, 62],
        popupAnchor: [40, -76]
    }
});

/* var unnotedBakeryIcon = new BakeryIcon({ iconUrl: unnoted_bakery_icon_path }),
    badBakeryIcon = new BakeryIcon({ iconUrl: bad_bakery_icon_path }),
    mediumBakeryIcon = new BakeryIcon({ iconUrl: medium_bakery_icon_path }),
    goodBakeryIcon = new BakeryIcon({ iconUrl: good_bakery_icon_path });
 */
var gjson = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "EPSG:4326" } },
    "features": []
}

var feature_group = L.geoJson(gjson, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
})


// For each marker lets add a label
var i = 0; //TODO: Eliminate this uggly & useless i var
feature_group.eachLayer(function (label) {
    label.added = true;
    addLabel(label, i);
    i++;
});


feature_group.addTo(bakeries_lyr)


L.control.layers(baseLayers, overlayMaps).addTo(map);
add_json_feat_top_map()

map.on('moveend', function (e) {
    // Add points when moving on map. Limited to 2000
    if (feature_group.getLayers().lenght > 2000) {
        resetLabels(feature_group);
        return;
    }
    if (map.getZoom() < ZOOM_LEVEL) {
        resetLabels(feature_group);
        return;
    }

    let map_center = map.getCenter();
    // let latlong = _format_point_for_api(map_center.lng, map_center.lat);
    let bbox = map.getBounds();

    // let bbox_ne = _format_point_for_api(bbox._northEast.lng, bbox._northEast.lat);
    // let bbox_sw = _format_point_for_api(bbox._southWest.lng, bbox._southWest.lat);
    // add_closest_bakeries_json(latlong, id_not_to_get, bbox_ne, bbox_sw);
    add_json_feat_top_map()
    resetLabels(feature_group);

});

// labelgun when markercluster animations ends
bakeries_lyr.on('animationend', function () {
    resetLabels(feature_group);
})


resetLabels(feature_group);