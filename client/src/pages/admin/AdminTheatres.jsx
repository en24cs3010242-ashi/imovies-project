import React, { useState, useEffect } from 'react';
import { theatreService } from '../../services/theatreService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertBanner from '../../components/common/AlertBanner';
import {
  Building,
  PlusCircle,
  MapPin,
  Trash2,
  Tv,
  Users
} from 'lucide-react';

const AdminTheatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Theatre Modal
  const [showTheatreModal, setShowTheatreModal] = useState(false);
  const [theatreForm, setTheatreForm] = useState({
    name: '',
    location: '',
    city: 'New York',
    amenities: 'Dolby Atmos, IMAX Laser, VIP Recliners, Food Court'
  });

  // Screen Modal
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [selectedTheatreForScreen, setSelectedTheatreForScreen] = useState(null);
  const [screenForm, setScreenForm] = useState({
    name: 'Screen 2 - Dolby Atmos',
    screenNumber: 2,
    seatingCapacity: 80,
    rows: 8,
    columns: 10
  });

  const [saving, setSaving] = useState(false);

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const res = await theatreService.getTheatres();
      setTheatres(res.theatres || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: theatreForm.name,
        location: theatreForm.location,
        city: theatreForm.city,
        amenities: theatreForm.amenities.split(',').map((s) => s.trim()).filter(Boolean)
      };

      await theatreService.createTheatre(payload);
      setSuccessMessage(`Theatre "${theatreForm.name}" registered with default Screen 1.`);
      setShowTheatreModal(false);
      setTheatreForm({
        name: '',
        location: '',
        city: 'New York',
        amenities: 'Dolby Atmos, IMAX Laser, VIP Recliners, Food Court'
      });
      await fetchTheatres();
    } catch (err) {
      setError(err.message || 'Failed to create theatre.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddScreen = (theatre) => {
    setSelectedTheatreForScreen(theatre);
    const nextNum = (theatre.screens?.length || 0) + 1;
    setScreenForm({
      name: `Screen ${nextNum} - 4K Auditorium`,
      screenNumber: nextNum,
      seatingCapacity: 80,
      rows: 8,
      columns: 10
    });
    setShowScreenModal(true);
  };

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    if (!selectedTheatreForScreen) return;
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: screenForm.name,
        screenNumber: Number(screenForm.screenNumber),
        seatingCapacity: Number(screenForm.seatingCapacity),
        seatLayout: {
          rows: Number(screenForm.rows),
          columns: Number(screenForm.columns),
          tiers: [
            { tierName: 'VIP', rows: ['A', 'B'], priceMultiplier: 1.5 },
            { tierName: 'Premium', rows: ['C', 'D', 'E'], priceMultiplier: 1.25 },
            { tierName: 'Standard', rows: ['F', 'G', 'H'], priceMultiplier: 1.0 }
          ]
        }
      };

      await theatreService.createScreen(selectedTheatreForScreen._id, payload);
      setSuccessMessage(`Screen "${screenForm.name}" added to ${selectedTheatreForScreen.name}.`);
      setShowScreenModal(false);
      await fetchTheatres();
    } catch (err) {
      setError(err.message || 'Failed to add screen.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTheatre = async (theatre) => {
    if (!window.confirm(`Deactivate theatre "${theatre.name}"? Active screens and showtimes will be cancelled.`)) {
      return;
    }
    try {
      setError(null);
      await theatreService.deleteTheatre(theatre._id);
      setSuccessMessage(`Theatre "${theatre.name}" deactivated.`);
      await fetchTheatres();
    } catch (err) {
      setError(err.message || 'Failed to deactivate theatre.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div>
          <span className="text-primary text-uppercase fw-semibold small">Auditoriums & Locations</span>
          <h2 className="text-white fw-bold mb-0">Theatre & Screen Management</h2>
        </div>

        <button onClick={() => setShowTheatreModal(true)} className="btn btn-cinema-primary">
          <PlusCircle size={16} /> Add New Theatre
        </button>
      </div>

      <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      {loading ? (
        <LoadingSpinner text="Loading theatre complexes..." />
      ) : theatres.length === 0 ? (
        <div className="cinema-card p-5 text-center text-secondary">
          No theatres currently registered. Click "Add New Theatre" to create one.
        </div>
      ) : (
        <div className="row g-4">
          {theatres.map((t) => (
            <div key={t._id} className="col-lg-6">
              <div className="cinema-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                        <Building size={18} className="text-primary" />
                        <span>{t.name}</span>
                      </h5>
                      <p className="text-secondary small mb-2 d-flex align-items-center gap-1">
                        <MapPin size={14} className="text-primary" />
                        <span>{t.location}, <strong>{t.city}</strong></span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteTheatre(t)}
                      className="btn btn-sm btn-cinema-danger p-2"
                      title="Deactivate Theatre"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Amenities */}
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {t.amenities?.map((am, idx) => (
                      <span key={idx} className="badge bg-secondary bg-opacity-50 text-secondary small">
                        {am}
                      </span>
                    ))}
                  </div>

                  {/* Screens Section */}
                  <div className="border-top border-secondary border-opacity-25 pt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-white small fw-bold text-uppercase">
                        Screens ({t.screens?.length || 0})
                      </span>
                      <button
                        onClick={() => handleOpenAddScreen(t)}
                        className="btn btn-sm btn-cinema-secondary py-1 px-2 small d-flex align-items-center gap-1"
                      >
                        <PlusCircle size={13} /> Add Screen
                      </button>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {t.screens?.map((scr) => (
                        <div
                          key={scr._id}
                          className="p-2 rounded bg-secondary bg-opacity-10 d-flex justify-content-between align-items-center small"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <Tv size={14} className="text-primary" />
                            <strong className="text-light">{scr.name}</strong>
                          </div>
                          <span className="badge bg-dark border border-secondary text-secondary">
                            {scr.seatingCapacity || 80} Seats ({scr.seatLayout?.rows || 8}×{scr.seatLayout?.columns || 10})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Theatre Modal */}
      {showTheatreModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content cinema-card border-secondary">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title text-white fw-bold">Register New Cinema Theatre</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowTheatreModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTheatre}>
                <div className="modal-body text-secondary small">
                  <div className="mb-3">
                    <label className="form-label text-secondary small">Theatre Complex Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control cinema-input"
                      placeholder="e.g. CineMax Dolby Laser Cinema"
                      value={theatreForm.name}
                      onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small">City *</label>
                    <input
                      type="text"
                      required
                      className="form-control cinema-input"
                      placeholder="e.g. New York, Los Angeles..."
                      value={theatreForm.city}
                      onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small">Street Address / Mall Location *</label>
                    <input
                      type="text"
                      required
                      className="form-control cinema-input"
                      placeholder="e.g. 500 Broadway, Midtown Plaza"
                      value={theatreForm.location}
                      onChange={(e) => setTheatreForm({ ...theatreForm, location: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small">Amenities (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control cinema-input"
                      placeholder="IMAX, Dolby Atmos, Recliners, Food Court"
                      value={theatreForm.amenities}
                      onChange={(e) => setTheatreForm({ ...theatreForm, amenities: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-cinema-secondary" onClick={() => setShowTheatreModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-cinema-primary">
                    {saving ? 'Creating...' : 'Register Theatre'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {showScreenModal && selectedTheatreForScreen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content cinema-card border-secondary">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title text-white fw-bold">Add Screen to {selectedTheatreForScreen.name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowScreenModal(false)}></button>
              </div>
              <form onSubmit={handleCreateScreen}>
                <div className="modal-body text-secondary small">
                  <div className="mb-3">
                    <label className="form-label text-secondary small">Screen Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control cinema-input"
                      value={screenForm.name}
                      onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label text-secondary small">Screen Number *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        className="form-control cinema-input"
                        value={screenForm.screenNumber}
                        onChange={(e) => setScreenForm({ ...screenForm, screenNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Capacity *</label>
                      <input
                        type="number"
                        required
                        className="form-control cinema-input"
                        value={screenForm.seatingCapacity}
                        onChange={(e) => setScreenForm({ ...screenForm, seatingCapacity: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label text-secondary small">Seat Rows (e.g. 8 for A-H)</label>
                      <input
                        type="number"
                        min="4"
                        max="12"
                        className="form-control cinema-input"
                        value={screenForm.rows}
                        onChange={(e) => setScreenForm({ ...screenForm, rows: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Columns (e.g. 10)</label>
                      <input
                        type="number"
                        min="6"
                        max="20"
                        className="form-control cinema-input"
                        value={screenForm.columns}
                        onChange={(e) => setScreenForm({ ...screenForm, columns: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-cinema-secondary" onClick={() => setShowScreenModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-cinema-primary">
                    {saving ? 'Adding...' : 'Add Screen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheatres;

