import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const SERVER = 'http://localhost:4000';

export default function EditProperty() {
  const { id } = useParams();
  const nav = useNavigate();
  const [formData, setFormData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const amenitiesList = [
    'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning',
    'Heating', 'TV', 'Pool', 'Gym', 'Parking', 'Pets allowed'
  ];

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const { data } = await api.get(`/properties/${id}`);
      setFormData({
        name: data.name,
        type: data.type,
        description: data.description || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || 'USA',
        pricePerNight: data.pricePerNight,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        maxGuests: data.maxGuests,
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
        availableFrom: data.availableFrom ? data.availableFrom.split('T')[0] : '',
        availableTo: data.availableTo ? data.availableTo.split('T')[0] : ''
      });
      setPhotos(Array.isArray(data.photos) ? data.photos : []);
    } catch (e) {
      setError('Failed to load property');
    } finally {
      setLoading(false);
    }
  };

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
    setSuccess('');
    setUploading(true);

    try {
      // Update property details
      const propertyData = {
        ...formData,
        amenities: JSON.stringify(formData.amenities),
        pricePerNight: parseFloat(formData.pricePerNight),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        maxGuests: parseInt(formData.maxGuests)
      };

      await api.put(`/properties/${id}`, propertyData);

      // Upload new photos if any
      if (newPhotos.length > 0) {
        const fd = new FormData();
        newPhotos.forEach(photo => fd.append('photos', photo));
        await api.post(`/properties/${id}/photos`, fd);
        setNewPhotos([]);
      }

      setSuccess('Property updated successfully!');
      setTimeout(() => nav('/'), 2000);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update property');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoUrl) => {
    try {
      await api.delete(`/properties/${id}/photos?url=${encodeURIComponent(photoUrl)}`);
      setPhotos(prev => prev.filter(p => p !== photoUrl));
      setSuccess('Photo deleted');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError('Failed to delete photo');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="text-center py-12">Loading property...</div>;
  }

  if (!formData) {
    return <div className="text-center py-12 text-red-600">Property not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Property</h1>
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

      {success && (
        <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-xl">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-6">
        {/* Basic Info */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Property Name *</label>
              <input
                required
                className="w-full border p-3 rounded-xl"
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
                value={formData.pricePerNight}
                onChange={e => handleChange('pricePerNight', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows={4}
                className="w-full border p-3 rounded-xl"
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Location */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Location</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                className="w-full border p-3 rounded-xl"
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                className="w-full border p-3 rounded-xl"
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

        {/* Property Details */}
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

        {/* Amenities */}
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

        {/* Availability */}
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

        {/* Existing Photos */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Current Photos</h2>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map(photo => (
                <div key={photo} className="relative group">
                  <img
                    src={`${SERVER}${photo}`}
                    alt="Property"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => deletePhoto(photo)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No photos uploaded</div>
          )}
        </section>

        {/* Add New Photos */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Add New Photos</h2>
          <div>
            <input
              type="file"
              multiple
              accept="image/*"
              className="w-full border p-3 rounded-xl"
              onChange={e => setNewPhotos(Array.from(e.target.files).slice(0, 10))}
            />
            {newPhotos.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {newPhotos.length} new photo{newPhotos.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        </section>

        {/* Submit */}
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
            {uploading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

