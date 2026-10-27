import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieService } from '../services/movieService';
import MovieCard from '../components/movies/MovieCard';
import MovieFilter from '../components/movies/MovieFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertBanner from '../components/common/AlertBanner';
import { Film, SlidersHorizontal } from 'lucide-react';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter lists from server
  const [availableGenres, setAvailableGenres] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  // Filter state synced with URL search params
  const search = searchParams.get('search') || '';
  const genre = searchParams.get('genre') || 'All';
  const language = searchParams.get('language') || 'All';
  const city = searchParams.get('city') || 'All';
  const date = searchParams.get('date') || '';
  const sortBy = searchParams.get('sortBy') || 'rating';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const params = {
          search: search || undefined,
          genre: genre !== 'All' ? genre : undefined,
          language: language !== 'All' ? language : undefined,
          city: city !== 'All' ? city : undefined,
          date: date || undefined,
          sortBy,
          page,
          limit: 12
        };

        const res = await movieService.getMovies(params);
        setMovies(res.movies || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);

        if (res.genres) setAvailableGenres(res.genres);
        if (res.languages) setAvailableLanguages(res.languages);
        if (res.cities) setAvailableCities(res.cities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search, genre, language, city, date, sortBy, page]);

  return (
    <div className="container py-3">
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <span className="text-primary text-uppercase fw-semibold small">Browse Cinema Catalog</span>
          <h2 className="text-white fw-bold mb-0">Explore Movies</h2>
        </div>
        <div className="text-secondary small">
          Showing <span className="text-white fw-bold">{movies.length}</span> of{' '}
          <span className="text-white fw-bold">{total}</span> titles
        </div>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      {/* Filter Component */}
      <MovieFilter
        search={search}
        setSearch={(val) => updateParam('search', val)}
        genre={genre}
        setGenre={(val) => updateParam('genre', val)}
        language={language}
        setLanguage={(val) => updateParam('language', val)}
        city={city}
        setCity={(val) => updateParam('city', val)}
        date={date}
        setDate={(val) => updateParam('date', val)}
        sortBy={sortBy}
        setSortBy={(val) => updateParam('sortBy', val)}
        genres={availableGenres}
        languages={availableLanguages}
        cities={availableCities}
        onClearFilters={handleClearFilters}
      />

      {/* Movie Grid */}
      {loading ? (
        <LoadingSpinner text="Searching movie archives..." />
      ) : movies.length === 0 ? (
        <div className="cinema-card text-center p-5 my-5">
          <Film size={48} className="text-secondary mb-3 opacity-50" />
          <h4 className="text-white fw-bold mb-2">No Movies Found</h4>
          <p className="text-secondary small mb-4">
            We couldn't find any movie matching your current search or filter combination.
          </p>
          <button onClick={handleClearFilters} className="btn btn-cinema-primary">
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mb-5">
            {movies.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 pt-4 border-top border-secondary border-opacity-25">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('page', String(page - 1));
                  setSearchParams(newParams);
                }}
                className="btn btn-cinema-secondary btn-sm px-3"
              >
                Previous
              </button>
              <span className="text-secondary small px-3">
                Page <strong className="text-white">{page}</strong> of{' '}
                <strong className="text-white">{totalPages}</strong>
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('page', String(page + 1));
                  setSearchParams(newParams);
                }}
                className="btn btn-cinema-secondary btn-sm px-3"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Movies;

