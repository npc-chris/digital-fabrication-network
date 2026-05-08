import { Router, Request, Response } from 'express';

const router = Router();

interface GooglePlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface PhoneCodeOption {
  code: string;
  label: string;
}

let cachedPhoneCodes: PhoneCodeOption[] | null = null;
let cachedPhoneCodesAt = 0;
const PHONE_CODES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface GooglePlaceDetails {
  place_id: string;
  formatted_address?: string;
  name?: string;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

router.get('/autocomplete', async (req: Request, res: Response) => {
  try {
    const query = typeof req.query.input === 'string' ? req.query.input.trim() : '';

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Google Places API key is not configured',
        code: 'PLACES_NOT_CONFIGURED',
      });
    }

    const restrictToNigeria = req.query.restrictToNigeria !== 'false';
    const params = new URLSearchParams({
      input: query,
      key: apiKey,
      types: 'address',
      language: 'en',
    });

    if (restrictToNigeria) {
      params.append('components', 'country:ng');
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
    );

    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch autocomplete data from Google Places' });
    }

    const rawData: unknown = await response.json();
    const data = typeof rawData === 'object' && rawData !== null ? (rawData as Record<string, unknown>) : {};
    const status = typeof data.status === 'string' ? data.status : undefined;

    if (status === 'OK' || status === 'ZERO_RESULTS') {
      const predictions: GooglePlacePrediction[] = Array.isArray(data.predictions)
        ? (data.predictions as GooglePlacePrediction[])
        : [];
      return res.json({ predictions });
    }

    return res.status(502).json({
      error: 'Google Places API returned an error',
      status,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch location predictions' });
  }
});

router.get('/details', async (req: Request, res: Response) => {
  try {
    const placeId = typeof req.query.placeId === 'string' ? req.query.placeId.trim() : '';

    if (!placeId) {
      return res.status(400).json({ error: 'placeId is required' });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Google Places API key is not configured',
        code: 'PLACES_NOT_CONFIGURED',
      });
    }

    const params = new URLSearchParams({
      place_id: placeId,
      key: apiKey,
      fields: 'place_id,formatted_address,name,geometry,address_component',
      language: 'en',
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`
    );

    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch place details from Google Places' });
    }

    const rawData: unknown = await response.json();
    const data = typeof rawData === 'object' && rawData !== null ? (rawData as Record<string, unknown>) : {};
    const status = typeof data.status === 'string' ? data.status : undefined;

    if (status !== 'OK') {
      return res.status(502).json({
        error: 'Google Places API returned an error',
        status,
      });
    }

    const result = typeof data.result === 'object' && data.result !== null ? (data.result as GooglePlaceDetails) : null;
    if (!result) {
      return res.status(502).json({ error: 'Place details were not returned by Google Places' });
    }

    return res.json({
      placeId: result.place_id,
      formattedAddress: result.formatted_address || '',
      name: result.name || '',
      geometry: result.geometry || null,
      addressComponents: result.address_components || [],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch place details' });
  }
});

router.get('/phone-codes', async (_req: Request, res: Response) => {
  try {
    const cacheIsFresh = cachedPhoneCodes && Date.now() - cachedPhoneCodesAt < PHONE_CODES_CACHE_TTL_MS;
    if (cacheIsFresh) {
      return res.json({ phoneCodes: cachedPhoneCodes });
    }

    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,idd');
    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch phone codes from REST Countries' });
    }

    const rawData: unknown = await response.json();
    const countries = Array.isArray(rawData) ? rawData : [];

    const phoneCodes = countries
      .flatMap((country) => {
        const record = country as {
          name?: { common?: string };
          idd?: { root?: string; suffixes?: string[] };
        };
        const root = record.idd?.root;
        const suffixes = record.idd?.suffixes || [];

        if (!root) return [];

        if (suffixes.length === 0) {
          return [{ code: root, label: record.name?.common || root }];
        }

        return suffixes.map((suffix) => ({
          code: `${root}${suffix}`,
          label: record.name?.common || `${root}${suffix}`,
        }));
      })
      .filter((option, index, list) => list.findIndex((item) => item.code === option.code) === index)
      .sort((a, b) => a.label.localeCompare(b.label));

    cachedPhoneCodes = phoneCodes;
    cachedPhoneCodesAt = Date.now();

    return res.json({ phoneCodes });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to load phone codes' });
  }
});

export default router;