var apiurl = "https://api.foursquare.com/v2/venues/search";
var clientid="FG2A2Z1RPCJ2011LU3JYMMBNI4RYZO1MM0NQCJUKO1SLOSAN";
var clientsecret = "Q0QIKOBG0NJQHA1KT4TFAIDVD4VB4DRYRGVNXUSGKXTAML0E";
var categorid= "4d4b7105d754a06374d81259";
$("#txtara").keyup(function () {
    //console.log(this.value);
    var arama = this.value;
    var query = apiurl;
    query += "?client_id=" + clientid;
    query += "&client_secret=" + clientsecret;
    query += "&v=20180126";
    query += "&categoryId=" + categorid;
    query += "&near=Istanbul,TR";
    query += "&query=" + arama;
    //console.log(query);
    $.ajax({
        url: query,
        dataType:'JSON',
        type:'get'

    }).done(function (data) {
        console.log(data.response.venues);
        $("#mekanlar").empty();
        $.each(data.response.venues, function (key, value) {
            kartolustur(value);

        });
        $(".firmakarti").click(function () {
            console.log(this.id);//hangi nesneye tklandıysa onun id si.
            mekandetay(this.id); 
        });
    });
});
function kartolustur(venue) {
    var kartdiv = document.createElement("div");
    $(kartdiv).addClass("firmakarti");
    $(kartdiv).attr("id", venue.id);//div e id attirubete ekledik.
    $(kartdiv).attr("durum", false);//
    //$(kartdiv).attr("location", venue.location);
    var h3 = document.createElement("h3");
    //h3.innerHTML(venue.name);
    $(h3).html(venue.name);
    var adresdiv = document.createElement("div");
    $(adresdiv).addClass("adres").html(venue.location.address);
    var buradadiv = document.createElement("div");
    $(buradadiv).addClass("burada").html(venue.hereNow.summary);
    $(kartdiv).append(h3).append(adresdiv).append(buradadiv).appendTo($("#mekanlar"));
}

function mekandetay(id) {
    var query = "https://api.foursquare.com/v2/venues/";
    query += id;//nesneyi bulucaz click ten id yi çekicez.best fotonun içinden fotografı, divin içindeki şeyleri silip image oluşturup fotoyu oraya koyucaz.
    query += "?client_id=" + clientid;
    query += "&client_secret=" + clientsecret;
    query += "&v=20180126";

    $.ajax({
        url: query,
        dataType: 'JSON',
        type: 'get'

    }).done(function (data) {
        console.log(data.response.venue);
        var venue = data.response.venue;
        goturbeni(venue.location);
        var durum = $("#" + id).attr("durum");
        if (durum == "false") {
            $("#" + id).attr("durum", true);

            if (venue.bestPhoto === undefined) {
                $("#" + id).html("<b>Foto yok</b>");
                return null;
            }

            var fotourl = venue.bestPhoto.prefix;
            fotourl += venue.bestPhoto.width + "x" + venue.bestPhoto.height;
            fotourl += venue.bestPhoto.suffix;
            //console.log(fotourl);
            var img = document.createElement("img");
            $(img).attr("src", fotourl);
            $(img).attr("height", 200);
            $(img).attr("width", 200);
            $("#" + id).empty();
            $("#" + id).append(img);

            return fotourl;
        }
        else {
            $("#" + id).attr("durum", false);
            //eksik....
        }
    });

}
function goturbeni(hedef) {
    $("#tarif").show(600);
    $("#aciklama").empty();
    navigator.geolocation.getCurrentPosition(function (position) {
        var konum = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var mapdiv = document.getElementById("map");
        var settings = {
            center: konum,
            zoom: 15,
            mapTypeId: 'roadmap',
            mapTypeControl: true,
            navigationControlOptions: {
                style: google.maps.NavigationControlStyle.SMALL
            }
        }
        var map = new google.maps.Map(mapdiv, settings);
        var marker = new google.maps.Marker({
            position: konum,
            map: map,
            title: 'Şu an buradasınız',
            animation: google.maps.Animation.DROP
        });
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
        var gidilecek = new google.maps.LatLng(hedef.lat, hedef.lng);
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix({
            origins: [konum],
            destinations: [gidilecek],
            travelMode: 'DRIVING',
            drivingOptions: {
                departureTime: new Date(),
                trafficModel: 'bestguess' // pessimistic ve ya optimistic
            },
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: true,
            avoidTolls: true,
        }, function (response, status) {
            if (status !== 'OK') {
                alert("Mesafe ölçülemedi");
            } else {
                console.log(response);
                $("#bilgi").html("Gidilecek: " + response.destinationAddresses[0] + "<br/>Uzaklık: " + response.rows[0].elements[0].distance.text + "<br/>" + response.rows[0].elements[0].duration.text + "<br/>Trafik ile: " + response.rows[0].elements[0].duration_in_traffic.text)
            }
        });
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        directionsService.route({
            origin: konum,
            destination: gidilecek,
            travelMode: google.maps.TravelMode.DRIVING
        }, function (response, status) {
            console.log(response);
            if (status == 'OK') {
                directionsDisplay.setDirections(response);
            } else {
                alert("Rota çizilemedi" + status);
            }
        });
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById("aciklama"));
    });

}
