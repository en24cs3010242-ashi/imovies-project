const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Showtime = require('../models/Showtime');
const SeatReservation = require('../models/SeatReservation');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { generateBookingReference, generateTransactionId } = require('../utils/bookingReference');

const seedDatabase = async () => {
  console.log('[Seed] Starting database seeding process...');

  // Clear existing collections safely
  await Promise.all([
    User.deleteMany({}),
    Movie.deleteMany({}),
    Theatre.deleteMany({}),
    Screen.deleteMany({}),
    Showtime.deleteMany({}),
    SeatReservation.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({})
  ]);

  // 1. Seed Users (pass raw password; User model pre('save') hashes it)
  const adminUser = await User.create({
    name: process.env.ADMIN_NAME || 'IMovies Administrator',
    email: (process.env.ADMIN_EMAIL || 'admin@imovies.com').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    phone: process.env.ADMIN_PHONE || '+1 (555) 019-2834',
    role: 'admin',
    isActive: true
  });

  const demoUser = await User.create({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    password: 'Password@123',
    phone: '+1 (555) 234-5678',
    role: 'user',
    isActive: true
  });

  const secondUser = await User.create({
    name: 'Sophia Martinez',
    email: 'sophia@example.com',
    password: 'Password@123',
    phone: '+1 (555) 876-5432',
    role: 'user',
    isActive: true
  });

  console.log(`[Seed] Seeded 3 users: 1 Admin (${adminUser.email}), 2 Demo Users`);

  // 2. Seed Theatres
  const theatresData = [
    {
      name: 'CineStar IMAX & Dolby Dome',
      location: '742 Evergreen Terrace, Downtown',
      city: 'New York',
      amenities: ['IMAX Laser 4K', 'Dolby Atmos', 'VIP Recliners', 'Gourmet Bar', 'Valet Parking']
    },
    {
      name: 'Grand Horizon Cinema',
      location: '8840 Sunset Boulevard, West Hollywood',
      city: 'Los Angeles',
      amenities: ['4K Laser Projection', 'Dolby 7.1', 'Luxury Loungers', 'In-Seat Dining']
    },
    {
      name: 'Regal Millennium Theatre',
      location: '120 North Michigan Avenue',
      city: 'Chicago',
      amenities: ['RPX Big Screen', 'Dolby Atmos', 'Electric Recliners', 'Café & Lounge']
    },
    {
      name: 'PVR Phoenix Superplex',
      location: 'High Street Phoenix, Lower Parel',
      city: 'Mumbai',
      amenities: ['IMAX 3D', 'Gold Class Lounge', 'Dolby Atmos', 'Gourmet Kitchen']
    },
    {
      name: 'Odeon Luxe Cinema',
      location: '24-28 Leicester Square',
      city: 'London',
      amenities: ['Dolby Cinema', 'Luxury Recliner Seats', 'Oscar Bar', 'Wheelchair Access']
    }
  ];

  const createdTheatres = await Theatre.insertMany(theatresData);
  console.log(`[Seed] Seeded ${createdTheatres.length} theatres across 5 cities`);

  // 3. Seed Screens for each theatre
  const createdScreens = [];
  for (const theatre of createdTheatres) {
    // Screen 1: IMAX/Premium
    const screen1 = await Screen.create({
      theatre: theatre._id,
      screenNumber: 1,
      name: 'Screen 1 - Laser 4K Audio',
      seatingCapacity: 80,
      seatLayout: {
        rows: 8,
        columns: 10,
        tiers: [
          { tierName: 'VIP', rows: ['A', 'B'], priceMultiplier: 1.5 },
          { tierName: 'Premium', rows: ['C', 'D', 'E'], priceMultiplier: 1.25 },
          { tierName: 'Standard', rows: ['F', 'G', 'H'], priceMultiplier: 1.0 }
        ]
      }
    });

    // Screen 2: Standard/Atmos
    const screen2 = await Screen.create({
      theatre: theatre._id,
      screenNumber: 2,
      name: 'Screen 2 - Dolby Atmos Classic',
      seatingCapacity: 80,
      seatLayout: {
        rows: 8,
        columns: 10,
        tiers: [
          { tierName: 'VIP', rows: ['A', 'B'], priceMultiplier: 1.5 },
          { tierName: 'Premium', rows: ['C', 'D', 'E'], priceMultiplier: 1.25 },
          { tierName: 'Standard', rows: ['F', 'G', 'H'], priceMultiplier: 1.0 }
        ]
      }
    });

    createdScreens.push(screen1, screen2);
  }
  console.log(`[Seed] Seeded ${createdScreens.length} screens`);

  // 4. Seed Movies
  const moviesData = [
    {
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.',
      genre: ['Sci-Fi', 'Adventure', 'Action', 'Drama'],
      language: ['English'],
      duration: 166,
      rating: 8.6,
      releaseDate: new Date('2024-03-01'),
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Josh Brolin'],
      status: 'Now Showing',
      featured: true
    },
    {
      title: 'Oppenheimer',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral and scientific complexity that shaped modern history.',
      genre: ['Biography', 'Drama', 'History'],
      language: ['English'],
      duration: 180,
      rating: 8.9,
      releaseDate: new Date('2023-07-21'),
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
      director: 'Christopher Nolan',
      cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
      status: 'Now Showing',
      featured: true
    },
    {
      title: 'Interstellar',
      description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
      genre: ['Sci-Fi', 'Adventure', 'Drama'],
      language: ['English', 'Spanish'],
      duration: 169,
      rating: 8.7,
      releaseDate: new Date('2014-11-07'),
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
      status: 'Now Showing',
      featured: true
    },
    {
      title: 'Spider-Man: Across the Spider-Verse',
      description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
      genre: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
      language: ['English', 'Spanish'],
      duration: 140,
      rating: 8.7,
      releaseDate: new Date('2023-06-02'),
      posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
      director: 'Joaquim Dos Santos, Kemp Powers',
      cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Jake Johnson'],
      status: 'Now Showing',
      featured: true
    },
    {
      title: 'The Batman',
      description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.',
      genre: ['Action', 'Crime', 'Drama'],
      language: ['English'],
      duration: 176,
      rating: 7.8,
      releaseDate: new Date('2022-03-04'),
      posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      director: 'Matt Reeves',
      cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano', 'Colin Farrell'],
      status: 'Now Showing',
      featured: false
    },
    {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
      genre: ['Action', 'Sci-Fi', 'Thriller'],
      language: ['English', 'Japanese'],
      duration: 148,
      rating: 8.8,
      releaseDate: new Date('2010-07-16'),
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
      director: 'Christopher Nolan',
      cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
      status: 'Now Showing',
      featured: false
    },
    {
      title: 'Top Gun: Maverick',
      description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN\'s elite graduates on a mission that demands the ultimate sacrifice from those chosen to fly it.',
      genre: ['Action', 'Drama'],
      language: ['English'],
      duration: 130,
      rating: 8.3,
      releaseDate: new Date('2022-05-27'),
      posterUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e60b?auto=format&fit=crop&w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
      director: 'Joseph Kosinski',
      cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly', 'Jon Hamm'],
      status: 'Now Showing',
      featured: false
    },
    {
      title: 'Kalki 2898 AD',
      description: 'A modern avatar of Vishnu, a Hindu god, is believed to have descended to the earth to protect the world from evil forces in a post-apocalyptic world ruled by the Supreme Yaskin.',
      genre: ['Action', 'Sci-Fi', 'Adventure'],
      language: ['Hindi', 'English'],
      duration: 181,
      rating: 7.7,
      releaseDate: new Date('2024-06-27'),
      posterUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
      director: 'Nag Ashwin',
      cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
      status: 'Now Showing',
      featured: true
    },
    {
      title: 'Avatar: The Way of Water',
      description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
      genre: ['Sci-Fi', 'Adventure', 'Action'],
      language: ['English'],
      duration: 192,
      rating: 7.6,
      releaseDate: new Date('2022-12-16'),
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
      director: 'James Cameron',
      cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
      status: 'Now Showing',
      featured: false
    },
    {
      title: 'Gladiator II',
      description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
      genre: ['Action', 'Adventure', 'Drama'],
      language: ['English'],
      duration: 148,
      rating: 7.5,
      releaseDate: new Date('2024-11-22'),
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
      director: 'Ridley Scott',
      cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
      status: 'Coming Soon',
      featured: true
    }
  ];

  const createdMovies = await Movie.insertMany(moviesData);
  console.log(`[Seed] Seeded ${createdMovies.length} movies`);

  // 5. Seed Showtimes for the next 7 days
  const timeSlots = ['10:30', '14:00', '17:30', '21:00'];
  const showtimesToInsert = [];

  const now = new Date();
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayOffset);
    const dateStr = targetDate.toISOString().split('T')[0];

    // Distribute movies across theatres & screens
    for (let tIndex = 0; tIndex < createdTheatres.length; tIndex++) {
      const theatre = createdTheatres[tIndex];
      const theatreScreens = createdScreens.filter(
        s => s.theatre.toString() === theatre._id.toString()
      );

      // Schedule on Screen 1
      if (theatreScreens[0]) {
        const movie1 = createdMovies[(tIndex + dayOffset) % createdMovies.length];
        showtimesToInsert.push({
          movie: movie1._id,
          theatre: theatre._id,
          screen: theatreScreens[0]._id,
          date: dateStr,
          startTime: timeSlots[0],
          endTime: '13:15',
          price: { standard: 13.5, premium: 17.5, vip: 24.0 },
          status: 'Active'
        });

        showtimesToInsert.push({
          movie: movie1._id,
          theatre: theatre._id,
          screen: theatreScreens[0]._id,
          date: dateStr,
          startTime: timeSlots[2],
          endTime: '20:15',
          price: { standard: 14.5, premium: 18.5, vip: 25.0 },
          status: 'Active'
        });
      }

      // Schedule on Screen 2
      if (theatreScreens[1]) {
        const movie2 = createdMovies[(tIndex + dayOffset + 2) % createdMovies.length];
        showtimesToInsert.push({
          movie: movie2._id,
          theatre: theatre._id,
          screen: theatreScreens[1]._id,
          date: dateStr,
          startTime: timeSlots[1],
          endTime: '16:45',
          price: { standard: 12.0, premium: 16.0, vip: 22.0 },
          status: 'Active'
        });

        showtimesToInsert.push({
          movie: movie2._id,
          theatre: theatre._id,
          screen: theatreScreens[1]._id,
          date: dateStr,
          startTime: timeSlots[3],
          endTime: '23:45',
          price: { standard: 13.0, premium: 17.0, vip: 23.5 },
          status: 'Active'
        });
      }
    }
  }

  const createdShowtimes = await Showtime.insertMany(showtimesToInsert);
  console.log(`[Seed] Seeded ${createdShowtimes.length} scheduled showtimes for the week`);

  // 6. Seed a sample Confirmed Booking for demo user Alex Johnson
  const sampleShowtime = createdShowtimes[0];
  const sampleSeats = [
    { seatIdentifier: 'B4', row: 'B', col: 4, tier: 'VIP', price: sampleShowtime.price.vip },
    { seatIdentifier: 'B5', row: 'B', col: 5, tier: 'VIP', price: sampleShowtime.price.vip }
  ];
  const subtotal = sampleSeats.reduce((acc, s) => acc + s.price, 0);
  const convenienceFee = 3.0;
  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const totalAmount = parseFloat((subtotal + convenienceFee + tax).toFixed(2));

  const sampleBookingRef = generateBookingReference();
  const sampleTxnId = generateTransactionId();

  const sampleBooking = await Booking.create({
    bookingReference: sampleBookingRef,
    user: demoUser._id,
    movie: sampleShowtime.movie,
    theatre: sampleShowtime.theatre,
    screen: sampleShowtime.screen,
    showtime: sampleShowtime._id,
    seats: sampleSeats,
    ticketQuantity: 2,
    subtotal,
    convenienceFee,
    tax,
    totalAmount,
    bookingStatus: 'Confirmed',
    paymentStatus: 'Paid'
  });

  const samplePayment = await Payment.create({
    booking: sampleBooking._id,
    user: demoUser._id,
    amount: totalAmount,
    currency: 'USD',
    paymentMethod: 'Demo Card',
    transactionId: sampleTxnId,
    status: 'Success',
    isDemo: true,
    gatewayResponse: { message: 'Demo authorization successful', authCode: 'AUTH-DEMO-SEED' }
  });

  sampleBooking.payment = samplePayment._id;
  await sampleBooking.save();

  // Create corresponding SeatReservations with 'booked' status
  const futureExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await SeatReservation.insertMany([
    {
      showtime: sampleShowtime._id,
      seatIdentifier: 'B4',
      user: demoUser._id,
      status: 'booked',
      booking: sampleBooking._id,
      expiresAt: futureExpiry
    },
    {
      showtime: sampleShowtime._id,
      seatIdentifier: 'B5',
      user: demoUser._id,
      status: 'booked',
      booking: sampleBooking._id,
      expiresAt: futureExpiry
    }
  ]);

  console.log(`[Seed] Seeded sample confirmed booking: ${sampleBookingRef} for ${demoUser.email}`);
  console.log('[Seed] Database seeding completed successfully!');

  return {
    adminUser,
    demoUser,
    moviesCount: createdMovies.length,
    theatresCount: createdTheatres.length,
    showtimesCount: createdShowtimes.length
  };
};

// If run directly via node scripts/seed.js
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');

  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    }
  })();
}

module.exports = seedDatabase;

