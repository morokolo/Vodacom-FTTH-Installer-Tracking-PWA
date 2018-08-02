$(function(){


    initLocationProcedure();

    var socket = io.connect('http://localhost:8080');

    var geocoder = new google.maps.Geocoder();
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer({
        polylineOptions: {
            strokeColor: "black"
        },
        //suppressMarkers: true
    });
    directionsDisplay.setMap(map);

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
                //initLocationProcedure();
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



    function initLocationProcedure() {
        console.log('starting..');
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 17,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            fullscreenControl: false,
            scaleControl: false,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            }
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(displayAndWatchLocation, locationError, {
                enableHighAccuracy : true,
                timeout : Infinity,
                maximumAge : 0
            });
        } else {
            alert("Your phone does not support the Geolocation API");
        }
    }

    function locationError(error) {
        // the current position could not be located
        alert("The current position could not be found!");
    }

    function displayAndWatchLocation(position) {
        // set current position
        setUserLocation(position);
        // watch position
        watchCurrentPosition();
    }

    function setUserLocation(position) {
        // marker for userLocation
        // userLocation = new google.maps.Marker({
        //     map : map,
        //     position : new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
        //     title : "You are here",
        // });
        // scroll to userLocation
        map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

        var request = {
            origin: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
            destination: 'Vodacom Midrand office staff entrance',
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };

        //put this in its own function
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
                console.log('test', point.duration);
                $('.time').html('ETA'+ point.duration.text);
                directionsDisplay.setDirections(response);
            }
        });
    }

    function watchCurrentPosition() {
        var positionTimer = navigator.geolocation.watchPosition(function(position) {
            console.log('watching...');


        var request = {
            origin: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
            destination: 'Vodacom Midrand office staff entrance',
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };

        //put this in its own function
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
                console.log('test', point.duration);
                $('.time').html('ETA'+ point.duration.text);
                directionsDisplay.setDirections(response);
            }
        });



            //setMarkerPosition(userLocation, position);
        });
    }

    function setMarkerPosition(marker, position) {
        marker.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        console.log(position);
    }


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


    $("#bottom-bar").toggle(function(){
            $(this).animate(
                {
                    height: "35%",
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



    $('#navigateToAddress').click(function(e){
        e.preventDefault();
        window.location = "https://maps.google.com/maps?q=Vodacom Midrand office staff entrance";
    });


    //
    // SlidingMarker.initializeGlobally();
    // getInstallerLocation();
    //
    // setInterval(function(){
    //     getInstallerLocation();
    //     console.log('updated ... ');
    //     //send the updated location of the installer and redraw the pin
    // }, 15000); //15 second refresh
    //
    // var socket = io.connect('http://localhost:8080');
    //
    // var map = new google.maps.Map(document.getElementById('map'), {
    //     zoom: 15,
    //     mapTypeControl: false,
    //     mapTypeId: google.maps.MapTypeId.ROADMAP,
    //     fullscreenControl: false,
    //     scaleControl: false,
    //     zoomControlOptions: {
    //         position: google.maps.ControlPosition.RIGHT_CENTER
    //     },
    //     scaleControl: false,
    // });
    //
    // var geocoder = new google.maps.Geocoder();
    // var directionsService = new google.maps.DirectionsService();
    // var directionsDisplay = new google.maps.DirectionsRenderer({
    //     polylineOptions: {
    //         strokeColor: "black"
    //     },
    //     //suppressMarkers: true
    // });
    // directionsDisplay.setMap(map);
    // directionsDisplay.setPanel(document.getElementById('panel'));
    //
    // // on connection to server, ask for user's name with an anonymous callback
    // socket.on('connect', function(){
    //     // call the server-side function 'adduser' and send one parameter (value of prompt)
    //     var username = getQueryVariable("username");
    //     var salesOrderNumber = getQueryVariable("salesordernumber");
    //     var userType = getQueryVariable("type");
    //     if(username !="" && salesOrderNumber != ""){
    //         socket.emit('adduser', {username, salesOrderNumber});
    //         if(userType == "installer")
    //         {
    //             getInstallerLocation();
    //             $('.top-floating-panel').show();
    //         }
    //         else
    //         {
    //             $('.customer-nav-panel').show();
    //         }
    //     }
    //     else
    //     {
    //         $('.error').show();
    //         $('.customer-nav-panel').show();
    //         $('#map').hide();
    //         $('#bottom-bar').hide();
    //     }
    //
    //
    // });
    //
    //
    // function getInstallerLocation() {
    //     var options = {
    //         enableHighAccuracy: true,
    //         timeout: 5000,
    //         maximumAge: 0
    //     };
    //
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(showPosition, options);
    //     } else {
    //         $('#demo').text("Geolocation is not supported by this browser.");
    //     }
    // }
    //
    //
    //
    //
    //
    //
    //
    // // function showPosition(position) {
    // //
    // //
    // //     var positionTimer = navigator.geolocation.watchPosition(function(position) {
    // //         setMarkerPosition(userLocation, position);
    // //         map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    // //     });
    // //
    // //
    // //
    // //     var request = {
    // //         origin: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
    // //         destination: 'Vodacom Midrand office staff entrance',
    // //         travelMode: google.maps.DirectionsTravelMode.DRIVING
    // //     };
    // //
    // //     var address = request.destination;
    // //
    // //     geocoder.geocode( { 'address': address}, function(results, status) {
    // //         if (status == google.maps.GeocoderStatus.OK) {
    // //             var latitude = results[0].geometry.location.lat();
    // //             var longitude = results[0].geometry.location.lng();
    // //             var geocodedAddress = new google.maps.LatLng(latitude, longitude);
    // //         }
    // //     });
    // //
    // //     // Getting o work with the provided route
    // //     directionsService.route(request, function(response, status) {
    // //         if (status == google.maps.DirectionsStatus.OK) {
    // //             var point = response.routes[0].legs[0];
    // //             console.log('test', point.duration);
    // //             $('.time').html('ETA'+ point.duration.text);
    // //             directionsDisplay.setDirections(response);
    // //         }
    // //     });
    // //
    // // }
    //
    //
    //
    // function createMarker(latlng, imageName) {
    //
    //     var marker = new google.maps.Marker({
    //         position: latlng,
    //         map: map,
    //         icon: imageName,
    //     });
    //
    //
    // }
    //
    // // listener, whenever the server emits 'updatechat', this updates the chat body
    // socket.on('updatechat', function (username, data) {
    //     $('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
    // });
    //
    // // listener, whenever the server emits 'updaterooms', this updates the room the client is in
    // socket.on('updaterooms', function(rooms, current_room) {
    //     $('#rooms').empty();
    //     $.each(rooms, function(key, value) {
    //         if(value == current_room){
    //             $('#rooms').append('<div>' + value + '</div>');
    //         }
    //         else {
    //             $('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
    //         }
    //     });
    // });
    //
    //
    //
    // function getQueryVariable(variable)
    // {
    //     var query = window.location.search.substring(1);
    //     var vars = query.split("&");
    //     for (var i=0;i<vars.length;i++) {
    //         var pair = vars[i].split("=");
    //         if(pair[0] == variable){return pair[1];}
    //     }
    //     return(false);
    // }
    //
    //
    // // when the client clicks SEND
    // $('#datasend').click( function() {
    //     var message = $('#data').val();
    //     $('#data').val('');
    //     // tell server to execute 'sendchat' and send along one parameter
    //     socket.emit('sendchat', message);
    // });
    //
    // // when the client hits ENTER on their keyboard
    // $('#data').keypress(function(e) {
    //     if(e.which == 13) {
    //         $(this).blur();
    //         $('#datasend').focus().click();
    //     }
    // });
    //
    // $("#bottom-bar").toggle(function(){
    //         $(this).animate(
    //             {
    //                 height: "35%",
    //                 width: "100%",
    //                 left: '0%'
    //             },600);
    //     },
    //     function(){
    //         $(this).animate(
    //             {
    //                 height: "15%",
    //                 width: "94%",
    //                 left: '3%'
    //             },600);
    //     });
    //
    //
    //
    // $('#navigateToAddress').click(function(e){
    //     e.preventDefault();
    //     window.location = "https://maps.google.com/maps?q=Vodacom Midrand office staff entrance";
    // });


});