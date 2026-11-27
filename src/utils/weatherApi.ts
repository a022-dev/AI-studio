import { CityOption, WeatherData, WeatherKey } from '../types/music';

// Map WMO weather interpretation codes from Open-Meteo into our 5 curation themes
export function mapWmoToWeatherKey(code: number, isDay: number): { key: WeatherKey; label: string } {
  // Snow codes
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { key: 'snow', label: '눈 내림' };
  }
  // Rain / Drizzle / Thunderstorm codes
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
    return { key: 'rain', label: '비' };
  }
  // Night / Dawn when clear or partly cloudy
  if (isDay === 0) {
    return { key: 'dawn', label: '밤 · 새벽' };
  }
  // Cloudy / Foggy
  if ([2, 3, 45, 48].includes(code)) {
    return { key: 'cloudy', label: '흐림' };
  }
  // Clear / Mainly clear
  return { key: 'clear', label: '맑음' };
}

export async function fetchCityWeather(city: CityOption): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&timezone=auto`;

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    window.clearTimeout(timer);

    if (!res.ok) {
      throw new Error('Weather API unavailable');
    }

    const json = await res.json();
    const cur = json.current;
    const mapped = mapWmoToWeatherKey(Number(cur.weather_code), Number(cur.is_day));

    return {
      cityId: city.id,
      cityName: city.nameKo,
      temperature: Math.round(Number(cur.temperature_2m)),
      apparentTemperature: Math.round(Number(cur.apparent_temperature)),
      humidity: Math.round(Number(cur.relative_humidity_2m)),
      windSpeed: Math.round(Number(cur.wind_speed_10m) * 10) / 10,
      weatherKey: mapped.key,
      conditionLabel: mapped.label,
      isLive: true,
      updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    // Graceful fallback so the interface always displays complete weather data
    const labelMap: Record<WeatherKey, string> = {
      clear: '맑음',
      rain: '비',
      cloudy: '흐림',
      snow: '눈 내림',
      dawn: '밤 · 새벽',
    };

    return {
      cityId: city.id,
      cityName: city.nameKo,
      temperature: city.fallbackTemp,
      apparentTemperature: city.fallbackTemp - 1,
      humidity: city.fallbackWeather === 'rain' ? 84 : 52,
      windSpeed: 3.4,
      weatherKey: city.fallbackWeather,
      conditionLabel: labelMap[city.fallbackWeather],
      isLive: false,
      updatedAt: '기본 데이터',
    };
  }
}
