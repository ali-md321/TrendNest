const axios = require("axios");

exports.getLatLngFromAddress = async({ address, city, state, pincode }) =>{
  const fullAddress = `${address || ""}, ${city || ""}, ${state || ""}, ${pincode || ""}`;
  const apiKey = process.env.GOOGLE_API_KEY; // 🔑 Add in .env
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;

    const { data } = await axios.get(url);
    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].geometry.location; // { lat, lng }
    }
    return { lat: null, lng: null };
}

exports.getLatLngFromCityPincode = async(city, pincode) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const address = `${city || ""}, ${pincode || ""}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const { data } = await axios.get(url);
    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].geometry.location; // { lat, lng }
    }
    return { lat: null, lng: null };
}