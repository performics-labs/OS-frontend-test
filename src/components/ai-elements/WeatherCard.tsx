import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Cloud, Thermometer, Sunrise, Sunset } from 'lucide-react';
import type { ToolState } from '@/types/tools';

// Open-Meteo API response format (from os-agent weather tool)
type OpenMeteoWeatherData = {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    current_units?: {
        time?: string;
        interval?: string;
        temperature_2m?: string;
    };
    current?: {
        time?: string;
        interval?: number;
        temperature_2m?: number;
    };
    hourly_units?: Record<string, string>;
    hourly?: Record<string, unknown[]>;
    daily_units?: Record<string, string>;
    daily?: Record<string, unknown[]>;
    cityName?: string;
};

type WeatherCardProps = {
    output?: OpenMeteoWeatherData | string;
    state: ToolState;
    error?: string;
};

export function WeatherCard({ output, state, error }: WeatherCardProps) {
    if (state === 'output-error' || error) {
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-sm">Weather Error</CardTitle>
                    <CardDescription className="text-xs">
                        {error || 'Failed to fetch weather data'}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!output || state === 'input-streaming') {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 animate-pulse" />
                        Loading weather...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    // Parse output if it's a string (happens sometimes with tool results)
    let weatherData: OpenMeteoWeatherData;
    if (typeof output === 'string') {
        try {
            // Try parsing as JSON first
            weatherData = JSON.parse(output);
        } catch {
            // If that fails, try converting Python dict string to JSON
            // Python dicts use single quotes, JSON requires double quotes
            try {
                const jsonString = output
                    .replace(/'/g, '"')
                    .replace(/None/g, 'null')
                    .replace(/True/g, 'true')
                    .replace(/False/g, 'false');
                weatherData = JSON.parse(jsonString);
            } catch (e) {
                console.error('Failed to parse weather data:', output, e);
                return (
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-sm">Weather Error</CardTitle>
                            <CardDescription className="text-xs">
                                Invalid weather data format
                            </CardDescription>
                        </CardHeader>
                    </Card>
                );
            }
        }
    } else {
        weatherData = output;
    }

    // Extract data from Open-Meteo format
    const location = weatherData.cityName || `${weatherData.latitude}°, ${weatherData.longitude}°`;
    const temperature = weatherData.current?.temperature_2m;
    const temperatureUnit = weatherData.current_units?.temperature_2m || '°C';

    // Extract sunrise/sunset from daily data (first day)
    const sunrise = weatherData.daily?.sunrise?.[0] as string | undefined;
    const sunset = weatherData.daily?.sunset?.[0] as string | undefined;

    // Extract temperature range from hourly data (today)
    const hourlyTemps = weatherData.hourly?.temperature_2m;
    let minTemp: number | undefined;
    let maxTemp: number | undefined;
    if (Array.isArray(hourlyTemps) && hourlyTemps.length > 0) {
        // Take first 24 hours for today
        const todayTemps = hourlyTemps.slice(0, 24);
        minTemp = Math.min(...todayTemps.filter((t) => typeof t === 'number'));
        maxTemp = Math.max(...todayTemps.filter((t) => typeof t === 'number'));
    }

    if (temperature === undefined) {
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-sm">Weather Error</CardTitle>
                    <CardDescription className="text-xs">
                        Temperature data not available
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    {location}
                </CardTitle>
                <CardDescription className="text-xs">
                    {weatherData.timezone} • {new Date().toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Temperature */}
                <div className="flex items-center gap-3">
                    <Thermometer className="text-muted-foreground h-8 w-8" />
                    <div>
                        <p className="text-4xl font-bold">
                            {Math.round(temperature)}
                            {temperatureUnit}
                        </p>
                        <p className="text-muted-foreground text-xs">Current temperature</p>
                    </div>
                </div>

                {/* Temperature Range */}
                {minTemp !== undefined && maxTemp !== undefined && (
                    <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Low</span>
                                <span className="font-semibold">
                                    {Math.round(minTemp)}
                                    {temperatureUnit}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">High</span>
                                <span className="font-semibold">
                                    {Math.round(maxTemp)}
                                    {temperatureUnit}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sunrise/Sunset */}
                {(sunrise || sunset) && (
                    <div className="flex items-center justify-around gap-4 border-t pt-3">
                        {sunrise && (
                            <div className="flex items-center gap-2">
                                <Sunrise className="text-muted-foreground h-4 w-4" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Sunrise</p>
                                    <p className="text-sm font-medium">
                                        {new Date(sunrise).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                        {sunset && (
                            <div className="flex items-center gap-2">
                                <Sunset className="text-muted-foreground h-4 w-4" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Sunset</p>
                                    <p className="text-sm font-medium">
                                        {new Date(sunset).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
