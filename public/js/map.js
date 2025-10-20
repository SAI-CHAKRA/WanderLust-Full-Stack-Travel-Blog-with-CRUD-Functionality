mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: listing.geometry.coordinates, // starting position [longitute (E), latitude (N)]. Note that lat must be set between -90 and 90
    style:"mapbox://styles/mapbox/streets-v12",
    zoom: 9 // starting zoom
});

//console.log(coordinates);

const marker = new mapboxgl.Marker({color:'red'})  // create a marker on map
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset:25}).setHTML(
            `<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`  // when we click on marker in map then it display this message
        )
    )
    .addTo(map);