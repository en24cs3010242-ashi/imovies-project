import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, Cpu, Database, Server, Smartphone, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="container py-4">
      {/* Header */}
      <div className="text-center py-5">
        <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-15 text-primary mb-3 shadow">
          <Film size={40} />
        </div>
        <h1 className="display-5 fw-extrabold text-white mb-2">About IMovies</h1>
        <p className="text-secondary lead fs-6 col-md-8 mx-auto mb-4">
          Movie Ticket Booking Made Simple — A full-stack MERN cinema ticketing web application engineered with professional standards, responsive UI, robust database integrity, and server-side concurrency safeguards.
        </p>
        <Link to="/movies" className="btn btn-cinema-primary btn-lg px-4">
          Explore Current Movies
        </Link>
      </div>

      {/* Tech Stack Pillars */}
      <div className="row g-4 mb-5">
        <div className="col-md-3 col-sm-6">
          <div className="cinema-card p-4 text-center h-100">
            <div className="p-3 rounded-circle bg-primary bg-opacity-20 text-primary d-inline-block mb-3">
              <Cpu size={28} />
            </div>
            <h5 className="text-white fw-bold mb-1">Frontend UI</h5>
            <p className="text-secondary small mb-0">
              React.js, React Router, Bootstrap 5, Context API, Lucide Icons, and responsive design.
            </p>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="cinema-card p-4 text-center h-100">
            <div className="p-3 rounded-circle bg-success bg-opacity-20 text-success d-inline-block mb-3">
              <Server size={28} />
            </div>
            <h5 className="text-white fw-bold mb-1">RESTful Backend</h5>
            <p className="text-secondary small mb-0">
              Node.js, Express.js, JWT authentication, bcrypt.js, Helmet, and express-rate-limit.
            </p>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="cinema-card p-4 text-center h-100">
            <div className="p-3 rounded-circle bg-warning bg-opacity-20 text-warning d-inline-block mb-3">
              <Database size={28} />
            </div>
            <h5 className="text-white fw-bold mb-1">Database & ODM</h5>
            <p className="text-secondary small mb-0">
              MongoDB with Mongoose schemas, compound indexes, TTL expiration, and Atlas connectivity.
            </p>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="cinema-card p-4 text-center h-100">
            <div className="p-3 rounded-circle bg-info bg-opacity-20 text-info d-inline-block mb-3">
              <ShieldCheck size={28} />
            </div>
            <h5 className="text-white fw-bold mb-1">Security & Testing</h5>
            <p className="text-secondary small mb-0">
              Role-based access control (User/Admin), automated Supertest test suites, input validation.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Mode Notice Card */}
      <div className="cinema-card p-4 p-md-5 mb-5 border-primary border-opacity-50 shadow">
        <div className="d-flex align-items-start gap-3">
          <div className="p-3 rounded bg-warning bg-opacity-20 text-warning d-none d-sm-block">
            <ShieldCheck size={36} />
          </div>
          <div>
            <span className="badge bg-warning text-dark fw-bold mb-2">ACADEMIC & EVALUATION READY</span>
            <h4 className="text-white fw-bold mb-2">Simulated Demo Payment Workflow</h4>
            <p className="text-secondary small mb-3">
              This application includes a built-in mock payment sandbox designed for testing and portfolio evaluations without needing third-party payment provider credentials or live credit cards.
            </p>
            <ul className="text-secondary small mb-0 ps-3">
              <li>Test Successful Payment: Authorizes simulated funds and confirms booking.</li>
              <li>Test Failed Payment: Demonstrates bank decline handling and error states.</li>
              <li>Test Cancel Payment: Aborts transaction and immediately releases reserved seats.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Platform Features Grid */}
      <div className="mb-5">
        <h3 className="text-white fw-bold text-center mb-4">Core Platform Capabilities</h3>
        <div className="row g-3">
          {[
            'JWT Authentication with bcrypt password hashing',
            'Full Movie Catalog with search, filters (Genre, Language, City, Date), and sorting',
            'Interactive visual cinema seating chart (VIP, Premium, Standard tiers)',
            'Atomic 10-minute temporary seat reservation holds with TTL expiration',
            'Server-side price recalculation preventing client tampering',
            'Booking history dashboard with status tracking and self-service cancellation',
            'Comprehensive Admin Portal: Movies CRUD, Theatres, Screens, Showtimes, and Users',
            'Responsive design tested across desktop, tablet, and mobile displays'
          ].map((item, index) => (
            <div key={index} className="col-md-6">
              <div className="cinema-card p-3 d-flex align-items-center gap-3">
                <CheckCircle2 size={20} className="text-primary flex-shrink-0" />
                <span className="text-light small">{item}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;

