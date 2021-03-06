var isFFOS = ("mozApps" in navigator && navigator.userAgent.search("Mobile") !== -1);

if (isFFOS) {
    var MANIFEST_URL = "http://ondetoi.leandro.org/manifest.webapp";

    function install() {
        var myapp = navigator.mozApps.install(MANIFEST_URL);
        myapp.onsuccess = function (data) {
            console.log("App instalada");
        };
        myapp.onerror = function () {
            alert("Error installing the app: " + this.error.name);
        };
    }

    var request = navigator.mozApps.checkInstalled(MANIFEST_URL);
    request.onsuccess = function () {
        if (!request.result) install();
    };
    request.onerror = function () {
        alert('Error checking installation status: ' + this.error.message);
    };
}




var app_token = "bf0b5fbe7f5ce0221ad5defcf295e4d1";
var lat = "";
var lon = "";
var map = null;
var assetLayerGroup = null;
var points = [];

$(document).ready(function () {

    

    function call(topic) {
        $('#container').empty();
        $('#container').add('div').attr('id', 'mapa').empty().height('93%');



        var RedIcon = L.Icon.Default.extend({
            options: {
                //iconUrl: 'http://stuff.samat.org/Test-Cases/Leaflet/881-Marker-Subclassing/marker-icon-red.png'
                iconUrl: 'icons/map/select-marker.png'
            }
        });
        var redIcon = new RedIcon();

        map = L.map('mapa').setView([lat, lon], 15);

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        }).addTo(map);

        L.marker([lat, lon], {
            icon: redIcon
        }).addTo(map).bindPopup("Ud. est&aacute; <b>aqu&iacute;</b>");


        paint_markers('bar', lat, lon, app_token, map);


        var popup = L.popup();



    }

    function paint_markers(topic, lat, lon, app_token, map) {
        for (i = 0; i < points.length; i++) {
            map.removeLayer(points[i]);
        }
        points = [];


        //lamada al API 11870
        //http://api.11870.com/api/v2/search?q=bar&lat=40.3941&lon=-3.7078&radius=1&appToken=bf0b5fbe7f5ce0221ad5defcf295e4d1&alt=json

        $.ajax({
            type: "GET",
            url: "http://api.11870.com/api/v2/search?q=" + topic + "&lat=" + lat + "&lon=" + lon + "&radius=1&appToken=" + app_token + "&alt=json",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            async: false,
            success: function (data) {
                if (data.entries.length === 0) {
                    alert("Vaya tela de barrio el tuyo, no hay " + topic);
                    return;
                }

                data.entries.forEach(function (element) {
                    //console.log(element);
                    new_marker = element.extensions.georss_where.gml_point.gml_pos.split(" ");
                    var point = L.marker([new_marker[0], new_marker[1]]).addTo(map).bindPopup(
                        "<a href='" + element.id + "' target='_new'>" + element.title + "</a><br><b>" + element.extensions.oos_telephone + "</b><br>" + element.extensions.oos_useraddress + "<i> (" + element.extensions.oos_subdependentlocality.name + ") </i>"
                    );
                    points.push(point);
                });
            }
        });
    }

    var options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
    };
    
    
    
    //runtime
    $('#container').append("<progress></progress>");

    navigator.geolocation.getCurrentPosition(
        function (position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            console.log("lon " + lon);

            $('#info_sup').html("<small><small>" + lat.toFixed(2) + ", " + lon.toFixed(2) + "</small></small>");
            call('bar');
            $(".option").on("click", function () {
                paint_markers($(this).attr( "valor" ), lat, lon, app_token, map);
            });

        },
        function (error) {
            alert('OndeToi ERROR(' + error.code + '): ' + error.message);
            $('progress').hide();
            $('#container').prepend('<img id="theImg" src="icons/ondetoi/trollface.jpg" />');
            $('#container').prepend('<p>Habilita la Geolocalización de tu teléfono en Ajustes, por favor ..</p>');
            
        },
        options

    );

});
