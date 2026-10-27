const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Theatre = require('../models/Theatre');

// @desc    Get all movies with search, filter, sort, pagination
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      city,
      date,
      status,
      sortBy = 'rating',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Text search by title or description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Genre filter
    if (genre && genre !== 'All') {
      query.genre = { $in: [genre] };
    }

    // Language filter
    if (language && language !== 'All') {
      query.language = { $in: [language] };
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // City and Date filter through Showtime lookup
    if ((city && city !== 'All') || date) {
      const showtimeFilter = { status: 'Active' };
      if (date) {
        showtimeFilter.date = date;
      }

      if (city && city !== 'All') {
        const theatresInCity = await Theatre.find({ city, isActive: true }).select('_id');
        const theatreIds = theatresInCity.map(t => t._id);
        showtimeFilter.theatre = { $in: theatreIds };
      }

      const activeShowtimes = await Showtime.find(showtimeFilter).select('movie');
      const movieIds = [...new Set(activeShowtimes.map(s => s.movie.toString()))];
      query._id = { $in: movieIds };
    }

    // Sorting
    let sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions.rating = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'releaseDate') {
      sortOptions.releaseDate = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'title') {
      sortOptions.title = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get unique genres, languages, and cities for frontend filters
    const allGenres = await Movie.distinct('genre');
    const allLanguages = await Movie.distinct('language');
    const allCities = await Theatre.distinct('city', { isActive: true });

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      count: movies.length,
      genres: allGenres.sort(),
      languages: allLanguages.sort(),
      cities: allCities.sort(),
      movies
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single movie by ID with showtimes
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }

    // Fetch upcoming showtimes for this movie
    const today = new Date().toISOString().split('T')[0];
    const showtimes = await Showtime.find({
      movie: movie._id,
      date: { $gte: today },
      status: 'Active'
    })
      .populate('theatre')
      .populate('screen')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      movie,
      showtimes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Movie created successfully.',
      movie
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }

    res.json({
      success: true,
      message: 'Movie updated successfully.',
      movie
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }

    // Deactivate future showtimes
    await Showtime.updateMany(
      { movie: movie._id },
      { $set: { status: 'Cancelled' } }
    );

    await movie.deleteOne();

    res.json({
      success: true,
      message: 'Movie removed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};

