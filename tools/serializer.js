// Serialize osm data to geojson

import { TURBO_URL, TURBO_QUERY_START, TURBO_QUERY_END } from "./../config/config.js"





class OsmBakeryParser {
    constructor(bbox_string) {
        this.bbox_string = bbox_string;
        this.turbo_url = TURBO_URL;
        this.turbo_query_start = TURBO_QUERY_START;
        this.turbo_query_end = TURBO_QUERY_END;
    }



    _serialize_turbo_res_to_geojson(turbo_res_req) {
        var geojson = {
            "type": "FeatureCollection",
            "features": []
        }

        for (let elt of turbo_res_req["elements"]) {
            let geojson_item = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [elt["lat"], elt["lon"]]
                },
                "properties": {
                    "id": elt["id"],
                    "name": elt["tags"]["name"]
                }
            }
            geojson["features"].push(geojson_item)
        }
        console.log(geojson)


    }


    async _get_bakeries_from_turbo_osm() {
        // Download GeoJSON via Ajax

        // curl -d "[out:json];node[shop=bakery](45.708576787494145,4.757938385009765,45.82054524308477,4.843425750732422);out;" -H "Content-Type: application/x-www-form-urlencoded" -X POST https://overpass-api.de/api/interpreter
        let turbo_query = this.turbo_query_start + this.bbox_string + this.turbo_query_end

        let res = await fetch(this.turbo_url,
            {
                method: 'post',
                body: turbo_query

            })
        let json_res = await res.json();
        this._serialize_turbo_res_to_geojson(json_res)
        return res

    }
}
var worker = new OsmBakeryParser("45.708576787494145,4.757938385009765,45.82054524308477,4.843425750732422")
var res = worker._get_bakeries_from_turbo_osm()