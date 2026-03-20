/**
 * @file useGoogleMapsAutocomplete Hook
 * @description Custom React hook that lazily loads the Google Maps Places library
 * and attaches an Autocomplete widget to a given input element ref.
 * Extracted from ClaimProcessor to follow the Single Responsibility Principle.
 */
import { useEffect, type RefObject } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

/**
 * Attaches Google Maps Places Autocomplete to a city input field.
 *
 * @param inputRef - React ref pointing to the target HTMLInputElement
 * @param onPlaceSelected - Callback invoked when the user selects a city
 */
export function useGoogleMapsAutocomplete(
  inputRef: RefObject<HTMLInputElement | null>,
  onPlaceSelected: (cityName: string) => void
): void {
  useEffect(() => {
    if (!inputRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set, skipping Places Autocomplete.');
      return;
    }

    setOptions({ key: apiKey });

    importLibrary('places')
      .then((placesLib: google.maps.PlacesLibrary) => {
        const autocomplete = new placesLib.Autocomplete(inputRef.current!, {
          types: ['(cities)'],
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.name) {
            onPlaceSelected(place.name);
          }
        });
      })
      .catch((e: Error) =>
        console.warn('Google Maps Places not configured, bypassing autocomplete.', e)
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
