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
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      title: 'Masafi Central Yard',
      category: 'Commercial',
      addressLine: 'Sector 4, Main Industrial Highway, Masafi, Fujairah',
      contactPerson: 'Muhammad Tamim',
      phone: '+971 50 123 4567',
      isDefault: true,
    },
    {
      id: '2',
      title: 'Fujairah Residential Villa',
      category: 'Residential',
      addressLine: 'Villa 14, Al-Hail Industrial Zone, Fujairah',
      contactPerson: 'Waqar Ali Shah',
      phone: '+971 55 987 6543',
      isDefault: false,
    }
  ]);

  // Load from localStorage on mount and sync changes
  useEffect(() => {
    const saved = localStorage.getItem('customer_saved_addresses');
    if (saved) {
      try {
        setAddresses(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved addresses');
      }
    }
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
    } else {
      const newAddress = {
        ...formData,
        id: Date.now(),
        isDefault: addresses.length === 0 ? true : formData.isDefault
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
    <div className="w-full space-y-6 pb-12">
      <div className="bg-gradient-to-r from-[#0B2A4D] via-[#103E73] to-[#0B2A4D] p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 skew-x-12 pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/30 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase text-blue-200">
            <Navigation size={13} /> Geo-Location Management
          </div>
          <h1 className="text-3xl font-black tracking-tight">Saved Delivery Addresses</h1>
          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            Manage preferred drop-off pins for quick checkout when ordering bulk water tankers across the Masafi/Fujairah region.
          </p>
        </div>
        
        <button 
          onClick={handleOpenAddModal}
          className="relative z-10 flex items-center gap-2 bg-white hover:bg-blue-50 text-[#0B2A4D] px-6 py-3.5 rounded-2xl text-xs font-black transition-all shadow-lg hover:scale-105 cursor-pointer shrink-0"
        >
          <Plus size={16} className="text-blue-600" /> Add New Address Pin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div 
            key={addr.id} 
            className={`bg-white rounded-3xl p-6 border transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 ${
              addr.isDefault ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-gray-100'
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50/70 flex items-center justify-center border border-blue-100 shrink-0">
                    {getCategoryIcon(addr.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0B2A4D]">{addr.title}</h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{addr.category} Location</span>
                  </div>
                </div>

                {addr.isDefault ? (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-xl text-[11px] font-bold border border-blue-200 shadow-2xs">
                    <CheckCircle2 size={13} /> Default Pin
                  </span>
                ) : (
                  <button 
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[11px] font-bold text-gray-400 hover:text-[#0B2A4D] underline cursor-pointer transition"
                  >
                    Set as Default
                  </button>
                )}
              </div>

              <div className="space-y-2 pt-3 text-xs text-gray-600 border-t border-gray-100">
                <p className="flex items-start gap-2">
                  <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" /> 
                  <span className="font-semibold text-gray-800">{addr.addressLine}</span>
                </p>
                <div className="flex items-center gap-6 pt-1 text-gray-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <User size={13} className="text-gray-400" /> {addr.contactPerson}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Phone size={13} className="text-gray-400" /> {addr.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
              <button 
                onClick={() => handleOpenEditModal(addr)}
                className="flex items-center gap-1.5 text-gray-600 hover:text-[#0B2A4D] font-bold transition cursor-pointer"
              >
                <Edit3 size={14} /> Edit Address
              </button>
              <button 
                onClick={() => handleDelete(addr.id)}
                className="flex items-center gap-1.5 text-red-500 hover:text-red-700 font-bold transition cursor-pointer"
              >
                <Trash2 size={14} /> Delete Pin
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-[#0B2A4D]">
                {editingId ? 'Edit Saved Address Pin' : 'Add New Delivery Address'}
              </h3>
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
                    placeholder="e.g. Central Yard Warehouse"
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
                <label className="block font-bold text-gray-700 mb-1">Full Street / Region Address *</label>
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
                  Set as default delivery pin for quick ordering
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
                  className="flex-1 bg-[#0B2A4D] hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
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