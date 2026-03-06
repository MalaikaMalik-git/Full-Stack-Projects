/* global L */
/* eslint-disable */

export const displayMap = (locations) => {
  const map = L.map('map', { scrollWheelZoom: false }).setView([0, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  const bounds = L.latLngBounds();
  locations.forEach((loc) => {
    const [lng, lat] = loc.coordinates;
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`);
    bounds.extend([lat, lng]);
  });
  map.fitBounds(bounds);
};
