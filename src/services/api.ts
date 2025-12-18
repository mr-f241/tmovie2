import { securityClient } from '@/lib/security';
import type { Movie, MovieDetail, Category, Country, MovieListResponse } from '@/types/movie';

// Helper to convert image URLs
export const getImageUrl = (url: string): string => {
  if (!url) return '/placeholder.svg';
  if (url.startsWith('http')) return url;
  return `https://phimimg.com/${url}`;
};

// Fetch new/updated movies via secure proxy
export const fetchNewMovies = async (page = 1): Promise<MovieListResponse> => {
  try {
    const data = await securityClient.request<any>('movies', { page });
    return {
      items: data.items || [],
      pagination: data.pagination || {
        totalItems: 0,
        totalItemsPerPage: 24,
        currentPage: page,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error('Failed to fetch new movies:', error);
    return { items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page, totalPages: 1 } };
  }
};

// Fetch movies by type via secure proxy
export const fetchMoviesByType = async (type: string, page = 1): Promise<MovieListResponse> => {
  try {
    const data = await securityClient.request<any>('moviesByType', { type, page });
    return {
      items: data.data?.items || [],
      pagination: data.data?.params?.pagination || {
        totalItems: 0,
        totalItemsPerPage: 24,
        currentPage: page,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error('Failed to fetch movies by type:', error);
    return { items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page, totalPages: 1 } };
  }
};

// Fetch movie detail via secure proxy
export const fetchMovieDetail = async (slug: string): Promise<MovieDetail | null> => {
  try {
    const data = await securityClient.request<any>('detail', { slug });
    return data.movie ? { ...data.movie, episodes: data.episodes || [] } : null;
  } catch (error) {
    console.error('Failed to fetch movie detail:', error);
    return null;
  }
};

// Fetch categories via secure proxy
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const data = await securityClient.request<any>('categories', {});
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data?.items)) return data.data.items;
    return [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

// Fetch countries via secure proxy
export const fetchCountries = async (): Promise<Country[]> => {
  try {
    const data = await securityClient.request<any>('countries', {});
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data?.items)) return data.data.items;
    return [];
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    return [];
  }
};

// Fetch movies by category via secure proxy
export const fetchMoviesByCategory = async (slug: string, page = 1): Promise<MovieListResponse> => {
  try {
    const data = await securityClient.request<any>('moviesByCategory', { slug, page });
    return {
      items: data.data?.items || [],
      pagination: data.data?.params?.pagination || {
        totalItems: 0,
        totalItemsPerPage: 24,
        currentPage: page,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error('Failed to fetch movies by category:', error);
    return { items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page, totalPages: 1 } };
  }
};

// Fetch movies by country via secure proxy
export const fetchMoviesByCountry = async (slug: string, page = 1): Promise<MovieListResponse> => {
  try {
    const data = await securityClient.request<any>('moviesByCountry', { slug, page });
    return {
      items: data.data?.items || [],
      pagination: data.data?.params?.pagination || {
        totalItems: 0,
        totalItemsPerPage: 24,
        currentPage: page,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error('Failed to fetch movies by country:', error);
    return { items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page, totalPages: 1 } };
  }
};

// Fetch movies by year via secure proxy
export const fetchMoviesByYear = async (year: string, page = 1): Promise<MovieListResponse> => {
  try {
    const data = await securityClient.request<any>('moviesByYear', { year, page });
    return {
      items: data.data?.items || [],
      pagination: data.data?.params?.pagination || {
        totalItems: 0,
        totalItemsPerPage: 24,
        currentPage: page,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error('Failed to fetch movies by year:', error);
    return { items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page, totalPages: 1 } };
  }
};

// Search movies via secure proxy
export const searchMovies = async (keyword: string, page = 1): Promise<MovieListResponse> => {
  try {
    const data = await securityClient.request<any>('search', { keyword, page });
    return {
      items: data.data?.items || [],
      pagination: data.data?.params?.pagination || {
        totalItems: 0,
        totalItemsPerPage: 24,
        currentPage: page,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error('Failed to search movies:', error);
    return { items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page, totalPages: 1 } };
  }
};

// Legacy localStorage functions (now using encrypted storage)
import { secureStorage } from '@/lib/crypto';

export const getWatchHistory = (): Record<string, { episode: string; time: number }> => {
  return secureStorage.get('watch_history_legacy', {});
};

export const saveWatchHistory = (slug: string, episode: string, time: number): void => {
  const history = getWatchHistory();
  history[slug] = { episode, time };
  secureStorage.set('watch_history_legacy', history);
};
