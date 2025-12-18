import type { Movie, MovieDetail, Category, Country, MovieListResponse } from '@/types/movie';

const BASE_URL = 'https://phimapi.com';
const OPHIM_URL = 'https://ophim1.com';

// Helper to convert image URLs
export const getImageUrl = (url: string): string => {
  if (!url) return '/placeholder.svg';
  if (url.startsWith('http')) return url;
  return `https://phimimg.com/${url}`;
};

// Fetch new/updated movies
export const fetchNewMovies = async (page = 1): Promise<MovieListResponse> => {
  const res = await fetch(`${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch new movies');
  const data = await res.json();
  return {
    items: data.items || [],
    pagination: data.pagination || {
      totalItems: 0,
      totalItemsPerPage: 24,
      currentPage: page,
      totalPages: 1,
    },
  };
};

// Fetch movies by type (phim-bo, phim-le, hoat-hinh, tv-shows)
export const fetchMoviesByType = async (
  type: string,
  page = 1
): Promise<MovieListResponse> => {
  const res = await fetch(`${BASE_URL}/v1/api/danh-sach/${type}?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch movies by type');
  const data = await res.json();
  return {
    items: data.data?.items || [],
    pagination: data.data?.params?.pagination || {
      totalItems: 0,
      totalItemsPerPage: 24,
      currentPage: page,
      totalPages: 1,
    },
  };
};

// Fetch movie detail
export const fetchMovieDetail = async (slug: string): Promise<MovieDetail | null> => {
  const res = await fetch(`${BASE_URL}/phim/${slug}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.movie ? { ...data.movie, episodes: data.episodes || [] } : null;
};

// Fetch categories
export const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch(`${BASE_URL}/the-loai`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return data || [];
};

// Fetch countries
export const fetchCountries = async (): Promise<Country[]> => {
  const res = await fetch(`${BASE_URL}/quoc-gia`);
  if (!res.ok) throw new Error('Failed to fetch countries');
  const data = await res.json();
  return data || [];
};

// Fetch movies by category
export const fetchMoviesByCategory = async (
  slug: string,
  page = 1
): Promise<MovieListResponse> => {
  const res = await fetch(`${BASE_URL}/v1/api/the-loai/${slug}?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch movies by category');
  const data = await res.json();
  return {
    items: data.data?.items || [],
    pagination: data.data?.params?.pagination || {
      totalItems: 0,
      totalItemsPerPage: 24,
      currentPage: page,
      totalPages: 1,
    },
  };
};

// Fetch movies by country
export const fetchMoviesByCountry = async (
  slug: string,
  page = 1
): Promise<MovieListResponse> => {
  const res = await fetch(`${BASE_URL}/v1/api/quoc-gia/${slug}?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch movies by country');
  const data = await res.json();
  return {
    items: data.data?.items || [],
    pagination: data.data?.params?.pagination || {
      totalItems: 0,
      totalItemsPerPage: 24,
      currentPage: page,
      totalPages: 1,
    },
  };
};

// Fetch movies by year
export const fetchMoviesByYear = async (
  year: string,
  page = 1
): Promise<MovieListResponse> => {
  const res = await fetch(`${BASE_URL}/v1/api/nam/${year}?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch movies by year');
  const data = await res.json();
  return {
    items: data.data?.items || [],
    pagination: data.data?.params?.pagination || {
      totalItems: 0,
      totalItemsPerPage: 24,
      currentPage: page,
      totalPages: 1,
    },
  };
};

// Search movies
export const searchMovies = async (
  keyword: string,
  page = 1
): Promise<MovieListResponse> => {
  const res = await fetch(
    `${BASE_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`
  );
  if (!res.ok) throw new Error('Failed to search movies');
  const data = await res.json();
  return {
    items: data.data?.items || [],
    pagination: data.data?.params?.pagination || {
      totalItems: 0,
      totalItemsPerPage: 24,
      currentPage: page,
      totalPages: 1,
    },
  };
};

// Get watch history from localStorage
export const getWatchHistory = (): Record<string, { episode: string; time: number }> => {
  if (typeof window === 'undefined') return {};
  const history = localStorage.getItem('tmovie_watch_history');
  return history ? JSON.parse(history) : {};
};

// Save watch history to localStorage
export const saveWatchHistory = (slug: string, episode: string, time: number): void => {
  if (typeof window === 'undefined') return;
  const history = getWatchHistory();
  history[slug] = { episode, time };
  localStorage.setItem('tmovie_watch_history', JSON.stringify(history));
};
