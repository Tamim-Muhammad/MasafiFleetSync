import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Building2, 
  Home, 
  Briefcase, 
  X,
  Phone,
  User,
  Navigation
} from 'lucide-react';

const CustomerSavedAddresses = () => {
  const [addresses, setAddresses] = useState([]);

  // Load from localStorage on mount. Start completely empty by default so new user accounts show a clean state.
  useEffect(() => {
    const saved = localStorage.getItem('customer_saved_addresses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAddresses(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved addresses');
      }
    }

    // Default to an empty array for clean data isolation per account
    setAddresses([]);
  }, []);

  const saveToStorage = (updatedAddresses) => {
    setAddresses(updatedAddresses);
    localStorage.setItem('customer_saved_addresses', JSON.stringify(updatedAddresses));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
   
  const [formData, setFormData] = useState({
    title: '',
    category: 'Commercial',
    addressLine: '',
    contactPerson: '',
    phone: '',
    isDefault: false
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ title: '', category: 'Commercial', addressLine: '', contactPerson: '', phone: '', isDefault: false });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingId(addr.id);
    setFormData(addr);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this saved delivery location?")) {
      const filtered = addresses.filter(item => item.id !== id);
      if (!filtered.some(a => a.isDefault) && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      saveToStorage(filtered);
    }
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map(item => ({
      ...item,
      isDefault: item.id === id
    }));
    saveToStorage(updated);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.addressLine || !formData.phone) {
      alert("Please fill in all mandatory address fields.");
      return;
    }

    let updatedAddresses = [];
    if (editingId) {
      updatedAddresses = addresses.map(item => item.id === editingId ? { ...formData, id: editingId } : item);
      if (formData.isDefault) {
        updatedAddresses = updatedAddresses.map(item => ({
          ...item,
          isDefault: item.id === editingId
        }));
      }
    } else {
      const newAddress = {
        ...formData,
        id: Date.now(),
        isDefault: addresses.length === 0 ? true : formData.isDefault,
        lat: 25.1028,
        lon: 56.2872
      };
      if (newAddress.isDefault) {
        updatedAddresses = addresses.map(item => ({ ...item, isDefault: false })).concat(newAddress);
      } else {
        updatedAddresses = [...addresses, newAddress];
      }
    }
     
    saveToStorage(updatedAddresses);
    setIsModalOpen(false);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Residential': return <Home size={18} className="text-blue-600" />;
      case 'Commercial': return <Building2 size={18} className="text-amber-600" />;
      default: return <Briefcase size={18} className="text-emerald-600" />;
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
       
      {/* Clean Professional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
            <Navigation size={14} /> Geo-Location Management
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Saved Delivery Addresses</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage preferred drop-off pins for quick checkout when ordering bulk water tankers across the Masafi/Fujairah operational region.
          </p>
        </div>
         
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-[#0B2A4D] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-xs font-black transition shadow-md cursor-pointer w-fit"
        >
          <Plus size={15} /> Add New Address Pin
        </button>
      </div>

      {/* Professional Empty State or Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm p-16 text-center space-y-5 my-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-inner">
            <MapPin size={30} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-black text-gray-900">No Saved Delivery Pins Found</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Your account doesn't have any saved delivery locations yet. Add a drop-off pin to streamline your bulk water orders and dispatch coordinates.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-[#0B2A4D] hover:bg-blue-900 text-white px-6 py-3 rounded-2xl text-xs font-bold transition shadow-md cursor-pointer uppercase tracking-wider"
          >
            <Plus size={15} /> Add Your First Address Pin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div 
              key={addr.id} 
              className={`bg-white rounded-3xl p-6 border-2 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 ${
                addr.isDefault ? 'border-[#0B2A4D] bg-blue-50/20 ring-2 ring-[#0B2A4D]/10' : 'border-gray-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                      {getCategoryIcon(addr.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#0B2A4D]">{addr.title}</h3>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{addr.category} Location</span>
                    </div>
                  </div>

                  {addr.isDefault ? (
                    <span className="inline-flex items-center gap-1 bg-[#0B2A4D] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs">
                      <CheckCircle2 size={12} strokeWidth={3} /> Default Pin
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition cursor-pointer border border-blue-200"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div className="space-y-2 pt-3 text-xs text-gray-600 border-t border-gray-100">
                  <p className="flex items-start gap-2">
                    <MapPin size={15} className="text-red-500 shrink-0 mt-0.5" /> 
                    <span className="font-semibold text-gray-800">{addr.addressLine}</span>
                  </p>
                  <div className="flex items-center gap-6 pt-1 text-gray-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User size={13} className="text-gray-400" /> {addr.contactPerson}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium font-mono">
                      <Phone size={13} className="text-blue-600" /> {addr.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 text-xs">
                <button 
                  onClick={() => handleOpenEditModal(addr)}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-[#0B2A4D] font-bold transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-gray-50"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-bold transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete Pin
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-blue-50 text-[#0B2A4D] rounded-xl flex items-center justify-center font-bold">
                  <MapPin size={20} />
                </div>
                <h3 className="text-base font-black text-[#0B2A4D]">
                  {editingId ? 'Edit Saved Address Pin' : 'Add New Delivery Address'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Address Label / Title *</label>
                  <input 
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Masafi Farmhouse #3"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Location Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Industrial">Industrial Site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Street / Region Address (Masafi / Fujairah) *</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="Enter exact street, block, or zone in Masafi/Fujairah..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Person *</label>
                  <input 
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Site Manager Name"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input 
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 XX XXX XXXX"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="defaultCheck"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-[#0B2A4D] rounded border-gray-300 focus:ring-[#0B2A4D]"
                />
                <label htmlFor="defaultCheck" className="font-bold text-gray-700 cursor-pointer">
                  Set as primary default delivery pin for quick ordering
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0B2A4D] hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer uppercase tracking-wider"
                >
                  Save Address Pin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSavedAddresses;