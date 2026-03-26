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
      types: '(cities)',
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

export default router;