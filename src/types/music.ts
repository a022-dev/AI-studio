export type WeatherKey = 'clear' | 'rain' | 'cloudy' | 'snow' | 'dawn';

export type PageId = 'main' | 'explore' | 'recommend' | 'about';

export interface CityOption {
  id: string;
  nameKo: string;
  nameEn: string;
  lat: number;
  lon: number;
  fallbackTemp: number;
  fallbackWeather: WeatherKey;
}

export interface WeatherData {
  cityId: string;
  cityName: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherKey: WeatherKey;
  conditionLabel: string;
  isLive: boolean;
  updatedAt: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSeconds: number;
  bpm: number;
  note: string;
  chordPreset: WeatherKey;
}

export interface Playlist {
  id: string;
  weather: WeatherKey;
  title: string;
  subtitle: string;
  description: string;
  editorialNote: string;
  coverUrl: string;
  curator: string;
  genre: string;
  bpmRange: string;
  totalDuration: string;
  spotifySearchUrl: string;
  youtubeSearchUrl: string;
  youtubeEmbedId: string;
  spotifyPlaylistEmbedUrl: string;
  tracks: Track[];
}

export interface CommunitySubmission {
  id: string;
  weather: WeatherKey;
  songTitle: string;
  artist: string;
  nickname: string;
  comment: string;
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
}

export interface BugReport {
  id: string;
  category: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface WeatherThemeMeta {
  key: WeatherKey;
  label: string;
  englishLabel: string;
  accentHex: string;
  accentSoftClass: string;
  accentTextClass: string;
  accentBgClass: string;
  headline: string;
  sonicSummary: string;
  bpmTarget: string;
  instruments: string;
  listeningScene: string;
  editorialQuotes: string[];
}
