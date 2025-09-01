import axios from "axios";

export const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            source: "navigator",
          });
        },
        async () => {
          // fallback to Google API
          try {
            const res = await fetch(
              `https://www.googleapis.com/geolocation/v1/geolocate?key=${
                import.meta.env.VITE_GOOGLE_MAPS_API_KEY
              }`,
              { method: "POST" }
            );
            const data = await res.json();
            if (data?.location) {
              resolve({
                lat: data.location.lat,
                lng: data.location.lng,
                accuracy: data.accuracy,
                source: "google",
              });
            } else reject("Google Geolocation failed");
          } catch (err) {
            reject("Location fetch failed: " + err.message);
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      reject("Geolocation not supported");
    }
  });
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const res = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );
    console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    console.log("res-->",res.data);
    if (res.data.status !== "OK") throw new Error("Failed to fetch address");

    const components = res.data.results[0].address_components;

    // Helper to get a specific field
    const getComponent = (type) =>
      components.find((c) => c.types.includes(type))?.long_name || "";

    return {
      pincode: getComponent("postal_code"),
      city:
        getComponent("locality") ||
        getComponent("administrative_area_level_2"),
      state: getComponent("administrative_area_level_1"),
      country: getComponent("country"),
      address: res.data.results[0].formatted_address,
      locality:
        getComponent("sublocality") ||
        getComponent("sublocality_level_1") ||
        "",
    };
  } catch (err) {
    console.error("Google Reverse Geocode Error:", err);
    return {};
  }
};
