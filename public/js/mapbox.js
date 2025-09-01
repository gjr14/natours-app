export const displayMap = (startLocation, locations) => {
    const [lng, lat] = startLocation.coordinates;

    var map = L.map("map").setView([lat, lng], 7);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        minZoom: 6,
        attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const markers = [];
    for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        const [lng, lat] = location.coordinates;

        const marker = L.marker([lat, lng]).addTo(map);
        marker
            .bindPopup(`Day ${location.day}: ${location.description}`, {
                autoClose: false,
                closeOnClick: false,
            })
            .openPopup();
        markers.push(marker);
    }

    var group = new L.featureGroup(markers);
};
