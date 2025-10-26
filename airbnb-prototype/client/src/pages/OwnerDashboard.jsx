import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const SERVER = 'http://localhost:4000';

export default function OwnerDashboard() {
  const nav = useNavigate();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties'); // properties | bookings
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propsRes, bookingsRes] = await Promise.all([
        api.get('/properties/mine'),
        api.get('/bookings')
      ]);
      setProperties(propsRes.data);
      setBookings(bookingsRes.data);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { action });
      setMsg(`Booking ${action.toLowerCase()}ed successfully`);
      loadData(); // Reload data
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Action failed');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleDeleteProperty = async (propertyId, propertyName) => {
    if (!window.confirm(`Are you sure you want to delete "${propertyName}"?\n\nThis action cannot be undone and will also delete all associated bookings.`)) {
      return;
    }

    try {
      await api.delete(`/properties/${propertyId}`);
      setMsg('Property deleted successfully');
      loadData();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed to delete property');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const acceptedBookings = bookings.filter(b => b.status === 'ACCEPTED');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        <button
          onClick={() => nav('/property/add')}
          className="rounded-xl bg-rose-500 text-white px-4 py-2 hover:bg-rose-600 transition"
        >
          + Add Property
        </button>
      </div>

      {msg && (
        <div className="bg-green-50 text-green-700 p-3 rounded-xl">
          {msg}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-gray-600 text-sm">Total Properties</div>
          <div className="text-2xl font-bold mt-1">{properties.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-gray-600 text-sm">Pending Requests</div>
          <div className="text-2xl font-bold mt-1 text-orange-600">{pendingBookings.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-gray-600 text-sm">Accepted Bookings</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{acceptedBookings.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-gray-600 text-sm">Total Bookings</div>
          <div className="text-2xl font-bold mt-1">{bookings.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="border-b">
          <div className="flex gap-1 p-1">
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'properties'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              My Properties ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'bookings'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Booking Requests ({pendingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'history'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Booking History
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'properties' && (
            <div>
              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">You haven't posted any properties yet</div>
                  <button
                    onClick={() => nav('/property/add')}
                    className="rounded-xl bg-rose-500 text-white px-6 py-2"
                  >
                    Add Your First Property
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map(p => (
                    <div key={p.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition">
                      {/* Property Image */}
                      {p.photos && p.photos.length > 0 ? (
                        <img
                          src={`${SERVER}${p.photos[0]}`}
                          alt={p.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                          No photo
                        </div>
                      )}
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {[p.city, p.state, p.country].filter(Boolean).join(', ')}
                        </p>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span>{p.bedrooms} bed · {p.bathrooms} bath</span>
                          <span className="font-semibold">${p.pricePerNight}/night</span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <button
                            onClick={() => nav(`/property/edit/${p.id}`)}
                            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => nav(`/properties/${p.id}`)}
                            className="flex-1 rounded-lg bg-gray-900 text-white py-2 text-sm hover:opacity-90"
                          >
                            View
                          </button>
                        </div>
                        <button
                          onClick={() => handleDeleteProperty(p.id, p.name)}
                          className="w-full rounded-lg bg-red-500 text-white py-2 text-sm hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              {pendingBookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No pending booking requests
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map(b => (
                    <div key={b.id} className="border rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{b.property.name}</h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>📅 {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</div>
                            <div>👥 {b.guests} guest{b.guests > 1 ? 's' : ''}</div>
                            <div>💰 ${b.property.pricePerNight}/night</div>
                            <div className="text-xs text-gray-500 mt-2">
                              Requested: {new Date(b.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleBookingAction(b.id, 'ACCEPT')}
                            className="rounded-lg bg-green-500 text-white px-4 py-2 text-sm hover:bg-green-600 transition"
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => handleBookingAction(b.id, 'CANCEL')}
                            className="rounded-lg bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600 transition"
                          >
                            ✗ Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {acceptedBookings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-green-700">Accepted Bookings</h3>
                  <div className="space-y-3">
                    {acceptedBookings.map(b => (
                      <div key={b.id} className="border border-green-200 rounded-xl p-4 bg-green-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{b.property.name}</h4>
                            <div className="text-sm text-gray-600 mt-1">
                              📅 {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              👥 {b.guests} guest{b.guests > 1 ? 's' : ''}
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">
                            ACCEPTED
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cancelledBookings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">Cancelled Bookings</h3>
                  <div className="space-y-3">
                    {cancelledBookings.map(b => (
                      <div key={b.id} className="border rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-600">{b.property.name}</h4>
                            <div className="text-sm text-gray-500 mt-1">
                              📅 {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-gray-600 text-white text-xs font-semibold">
                            CANCELLED
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bookings.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No booking history yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

