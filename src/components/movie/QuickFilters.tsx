import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronDown, Globe, Calendar, Filter, X } from 'lucide-react';
import { fetchCategories, fetchCountries } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const years = Array.from({ length: 15 }, (_, i) => 2024 - i);

export const QuickFilters = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 30 * 60 * 1000,
  });

  const clearFilters = () => {
    setSelectedCountry(null);
    setSelectedYear(null);
  };

  const hasFilters = selectedCountry || selectedYear;

  return (
    <section className="py-6">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Lọc nhanh
          </h2>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3">
          {/* Country Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={selectedCountry ? 'default' : 'secondary'}
                className="gap-2"
              >
                <Globe className="h-4 w-4" />
                {selectedCountry || 'Quốc gia'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem onClick={() => setSelectedCountry(null)}>
                Tất cả quốc gia
              </DropdownMenuItem>
              {countries?.map((country: any) => (
                <DropdownMenuItem
                  key={country.slug}
                  onClick={() => setSelectedCountry(country.name)}
                  asChild
                >
                  <Link to={`/quoc-gia/${country.slug}`}>{country.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Year Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={selectedYear ? 'default' : 'secondary'}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                {selectedYear || 'Năm'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem onClick={() => setSelectedYear(null)}>
                Tất cả năm
              </DropdownMenuItem>
              {years.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => setSelectedYear(String(year))}
                  asChild
                >
                  <Link to={`/nam/${year}`}>{year}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Country Badges */}
          <div className="hidden lg:flex items-center gap-2 ml-4">
            {['Hàn Quốc', 'Trung Quốc', 'Mỹ', 'Nhật Bản', 'Thái Lan'].map((country) => {
              const countryData = countries?.find(
                (c: any) => c.name.toLowerCase().includes(country.toLowerCase())
              );
              if (!countryData) return null;
              return (
                <Link key={country} to={`/quoc-gia/${countryData.slug}`}>
                  <Badge
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    {country}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
