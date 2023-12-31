function initMap() {    
  const dc = new google.maps.LatLng(38.906624, -77.065774);
  const markerMap = new google.maps.Map(document.getElementById("map"), {
    center: dc,
    zoom: 15,
  });

  const iconBase =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/";

  const icons = {
    parking: iconBase + "parking_lot_maps.png",
    library: iconBase + "library_maps.png",
    info: iconBase + "info-i_maps.png"
  };

   let path = window.location.hostname.replace(/\//g,''); // Remove all slashes from string


   $.post( "http://" + path + ":3000/getdata", function(data) {
	    console.log(data);
	    addMapMarkers(data, icons, markerMap);
	});
}



function addMapMarkers(data, icons, markerMap){
 for (var i=0; i < data.values.length; i++)
 {
    addMarker(data.headers, data.values[i], icons, markerMap);
 }
}

var ToDisplay = ["Name", "Address", "Cost", "Distance to the Mall", "Nearest Exit from VA", "Nearest Exit from MD", "Website", "Navigate_URL"];
var HyperLinks = ["Navigate_URL", "Website"];

function addMarker(infoHeaders, infoValues, icons, markerMap){
    var latIndex = infoHeaders.indexOf("Lat");
    var lngIndex = infoHeaders.indexOf("Lng");

    var lat = Number(infoValues[latIndex]);
    var lng = Number(infoValues[lngIndex]);

    var markerPosition = new google.maps.LatLng(lat, lng);
    
    var infoHTML = "";
    var numHeaders = infoHeaders.length;

    for (var i = 0; i < ToDisplay.length; i++)
    {
        var header = ToDisplay[i];
        var headerIndex = $.inArray(header, infoHeaders);
        if (headerIndex !== -1)
        {
            var info = infoValues[headerIndex];
            if($.inArray(header, HyperLinks) !== -1)
            {
                infoHTML += '<strong><a href = "' + info + '" target="_blank"> ' + header + ' </a></strong><br>';
            }
            else
            {
                infoHTML += '<strong>' + header + '</strong>: ' + info + '<br> ';
            }
        }
    }
    var marker = new google.maps.Marker({
    position: markerPosition,
    icon: icons.parking,
    map: markerMap});

    var coordInfoWindow = new google.maps.InfoWindow({pixelOffset: new google.maps.Size(0, -25)});
      coordInfoWindow.setContent(infoHTML);
      coordInfoWindow.setPosition(markerPosition);
      marker.addListener("click", () =>
      {
            coordInfoWindow.open({anchor: marker, map});
            $("#sideInfo").empty();
            $("#sideInfo").html(infoHTML);
      });

      $("#parkingList").append(infoHTML + "<br>")
}

function addMarkerV1(markerFeature, markerIcon, markerMap){
     var marker = new google.maps.Marker({
      position: markerFeature.position,
      icon: markerIcon,
      map: markerMap,});

      var coordInfoWindow = new google.maps.InfoWindow({pixelOffset: new google.maps.Size(0, -25)});
      coordInfoWindow.setContent(markerFeature.infoWindow);
      coordInfoWindow.setPosition(markerFeature.position);
      marker.addListener("click", () =>
      {
            coordInfoWindow.open({anchor: marker, map});
      });
}

function makeInfoWindowEvent(map, infowindow, marker) {
  google.maps.event.addListener(marker, 'click', function() {
       infowindow.open(map, marker);
  });
}

const TILE_SIZE = 256;

function createInfoWindowContent(latLng, zoom) {
  return [
    "PMI Parking",
    "Spots remaining: " + zoom,
    "Cost per day: " + zoom,
  ].join("<br>");
}

// The mapping between latitude, longitude and pixels is defined by the web
// mercator projection.
function project(latLng) {
  let siny = Math.sin((latLng.lat() * Math.PI) / 180);

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = Math.min(Math.max(siny, -0.9999), 0.9999);
  return new google.maps.Point(
    TILE_SIZE * (0.5 + latLng.lng() / 360),
    TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))
  );
}

function toggleView(elem){
    var current_state = $(elem).data("state");
    if (current_state == "map")
    {
        $(elem).data("state", "list");
        $(elem).text("View Map");
        $("#map").hide();
        $("#list").show();
    }
    else if(current_state == "list")
    {
        $(elem).data("state", "map");
        $(elem).text("View List");
        $("#map").show();
        $("#list").hide();
    }
}

window.initMap = initMap;

$(function()
{

	$("#viewToggle").data("state", "map");
	$("#viewToggle").click(function(){
	    toggleView(this);
	})
})

