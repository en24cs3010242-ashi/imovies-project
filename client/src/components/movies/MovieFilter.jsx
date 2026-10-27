import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

const MovieFilter = ({
  search,
  setSearch,
  genre,
  setGenre,
  language,
  setLanguage,
  city,
  setCity,
  date,
  setDate,
  sortBy,
  setSortBy,
  genres = [],
  languages = [],
  cities = [],
  onClearFilters
}) => {
  return (
    <div className="cinema-card p-4 mb-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="text-white mb-0 d-flex align-items-center gap-2">
          <Filter size={18} className="text-primary" />
          <span>Find & Filter Movies</span>
        </h5>
        <button
          onClick={onClearFilters}
          className="btn btn-sm btn-cinema-secondary text-secondary py-1 px-2 d-flex align-items-center gap-1"
          title="Reset all filters"
        >
          <RotateCcw size={14} />
          <span>Clear All</span>
        </button>
      </div>

      <div className="row g-3">
        {/* Search */}
        <div className="col-lg-4 col-md-6">
          <label className="form-label small text-secondary">Search Title or Keyword</label>
          <div className="position-relative">
            <input
              type="text"
              className="form-control cinema-input ps-5"
              placeholder="e.g. Oppenheimer, Dune..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search
              size={16}
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
            />
          </div>
        </div>

        {/* Genre */}
        <div className="col-lg-2 col-md-3 col-6">
          <label className="form-label small text-secondary">Genre</label>
          <select
            className="form-select cinema-select"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            <option value="All">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="col-lg-2 col-md-3 col-6">
          <label className="form-label small text-secondary">Language</label>
          <select
            className="form-select cinema-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="All">All Languages</option>
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* City / Location */}
        <div className="col-lg-2 col-md-3 col-6">
          <label className="form-label small text-secondary">City</label>
          <select
            className="form-select cinema-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="All">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="col-lg-2 col-md-3 col-6">
          <label className="form-label small text-secondary">Sort By</label>
          <select
            className="form-select cinema-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating">Top Rated</option>
            <option value="releaseDate">Release Date</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default MovieFilter;

