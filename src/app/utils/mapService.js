export const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  'pk.eyJ1IjoiZmFzdDIiLCJhIjoiY21mbW9qbzZlMDQ5dzJpcXhlOW82ODdlcSJ9.HYJxZbPDCZHD8_Q5faa6ig';

const GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

// Service area: search results and the map default to Gwalior.
export const GWALIOR_CENTER = { latitude: 26.2183, longitude: 78.1828 };

// Suggestion features are remembered so a picked suggestion can be resolved without
// another network round-trip.
const featureCache = new Map();

const stripCountry = (text = '') => text.replace(/,\s*India$/, '');

const partsFromFeature = (feature) => {
  const ctx = [feature, ...(feature.context || [])];
  const get = (prefix) => ctx.find((c) => c.id?.startsWith(prefix))?.text || '';
  return {
    city: get('place') || get('locality') || get('district'),
    area: get('neighborhood') || get('locality'),
    state: get('region'),
    pinCode: get('postcode'),
  };
};

const locationNameFrom = ({ area, city, state }) =>
  [area || city, state].filter(Boolean).join(', ');

export const isMapConfigured = () => Boolean(MAPBOX_TOKEN);

export const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `${GEOCODING_URL}/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=in&limit=1&language=en`
  );
  if (!res.ok) throw new Error(`Reverse geocoding failed: ${res.status}`);
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;

  const parts = partsFromFeature(feature);
  return {
    ...parts,
    formattedAddress: stripCountry(feature.place_name || ''),
    locationName: locationNameFrom(parts),
  };
};

// Gwalior and its outskirts (west, south, east, north).
const GWALIOR_BBOX = '77.90,26.00,78.45,26.45';

const fetchFeatures = async (input, params) => {
  const res = await fetch(`${GEOCODING_URL}/${encodeURIComponent(input)}.json?${params}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  return data.features || [];
};

export const searchPlaces = async (input, bias) => {
  const baseParams = {
    access_token: MAPBOX_TOKEN,
    country: 'in',
    autocomplete: 'true',
    fuzzyMatch: 'true',
    language: 'en',
    limit: '8',
    types: 'address,poi,place,locality,neighborhood,postcode',
  };
  const biasLat = Number(bias?.latitude);
  const biasLng = Number(bias?.longitude);
  const hasBias = Number.isFinite(biasLat) && Number.isFinite(biasLng);
  const center = hasBias ? { latitude: biasLat, longitude: biasLng } : GWALIOR_CENTER;
  const proximity = `${center.longitude},${center.latitude}`;

  // Gwalior matches first; only widen to the rest of India when there are too few.
  const local = await fetchFeatures(
    input,
    new URLSearchParams({ ...baseParams, proximity, bbox: GWALIOR_BBOX })
  );
  let features = local;
  if (local.length < 4) {
    const wider = await fetchFeatures(input, new URLSearchParams({ ...baseParams, proximity }));
    const seen = new Set(local.map((f) => f.id));
    features = [...local, ...wider.filter((f) => !seen.has(f.id))].slice(0, 8);
  }

  return features.map((feature) => {
    featureCache.set(feature.id, feature);
    const description = stripCountry(feature.place_name || '');
    const secondary = description.startsWith(`${feature.text}, `)
      ? description.slice(feature.text.length + 2)
      : description;
    return {
      id: feature.id,
      placeId: feature.id,
      mainText: feature.text || description,
      secondaryText: secondary,
      description,
    };
  });
};

export const getPlaceDetails = async (placeId) => {
  const feature = featureCache.get(placeId);
  if (!feature) throw new Error('Place is no longer available. Search again.');

  const [lng, lat] = feature.center;
  const parts = partsFromFeature(feature);
  // Only building-level matches are trustworthy; area/street matches land on a centre
  // point, so the user must confirm the exact spot on the map.
  const types = feature.place_type || [];
  const accuracy = feature.properties?.accuracy;
  const precise =
    types.includes('poi') ||
    (types.includes('address') && ['rooftop', 'parcel', 'point'].includes(accuracy));
  return {
    lat,
    lng,
    precise,
    name: feature.text || '',
    formattedAddress: stripCountry(feature.place_name || ''),
    locationName: locationNameFrom(parts),
    ...parts,
  };
};
