import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeocodingService {
    private readonly logger = new Logger(GeocodingService.name);

    async getCoordinates(address: string): Promise<{ lat: number; lng: number } | null> {
        // 1. Try Google Maps Geocoding API
        if (process.env.GOOGLE_MAPS_API_KEY) {
            try {
                const encodedAddr = encodeURIComponent(address);
                const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddr}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

                this.logger.log(`Fetching coordinates from Google Maps for: ${address}`);
                const res = await fetch(url);
                const data = await res.json();

                if (data.status === 'OK' && data.results?.length > 0) {
                    const { lat, lng } = data.results[0].geometry.location;
                    this.logger.log(`Google Maps success: (${lat}, ${lng})`);
                    return { lat, lng };
                } else {
                    this.logger.warn(`Google Maps error/no results for: ${address}. Status: ${data.status}, Error: ${data.error_message}`);
                }
            } catch (error) {
                this.logger.error('Google Maps request failed', error);
            }
        } else {
            this.logger.warn('GOOGLE_MAPS_API_KEY not set. Skipping Google Maps.');
        }

        // 2. Fallback: OpenStreetMap (Nominatim)
        // Rate limit check: Nominatim requires 1 request per second. 
        // In a real prod app, use a queue. For now, we await a small delay if needed or just proceed.
        // We add a simple delay here to be polite.
        await new Promise(r => setTimeout(r, 1000));

        try {
            this.logger.log(`Fallback: Fetching coordinates from Nominatim for: ${address}`);
            const encodedAddr = encodeURIComponent(address);
            const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddr}&format=json&limit=1&addressdetails=1`;

            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'HairConnekt/1.0 (internal-dev-tool)' // Required by Nominatim
                }
            });
            const data = await res.json();

            if (Array.isArray(data) && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                this.logger.log(`Nominatim success: (${lat}, ${lng})`);
                return { lat, lng };
            } else {
                this.logger.warn(`Nominatim no results for: ${address}`);
            }
        } catch (error) {
            this.logger.error('Nominatim request failed', error);
        }

        return null;
    }
}
