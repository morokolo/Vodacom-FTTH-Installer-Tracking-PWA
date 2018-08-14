(function($){
  $(function(){

    $('.sidenav').sidenav();
    $('.parallax').parallax();
    $('.modal').modal();




      var config = {
          apiKey: "AIzaSyBqox5fCUf8-Ja3K7_Wjf7Q9bgIGGePSvw",
          authDomain: "ftthtracking.firebaseapp.com",
          databaseURL: "https://ftthtracking.firebaseio.com",
          projectId: "ftthtracking",
          storageBucket: "",
          messagingSenderId: "617960451441"
      };


      var defaultApp = firebase.initializeApp(config);
      var defaultDatabase = defaultApp.database();


      var CustomersAddress = [];
      var InstallerLocation = [];
      var username = getQueryVariable("username");
      var salesOrderNumber = getQueryVariable("salesordernumber");
      var typeOfUser = getQueryVariable("type");
      var isRating = getQueryVariable("rating");
      var socket = io.connect('http://localhost:8080');


      if(typeOfUser =='installer') {
          $('.navigation-block').show();
      }

      setTimeout(function() {
          $('.tracking_page').removeClass('animate_content');
      }, 2500);

      mapboxgl.accessToken = 'pk.eyJ1IjoibW9yb2tvbG8iLCJhIjoiY2prZHNwa2I5MWxmdjNscG44eTlzaHZteiJ9.xl-oYhHw0aC1imwHR1Hk3A';
      var map = new mapboxgl.Map({
          container: 'map', // container id
          style: 'mapbox://styles/mapbox/light-v9', //stylesheet location
          center: [28,-20], // starting position
          zoom: 12 // starting zoom
      });

// Add zoom and rotation controls to the map.
      //map.addControl(new mapboxgl.NavigationControl());

      map.on('load', function() {
          setCustomerAddressLocation();
          getInstallerLocation();
      });


      function getInstallerLocation() {
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(displayAndWatchLocation, locationError, {
                  enableHighAccuracy : true,
                  timeout : Infinity,
                  maximumAge : 0
              });
          }else {
              alert('unable to get the location error goes here');
          }
      }

      function locationError(error) {
          // the current position could not be located
          alert("The current position could not be found!");
      }


      function displayAndWatchLocation(position) {
          console.log('location Recieved');
          setInstallerStartingLocation(position);
          watchCurrentPosition();
      }

      function watchCurrentPosition() {
          var positionTimer = navigator.geolocation.watchPosition(function(position) {
              console.log('watching...', position.coords);
          });
      }

      function setInstallerStartingLocation(postion) {
          $('.bottom-floating-panel').show();
          console.log('Setting Installer Location Here');

          if(typeOfUser =='installer'){
              firebase.database().ref('/tracking/' + salesOrderNumber).set({
                  "longitude" : postion.coords.longitude,
                  "latitude" : postion.coords.latitude
              });

              $('.navigateFab').show();
              $('.registration').hide();
              $('.installer-panel').show();
              InstallerLocation = [postion.coords.longitude, postion.coords.latitude];
              setDrivingRouteAndShowProgress(InstallerLocation, CustomersAddress);

          }else {
              //get the real time location from upstreama
              var whereIsTheinstaller = firebase.database().ref('tracking/' + salesOrderNumber);

              whereIsTheinstaller.on('value', function(coords) {
                  InstallerLocation = [ coords.val().longitude, coords.val().latitude];
                  setDrivingRouteAndShowProgress(InstallerLocation, CustomersAddress);
              });
              $('.registration').show();
              $('.navigateFab').hide();
          }


      }

      function setCustomerAddressLocation(postion) {

          CustomersAddress = [28.1443323, -26.043496];
          map.flyTo({
              center: CustomersAddress
          });
          map.addLayer({
              id: 'end',
              type: 'circle',
              source: {
                  type: 'geojson',
                  data: {
                      type: 'Feature',
                      geometry: {
                          type: 'Point',
                          coordinates: CustomersAddress
                      }
                  }
              }
          });

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

      function setDrivingRouteAndShowProgress(start, end) {

          $('#loading-message').html('Setting installer route...')
          $('#installer_loader').css('display','block');

          var directionsRequest = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

          $.ajax({
              method: 'GET',
              url: directionsRequest,
          }).done(function(data){

              var distance = (data.routes[0].distance)/1000;
              var duration = (data.routes[0].duration/60);
              console.log('duration', duration);
              var fifteenMeters = 0.015;
              if(distance < fifteenMeters && typeOfUser =='installer')
              {
                  $('.arrived-button').show();
              }

              if (map.getLayer("route")) {
                  map.removeLayer("route");
              }

              if (map.getSource("route")) {
                  map.removeSource("route");
              }

              if (map.getLayer("start")) {
                  map.removeLayer("start");
              }

              if (map.getSource("start")) {
                  map.removeSource("start");
              }
              //
              if (map.hasImage("car")) {
                  map.removeImage("car");
              }

              if (map.getSource("car")) {
                  map.removeSource("car");
              }



              var route = data.routes[0].geometry;
              map.addLayer({
                  id: 'route',
                  type: 'line',
                  source: {
                      type: 'geojson',
                      data: {
                          type: 'Feature',
                          geometry: route
                      }
                  },
                  paint: {
                      'line-width': 2
                  }
              });

              // map.addLayer({
              //     id: 'start',
              //     type: 'circle',
              //     source: {
              //         type: 'geojson',
              //         data: {
              //             type: 'Feature',
              //             geometry: {
              //                 type: 'Point',
              //                 coordinates: start
              //             }
              //         }
              //     }
              // });

              //
              map.loadImage('/installer-car.png', function(error, image) {
                  if (error) throw error;
                  map.addImage('car', image);
                  map.addLayer({
                      "id": "start",
                      "type": "symbol",
                      "source": {
                          "type": "geojson",
                          "data": {
                              "type": "FeatureCollection",
                              "features": [{
                                  "type": "Feature",
                                  "geometry": {
                                      "type": "Point",
                                      "coordinates": start
                                  }
                              }]
                          }
                      },
                      "layout": {
                          "icon-image": "car",
                          "icon-size": 0.04
                      }
                  });
              });

              $('.progress').hide();

          });
      }



      socket.on('connect', function(){
          // call the server-side function 'adduser' and send one parameter (value of prompt)

          if(username !="" && salesOrderNumber != "" || typeOfUser != ""){
              socket.emit('adduser', {username, salesOrderNumber, typeOfUser});
              if(typeOfUser == "installer")
              {
                  console.log('installer....');
                  $('.navigateFab').show();
                  $('.registration').hide();
              }
              else
              {
                  console.log('customer....');
                  $('.registration').show();
                  $('.navigateFab').hide();
              }
          }
          else
          {
              $('.error').show();
              $('.customer-nav-panel').show();
              $('#map').hide();
              $('.bottom-floating-panel').hide();
          }


      });


      // $(".bottom-header").click(function (e) {
      //     e.preventDefault();
      //     $(".bottom-floating-panel").toggle(function(){
      //             $(this).animate(
      //                 {
      //                     height: "35%",
      //                     width: "100%",
      //                     bottom: "0%"
      //                 },600);
      //         },
      //         function(){
      //             $(this).animate(
      //                 {
      //                     height: "15%",
      //                     width: "94%",
      //                     bottom: "-10%"
      //                 },600);
      //         });
      // });




      $(".call-action").click(function (e) {
          $("#callModal").modal()
      });

      $(".text-action").click(function (e) {
          //e.preventDefault();
          $("#chatModal").modal()
      });

      $(".share-action").click(function (e) {
          e.preventDefault();
          alert('sharing');
      });

      $(".no-option").click(function (e) {
          e.preventDefault();
          alert('dont call');
      });

      $(".yes-option").click(function (e) {
          e.preventDefault();
          alert('make the  call');
      });



      // $(".bottom-floating-panel").toggle(function(){
      //     console.log('cdasjndbjasndfjksajm')
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



      $('.halfway-fab').click(function(e){
          e.preventDefault();
          navigate( -26.043496, 28.1443323)
          //window.location = "https://maps.google.com/maps?q=Vodacom Midrand office staff entrance";
      });

      $('#user-rating-form').on('change','[name="rating"]',function(){
          alert('i am clicked');
          $('#selected-rating').text($('[name="rating"]:checked').val());
      });

      function navigate(lat, lng) {
          // If it's an iPhone..
          if ((navigator.platform.indexOf("iPhone") !== -1) || (navigator.platform.indexOf("iPod") !== -1)) {
              function iOSversion() {
                  if (/iP(hone|od|ad)/.test(navigator.platform)) {
                      // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
                      var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
                      return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
                  }
              }
              var ver = iOSversion() || [0];

              if (ver[0] >= 6) {
                  protocol = 'maps://';
              } else {
                  protocol = 'http://';

              }
              window.location = protocol + 'maps.apple.com/maps?daddr=' + lat + ',' + lng + '&amp;ll=';
          }
          else {
              window.open('http://maps.google.com?daddr=' + lat + ',' + lng + '&amp;ll=');
          }
      }

  }); // end of document ready
})(jQuery); // end of jQuery name space
