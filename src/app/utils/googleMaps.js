const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

let loaderPromise = null;
let sessionToken = null;

export const isGoogleMapsConfigured = () => Boolean(API_KEY);

export const loadGoogleMaps = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only load in the browser'));
  }
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps);
  if (!API_KEY) {
    return Promise.reject(new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set'));
  }

  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      window.__googleMapsReady = () => resolve(window.google.maps);
      const script = document.createElement('script');
      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${API_KEY}` +
        `&v=weekly&loading=async&language=en&region=IN&callback=__googleMapsReady`;
      script.async = true;
      script.onerror = () => {
        loaderPromise = null;
        reject(new Error('Failed to load Google Maps'));
      };
      document.head.appendChild(script);
    });
  }
  return loaderPromise;
};

const componentName = (component) => component.long_name ?? component.longText ?? '';

const findComponent = (components, ...types) => {
  for (const type of types) {
    const match = components.find((c) => c.types?.includes(type));
    if (match) return componentName(match);
  }
  return '';
};

// Works for both Geocoder (address_components) and Places (addressComponents) shapes.
export const parseAddressComponents = (components = []) => {
  const city = findComponent(
    components,
    'locality',
    'administrative_area_level_3',
    'administrative_area_level_2'
  );
  const area = findComponent(components, 'sublocality_level_1', 'sublocality', 'neighborhood');
  const state = findComponent(components, 'administrative_area_level_1');
  const pinCode = findComponent(components, 'postal_code');
  return { city, area, state, pinCode };
};

const stripCountry = (text = '') => text.replace(/,\s*India$/, '');

export const reverseGeocode = async (lat, lng) => {
  const maps = await loadGoogleMaps();
  const { Geocoder } = await maps.importLibrary('geocoding');
  const { results } = await new Geocoder().geocode({ location: { lat, lng } });
  if (!results?.length) return null;

  // The first result is the most specific but often lacks a pincode/city, so fill gaps
  // from the remaining results.
  const merged = { city: '', area: '', state: '', pinCode: '' };
  for (const result of results) {
    const parts = parseAddressComponents(result.address_components);
    for (const key of Object.keys(merged)) {
      if (!merged[key] && parts[key]) merged[key] = parts[key];
    }
  }

  const localityLabel = merged.area || merged.city;
  return {
    ...merged,
    formattedAddress: stripCountry(results[0].formatted_address),
    locationName: [localityLabel, merged.state].filter(Boolean).join(', '),
  };
};

export const searchPlaces = async (input, bias) => {
  const maps = await loadGoogleMaps();
  const { AutocompleteSuggestion, AutocompleteSessionToken } = await maps.importLibrary('places');
  if (!sessionToken) sessionToken = new AutocompleteSessionToken();

  const request = {
    input,
    sessionToken,
    includedRegionCodes: ['in'],
    language: 'en',
  };
  const biasLat = Number(bias?.latitude);
  const biasLng = Number(bias?.longitude);
  if (Number.isFinite(biasLat) && Number.isFinite(biasLng)) {
    request.locationBias = { center: { lat: biasLat, lng: biasLng }, radius: 50000 };
    request.origin = { lat: biasLat, lng: biasLng };
  }

  const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
  return (suggestions || [])
    .map((s) => s.placePrediction)
    .filter(Boolean)
    .map((p) => ({
      id: p.placeId,
      placeId: p.placeId,
      mainText: p.mainText?.text || p.text?.text || '',
      secondaryText: stripCountry(p.secondaryText?.text || ''),
      description: stripCountry(p.text?.text || ''),
    }));
};

export const getPlaceDetails = async (placeId) => {
  const maps = await loadGoogleMaps();
  const { Place } = await maps.importLibrary('places');
  const place = new Place({ id: placeId });
  await place.fetchFields({
    fields: ['location', 'formattedAddress', 'addressComponents', 'displayName'],
  });
  sessionToken = null; // a details request ends the autocomplete billing session

  const parts = parseAddressComponents(place.addressComponents || []);
  const localityLabel = parts.area || parts.city;
  return {
    lat: place.location.lat(),
    lng: place.location.lng(),
    name: place.displayName || '',
    formattedAddress: stripCountry(place.formattedAddress || ''),
    locationName: [localityLabel, parts.state].filter(Boolean).join(', '),
    ...parts,
  };
};
