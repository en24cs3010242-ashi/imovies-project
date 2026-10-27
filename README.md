IMovies — Movie Ticket Booking Made Simple 🎬
A modern, full-stack MERN (MongoDB, Express.js, React.js, Node.js) cinema ticketing web application designed with a dark, cinema-inspired user interface, real-time interactive seat selection, server-side concurrency safeguards, role-based access control, a simulated demo payment gateway, and an administrative management suite.
🌟 Key Application Features
👤 Module A: User Authentication & Profile
- Secure Registration & Login: Validated email, name, phone, and password using JWT authentication and bcrypt.js salt hashing (10 rounds).
- Role-Based Authorization: Separate roles for standard cinema patrons (user) and authorized cinema staff (admin).
- Profile Management: View and update profile details (name, phone number, joined date, order summary).
- Session Security: Non-conflicting token storage, authorization middleware with Bearer token inspection, and auto-logout on token expiration.
🎥 Module B & C: Movie Discovery & Details
- Dynamic Catalog: Browse active releases (Now Showing) and upcoming premieres (Coming Soon).
- Multi-Criteria Filtering: Filter by genre, audio language, cinema city (New York, Los Angeles, Chicago, Mumbai, London), and show date.
- Search & Sorting: Full-text keyword matching on title and description; sort by rating, release date, or alphabetical title.
- Dedicated Movie Details: High-resolution poster and banner imagery, rating badge, duration, genres, director, starring cast, and showtimes grouped by theatre.
🏛️ Module D & E: Theatres, Screens & Interactive Seating
- Multi-Screen Auditoriums: Multiple screen layouts per theatre with tier-based pricing (VIP rows A-B, Premium rows C-E, Standard rows F-H).
- Interactive Seating Chart: Real-time visual seat map featuring a curved cinema screen, color-coded seat legend, dynamic subtotal calculations, and seat limit controls (up to 8 seats).
- Atomic Reservation Hold: 10-minute temporary seat lock preventing race conditions and double bookings.
- Conflict Prevention: Server-side validation rejecting conflicting showtimes on identical screens and timeslots.
🎟️ Module F & G: Booking Workflow & Demo Payment
- End-to-End Workflow: Movie ➔ Theatre & Showtime ➔ Seats ➔ Summary ➔ Checkout ➔ Demo Payment ➔ Confirmation Pass.
- Server Price Recalculation: Independent recalculation of tickets, $1.50/seat convenience fee, and 5% cinema tax to prevent client price tampering.
- Demo Payment Gateway: A sandboxed simulation gateway providing three test triggers:
  1. Simulate Successful Payment: Authorizes test funds, marks seats as booked, and issues digital pass.
  2. Simulate Failed Payment: Simulates bank decline, keeping seats held for retry.
  3. Cancel Payment: Aborts transaction and immediately releases reserved seats.
- Digital E-Ticket Pass: Formatted ticket with unique booking reference (IMV-XXXXXX), customer name, showtime details, seats list, print receipt action, and simulated barcode.
- Self-Service Cancellation: Patrons can cancel bookings up to 2 hours before showtime; booked seats are automatically freed back into general inventory and status updates to Cancelled / Refunded.
🛡️ Module H & I: User & Admin Dashboards
- User Dashboard (My Bookings): Filter bookings by Upcoming Shows, Past Shows, and Cancelled, with full ticket details and cancellation actions.
- Admin Analytics Dashboard: High-level statistical cards (Total Users, Total Movies, Total Theatres, Scheduled Showtimes, Total Bookings, Demo Revenue) and recent transaction ledgers.
- Admin Management Suite:
  - Movies CRUD: Add new movies with validation, edit details, or delete movies.
  - Theatres & Screens: Add new cinema complexes, configure auditorium seat capacities and layouts.
  - Showtimes: Schedule screenings with conflict detection, set tier pricing, or cancel shows.
  - Bookings Oversight: Search all system bookings by reference, filter by status, view patron contact info.
  - User Management: Inspect patron accounts, toggle user active status, and promote/demote administrator privileges.
🛠️ Technology Stack
Layer	Technologies
Frontend	React 18, React Router v6, Bootstrap 5, React-Bootstrap, Lucide React, Axios, HTML5, CSS3
Backend	Node.js (v18+ / v20+ / v24+), Express.js 4, RESTful APIs, JWT (jsonwebtoken), bcryptjs
Security	Helmet security headers, CORS origin filtering, express-rate-limit, express-validator
Database	MongoDB with Mongoose ODM, MongoDB Atlas support, automatic embedded In-Memory MongoDB fallback
Testing	Jest, Supertest (16 automated integration tests covering Auth, Discovery, Seats, Booking, and RBAC)


📂 Project Directory Structure
imovies/
├── client/                     # Frontend React (Vite) Application
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Navbar, Footer, LoadingSpinner, AlertBanner, ProtectedRoute
│   │   │   ├── movies/         # MovieCard, MovieFilter, MovieGrid
│   │   │   ├── seats/          # SeatGrid, SeatLegend, BookingSummaryCard
│   │   │   └── admin/          # AdminSidebar, AdminStatCard
│   │   ├── context/            # AuthContext, BookingContext
│   │   ├── layouts/            # MainLayout, AdminLayout
│   │   ├── pages/              # 19 Full-Stack Pages
│   │   │   ├── admin/          # AdminDashboard, AdminMovies, AdminTheatres, etc.
│   │   │   ├── Home.jsx
│   │   │   ├── Movies.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── ShowtimeSelection.jsx
│   │   │   ├── SeatSelection.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── PaymentResult.jsx
│   │   │   ├── BookingConfirmation.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── BookingDetails.jsx
│   │   │   ├── About.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/           # Axios API services (auth, movies, showtimes, bookings, etc.)
│   │   ├── utils/              # Currency/Date formatters and constants
│   │   ├── App.jsx             # React routing declaration
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Cinematic dark theme & seat layout styles
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Express REST API
│   ├── config/                 # MongoDB connection & memory-server fallback (db.js)
│   ├── controllers/            # Auth, Movies, Theatres, Showtimes, Bookings, Payments, Admin
│   ├── middleware/             # Auth JWT guard, Admin role guard, Rate limiting, Error handler
│   ├── models/                 # Mongoose schemas: User, Movie, Theatre, Screen, Showtime, Booking, SeatReservation, Payment
│   ├── routes/                 # REST API endpoints definition
│   ├── services/               # Seat locking logic, booking calculations, demo payment engine
│   ├── validators/             # Request payload sanitization rules
│   ├── utils/                  # Token generation, booking reference generators
│   ├── scripts/                # Database seed script (seed.js)
│   ├── tests/                  # Automated integration tests (api.test.js)
│   ├── app.js                  # Express middleware & route mounting
│   ├── server.js               # HTTP server bootstrap & auto-seeding
│   ├── package.json
│   └── .env                    # Server environment variables
├── .env.example                # Example environment configuration
├── .gitignore
├── package.json                # Root package with concurrently commands
└── README.md
⚙️ Environment Variables Setup
Create a .env file in the server/ directory (or use root .env):
NODE_ENV=development
PORT=5001

# MongoDB Connection String (Atlas or Local MongoDB)
# Leave as localhost or set to 'memory' to use the zero-configuration embedded in-memory MongoDB fallback
MONGODB_URI=mongodb://127.0.0.1:27017/imovies

# JWT Authentication
JWT_SECRET=imovies_development_jwt_secret_token_key_2026
JWT_EXPIRE=7d

# CORS Client URL
CLIENT_URL=http://localhost:5173

# Initial Administrator Credentials (used during automatic seeding)
ADMIN_NAME=IMovies Administrator
ADMIN_EMAIL=admin@imovies.com
ADMIN_PASSWORD=Admin@123456
ADMIN_PHONE=+1 (555) 019-2834
Note on MongoDB: If you do not have a local MongoDB instance running or an Atlas connection URI configured, the server will automatically fall back to an embedded in-memory MongoDB instance. This guarantees the application works out-of-the-box for evaluators with zero database setup required!

🚀 Installation & Running the Project
1. Install All Dependencies
Run from the project root:
npm run install:all
(Or install in each directory: npm install && cd server && npm install && cd ../client && npm install)
2. Database Seeding (Optional Manual Step)
The database auto-seeds on first startup, but you can manually seed at any time:
npm run seed
3. Start Development Servers (Concurrent Backend + Frontend)
Run both backend and frontend simultaneously:
npm run dev
- Frontend App: http://localhost:5173
- Backend REST API: http://localhost:5001
- API Health Check: http://localhost:5001/api/health
4. Production Build & Unified Server
To build the frontend and serve both backend and frontend from a single port (5001):
npm run build
npm start
Open: http://localhost:5001
🔑 Pre-Configured Demo Accounts
Role	Email	Password	Permissions
Administrator	admin@imovies.com	Admin@123456	Full Admin Dashboard, Movies CRUD, Theatres, Screens, Showtimes, Users Management
Demo User	alex@example.com	Password@123	Browsing, Reserving Seats, Checkout, Demo Payments, My Bookings, Profile
Demo User 2	sophia@example.com	Password@123	Additional user for testing multi-user seat concurrency & privacy controls


(On the Login screen, click the "Demo User" or "Demo Admin" quick buttons to autofill credentials instantly)
🧪 Running Automated Tests
Run the complete backend integration test suite:
npm test
Automated Test Coverage (16 Tests):
- ✅ 1. Valid registration succeeds and returns JWT token
- ✅ 2. Duplicate email registration fails with 409 Conflict
- ✅ 3. Invalid login credentials fail with 401 Unauthorized
- ✅ 4. Non-admin users cannot access admin dashboard API (403 Forbidden)
- ✅ 5. Admin user can successfully access admin dashboard API
- ✅ 6. GET /api/movies retrieves movie list with pagination & filters
- ✅ 7. Search movies by title returns filtered results
- ✅ 8. GET /api/movies/:id returns movie details and scheduled showtimes
- ✅ 9. GET /api/showtimes/:id/seats returns cinema grid layout & seat statuses
- ✅ 10. User can reserve available seats (POST /api/showtimes/:id/reservations)
- ✅ 11. Another user cannot reserve the currently held seats (409 Conflict)
- ✅ 12. Creating a booking calculates total prices accurately on server
- ✅ 13. User cannot view another private user booking (403 Forbidden)
- ✅ 14. Demo payment simulation confirms booking and marks seats booked
- ✅ 15. Confirmed seats cannot be reserved by another user (409 Conflict)
- ✅ 16. Booking cancellation successfully frees seats and updates status
📡 REST API Endpoint Documentation
Authentication (/api/auth)
- POST /api/auth/register — Register a new account (name, email, password, phone)
- POST /api/auth/login — Login with credentials; returns JWT token & user object
- GET /api/auth/me — Retrieve current authenticated user profile (Protected)
- PUT /api/auth/profile — Update account profile details (Protected)
Movies (/api/movies)
- GET /api/movies — List movies with search, genre, language, city, date, sort, pagination
- GET /api/movies/:id — Get movie details + upcoming scheduled showtimes
- POST /api/movies — Create a movie (Admin only)
- PUT /api/movies/:id — Update movie details (Admin only)
- DELETE /api/movies/:id — Remove movie and deactivate future shows (Admin only)
Theatres & Screens (/api/theatres)
- GET /api/theatres — List all active theatres with associated screens
- GET /api/theatres/:id — Get theatre details with screens and active showtimes
- POST /api/theatres — Create theatre complex (Admin only)
- PUT /api/theatres/:id — Update theatre information (Admin only)
- DELETE /api/theatres/:id — Deactivate theatre (Admin only)
- POST /api/theatres/:id/screens — Add screen auditorium to theatre (Admin only)
Showtimes & Seat Availability (/api/showtimes)
- GET /api/showtimes — Query showtimes by movieId, theatreId, date, city
- GET /api/showtimes/:id — Single showtime details
- POST /api/showtimes — Schedule new showtime with conflict detection (Admin only)
- PUT /api/showtimes/:id — Update showtime (Admin only)
- DELETE /api/showtimes/:id — Cancel showtime (Admin only)
- GET /api/showtimes/:id/seats — Visual seat grid with live seat status (Available, Selected, Reserved, Booked)
- POST /api/showtimes/:id/reservations — Temporary 10-minute seat hold (Protected)
- DELETE /api/showtimes/:id/reservations — Release held seats (Protected)
Bookings (/api/bookings)
- POST /api/bookings — Create a pending booking order with server-calculated prices (Protected)
- GET /api/bookings/my — Get logged-in user's booking history (Protected)
- GET /api/bookings/:id — Get single booking details (Protected, user ownership checked)
- PATCH /api/bookings/:id/cancel — Cancel booking & release seats (Protected, policy enforced)
Demo Payments (/api/payments)
- POST /api/payments/demo — Process simulated payment (action: 'success' | 'failed' | 'cancel') (Protected)
- GET /api/payments/:id — Retrieve transaction record (Protected)
Administration (/api/admin)
- GET /api/admin/dashboard — Platform statistics (users, movies, theatres, showtimes, bookings, revenue)
- GET /api/admin/bookings — Search and filter all customer bookings
- GET /api/admin/users — User directory with order aggregates
- PATCH /api/admin/users/:id — Toggle patron role or account status
🔒 Security Best Practices Implemented
1. Password Hashing: Salts and hashes passwords via bcryptjs with 10 salt rounds. Passwords are never returned in queries (select: false).
2. JWT Security: Signed tokens with configured expiration (JWT_EXPIRE). Verified through Express middleware.
3. Price Integrity: Clients never send total prices. The server re-computes subtotal, taxes, and fees based on verified showtime pricing.
4. Double-Booking Prevention: Seat holds utilize atomic checks and MongoDB TTL indexes to automatically clean up abandoned checkouts after 10 minutes.
5. Ownership Isolation: Non-admin users cannot access, view, or cancel another user's bookings.
6. Input Sanitization: Request bodies sanitized and validated via express-validator.
7. Rate Limiting: Brute-force protection applied to auth endpoints via express-rate-limit.
8. HTTP Security Headers: helmet headers applied to protect against common web vulnerabilities.
❓ Troubleshooting
- Port 5000 in use on macOS: On macOS Monterey/Ventura/Sonoma, ControlCenter (AirPlay Receiver) reserves port 5000. IMovies defaults to port 5001 to completely prevent this issue.
- MongoDB Connection: If MongoDB is not installed locally, no action is needed. The server automatically launches the built-in embedded in-memory MongoDB database and seeds demo data on launch.
- Reset Database: Run npm run seed to re-seed demo movies, theatres, screens, and showtimes at any time.
📄 License & Evaluation Notice
This project is built as a capstone full-stack MERN application. All cinema imagery is used for demonstration purposes. Demo payment features are purely educational simulations and do not collect real payment credentials
