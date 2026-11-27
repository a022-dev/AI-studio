import { Cloud, CloudRain, Moon, Snowflake, Sun } from 'lucide-react';
import { WeatherKey } from '../types/music';

interface WeatherIconProps {
  weather: WeatherKey;
  className?: string;
}

export function WeatherIcon({ weather, className = 'w-5 h-5' }: WeatherIconProps) {
  switch (weather) {
    case 'clear':
      return <Sun className={className} aria-hidden="true" />;
    case 'rain':
      return <CloudRain className={className} aria-hidden="true" />;
    case 'cloudy':
      return <Cloud className={className} aria-hidden="true" />;
    case 'snow':
      return <Snowflake className={className} aria-hidden="true" />;
    case 'dawn':
      return <Moon className={className} aria-hidden="true" />;
  }
}
