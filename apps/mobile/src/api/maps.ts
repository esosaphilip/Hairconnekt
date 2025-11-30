import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '../config';

export async function autocompletePlaces(input: string, opts?: { language?: string; country?: string; location?: { lat: number; lng: number } }) {
  if (!GOOGLE_MAPS_API_KEY) throw new Error('GOOGLE_MAPS_API_KEY not set');
  const params: any = {
    input,
    key: GOOGLE_MAPS_API_KEY,
  };
  if (opts?.language) params.language = opts.language;
  if (opts?.country) params.components = `country:${opts.country}`;
  if (opts?.location) {
    params.location = `${opts.location.lat},${opts.location.lng}`;
    params.radius = 20000;
  }
  const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
  const res = await axios.get(url, { params });
  return res.data?.predictions || [];
}

export async function geocodeAddress(address: string) {
  if (!GOOGLE_MAPS_API_KEY) throw new Error('GOOGLE_MAPS_API_KEY not set');
  const url = 'https://maps.googleapis.com/maps/api/geocode/json';
  const res = await axios.get(url, { params: { address, key: GOOGLE_MAPS_API_KEY } });
  return res.data?.results || [];
}
