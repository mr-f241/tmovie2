export interface Movie {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  type: 'series' | 'single' | 'hoathinh' | 'tvshows';
  poster_url: string;
  thumb_url: string;
  sub_docquyen: boolean;
  chipiembed: boolean;
  episode_current: string;
  quality: string;
  lang: string;
  time: string;
  year: number;
  category: Category[];
  country: Country[];
}

export interface MovieDetail extends Movie {
  content: string;
  status: string;
  showtimes: string;
  episode_total: string;
  view: number;
  actor: string[];
  director: string[];
  trailer_url: string;
  episodes: Episode[];
}

export interface Episode {
  server_name: string;
  server_data: EpisodeData[];
}

export interface EpisodeData {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
}

export interface ApiResponse<T> {
  status: string;
  msg: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  params: {
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      itemsPerPage: number;
    };
  };
}

export interface HomeData {
  seoOnPage: {
    titleHead: string;
    descriptionHead: string;
  };
  items: Movie[];
}

export interface MovieListResponse {
  items: Movie[];
  pagination: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  keyword?: string;
  category?: string;
  country?: string;
  year?: string;
  type?: string;
  sort?: 'modified.time' | 'year';
}
