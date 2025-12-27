import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

// --- Types ---

export type UserLocation = {
    lat: number;
    lon: number;
    city: string;
    label?: string; // "Berlin, Germany" or "Current Location"
    isManual: boolean; // true if picked from list, false if GPS
};

interface LocationContextType {
    location: UserLocation | null;
    isLoading: boolean;
    error: string | null;
    setLocation: (loc: UserLocation) => Promise<void>;
    detectLocation: () => Promise<void>;
}

// --- Context ---

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

// --- Provider ---

const STORAGE_KEY = '@user_location';

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const [location, setLocationState] = useState<UserLocation | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading to check storage
    const [error, setError] = useState<string | null>(null);

    // Load from storage on mount
    useEffect(() => {
        (async () => {
            try {
                const json = await AsyncStorage.getItem(STORAGE_KEY);
                if (json) {
                    setLocationState(JSON.parse(json));
                }
            } catch (e) {
                console.error('Failed to load location from storage', e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const setLocation = async (loc: UserLocation) => {
        setLocationState(loc);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
        } catch (e) {
            console.error('Failed to save location', e);
        }
    };

    const detectLocation = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Standorterlaubnis verweigert');
                setIsLoading(false);
                return;
            }

            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const { latitude, longitude } = pos.coords;

            // Reverse Geocode for City Name
            let city = "Aktueller Standort";
            try {
                const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (address) {
                    city = address.city || address.subregion || address.region || city;
                }
            } catch (geoError) {
                console.warn('Reverse geocoding failed', geoError);
            }

            const newLoc: UserLocation = {
                lat: latitude,
                lon: longitude,
                city: city,
                label: city,
                isManual: false,
            };

            await setLocation(newLoc);

        } catch (e) {
            console.error('Geolocation error', e);
            setError('Standort konnte nicht ermittelt werden');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LocationContext.Provider value={{ location, isLoading, error, setLocation, detectLocation }}>
            {children}
        </LocationContext.Provider>
    );
};
