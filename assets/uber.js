$(function(){
    SlidingMarker.initializeGlobally();
    getInstallerLocation();

    setInterval(function(){
        getInstallerLocation();
        console.log('updated ... ');
        //send the updated location of the installer and redraw the pin
    }, 15000); //15 second refresh

    var socket = io.connect('http://localhost:8080');

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: false,
        scaleControl: false,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        scaleControl: false,
    });

    var geocoder = new google.maps.Geocoder();
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer({
        polylineOptions: {
            strokeColor: "black"
        },
        //suppressMarkers: true
    });
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('panel'));

    // on connection to server, ask for user's name with an anonymous callback
    socket.on('connect', function(){
        // call the server-side function 'adduser' and send one parameter (value of prompt)
        var username = getQueryVariable("username");
        var salesOrderNumber = getQueryVariable("salesordernumber");
        var userType = getQueryVariable("type");
        if(username !="" && salesOrderNumber != ""){
            socket.emit('adduser', {username, salesOrderNumber});
            if(userType == "installer")
            {
                getInstallerLocation();
                $('.top-floating-panel').show();
            }
            else
            {
                $('.customer-nav-panel').show();
            }
        }
        else
        {
            $('.error').show();
            $('.customer-nav-panel').show();
            $('#map').hide();
            $('#bottom-bar').hide();
        }


    });


    function getInstallerLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            $('#demo').text("Geolocation is not supported by this browser.");
        }
    }


    function showPosition(position) {
        $('#demo').append('<div>' + "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude+ '</div>');

        var request = {
            origin: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
            destination: 'Vodacom Midrand office staff entrance',
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };

        var address = request.destination;

        geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();
                var geocodedAddress = new google.maps.LatLng(latitude, longitude);
            }
        });

        // Getting o work with the provided route
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                var point = response.routes[0].legs[0];
                $('.time').html(point.duration.text);
                directionsDisplay.setDirections(response);
            }
        });

    }



    function createMarker(latlng, imageName) {

        var marker = new google.maps.Marker({
            position: latlng,
            map: map,
            icon: imageName,
        });


    }

    // listener, whenever the server emits 'updatechat', this updates the chat body
    socket.on('updatechat', function (username, data) {
        $('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
    });

    // listener, whenever the server emits 'updaterooms', this updates the room the client is in
    socket.on('updaterooms', function(rooms, current_room) {
        $('#rooms').empty();
        $.each(rooms, function(key, value) {
            if(value == current_room){
                $('#rooms').append('<div>' + value + '</div>');
            }
            else {
                $('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
            }
        });
    });



    function getQueryVariable(variable)
    {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
        }
        return(false);
    }


    // when the client clicks SEND
    $('#datasend').click( function() {
        var message = $('#data').val();
        $('#data').val('');
        // tell server to execute 'sendchat' and send along one parameter
        socket.emit('sendchat', message);
    });

    // when the client hits ENTER on their keyboard
    $('#data').keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
        }
    });

    $("#bottom-bar").toggle(function(){
            $(this).animate(
                {
                    height: "30%",
                    width: "100%",
                    left: '0%'
                },600);
        },
        function(){
            $(this).animate(
                {
                    height: "15%",
                    width: "94%",
                    left: '3%'
                },600);
        });
});