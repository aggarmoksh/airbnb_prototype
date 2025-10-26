import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AddProperty() {
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Apartment',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    pricePerNight: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 1,
    amenities: [],
    availableFrom: '',
    availableTo: ''
  });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const amenitiesList = [
    'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning',
    'Heating', 'TV', 'Pool', 'Gym', 'Parking', 'Pets allowed'
  ];

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      const propertyData = {
        ...formData,
        amenities: JSON.stringify(formData.amenities),
        pricePerNight: parseFloat(formData.pricePerNight),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        maxGuests: parseInt(formData.maxGuests)
      };

      const { data: property } = await api.post('/properties', propertyData);

      if (photos.length > 0) {
        const fd = new FormData();
        photos.forEach(photo => fd.append('photos', photo));
        await api.post(`/properties/${property.id}/photos`, fd);
      }

      nav('/');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create property');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add New Property</h1>
        <button
          onClick={() => nav('/')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-rose-50 text-rose-700 p-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Property Name *</label>
              <input
                required
                className="w-full border p-3 rounded-xl"
                placeholder="e.g., Cozy Downtown Apartment"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Property Type *</label>
              <select
                required
                className="w-full border p-3 rounded-xl"
                value={formData.type}
                onChange={e => handleChange('type', e.target.value)}
              >
                <option>Apartment</option>
                <option>House</option>
                <option>Condo</option>
                <option>Villa</option>
                <option>Cabin</option>
                <option>Studio</option>
                <option>Loft</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price per Night ($) *</label>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                className="w-full border p-3 rounded-xl"
                placeholder="100"
                value={formData.pricePerNight}
                onChange={e => handleChange('pricePerNight', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows={4}
                className="w-full border p-3 rounded-xl"
                placeholder="Describe your property..."
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Location</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                className="w-full border p-3 rounded-xl"
                placeholder="Street address"
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                className="w-full border p-3 rounded-xl"
                placeholder="City"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <select
                className="w-full border p-3 rounded-xl"
                value={formData.state}
                onChange={e => handleChange('state', e.target.value)}
              >
                <option value="">Select State</option>
                {['AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <select
                className="w-full border p-3 rounded-xl"
                value={formData.country}
                onChange={e => handleChange('country', e.target.value)}
              >
                {['USA','Canada','UK','India','Australia'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Property Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bedrooms *</label>
              <input
                required
                type="number"
                min="0"
                className="w-full border p-3 rounded-xl"
                value={formData.bedrooms}
                onChange={e => handleChange('bedrooms', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bathrooms *</label>
              <input
                required
                type="number"
                min="1"
                step="0.5"
                className="w-full border p-3 rounded-xl"
                value={formData.bathrooms}
                onChange={e => handleChange('bathrooms', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Guests *</label>
              <input
                required
                type="number"
                min="1"
                className="w-full border p-3 rounded-xl"
                value={formData.maxGuests}
                onChange={e => handleChange('maxGuests', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenitiesList.map(amenity => (
              <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{amenity}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Availability</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Available From</label>
              <input
                type="date"
                className="w-full border p-3 rounded-xl"
                value={formData.availableFrom}
                onChange={e => handleChange('availableFrom', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Available To</label>
              <input
                type="date"
                className="w-full border p-3 rounded-xl"
                value={formData.availableTo}
                onChange={e => handleChange('availableTo', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Photos</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Upload Photos (max 10)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="w-full border p-3 rounded-xl"
              onChange={e => setPhotos(Array.from(e.target.files).slice(0, 10))}
            />
            {photos.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {photos.length} photo{photos.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        </section>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => nav('/')}
            className="flex-1 rounded-xl border border-gray-300 py-3 hover:bg-gray-50"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-rose-500 text-white py-3 hover:bg-rose-600 disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? 'Creating Property...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
}

