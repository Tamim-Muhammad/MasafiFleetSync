import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Droplets, Calculator, ShieldCheck, Truck, Search, AlertTriangle, HelpCircle, X, ChevronDown, ChevronUp, Clock, ArrowLeft, History, CheckCircle, Radio, Navigation, Bookmark } from 'lucide-react';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Central dispatch hub coordinates (Al-Waqar Transport Yard in Masafi/Fujairah)
const YARD_LOCATION = [25.2861, 56.3314];

const GEOFENCE_BOUNDS = {
  minLat: 24.9000,
  maxLat: 25.6000,
  minLon: 56.0000,
  maxLon: 56.6000
};

const isWithinGeofence = (lat, lon) => {
  return (
    lat >= GEOFENCE_BOUNDS.minLat &&
    lat <= GEOFENCE_BOUNDS.maxLat &&
    lon >= GEOFENCE_BOUNDS.minLon &&
    lon <= GEOFENCE_BOUNDS.maxLon
  );
};

const fetchRoadDistance = async (lat1, lon1, lat2, lon2) => {
  try {
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const distanceKm = Math.round(data.routes[0].distance / 1000);
      return Math.max(2, distanceKm);
    }
  } catch (error) {
    console.error("Routing error, falling back to straight-line:", error);
  }
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(2, Math.round(R * c));
};

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected Delivery Pin</Popup>
    </Marker>
  );
};

const MapController = ({ center }) => {
  const map = useMap();
  map.flyTo(center, 13);
  return null;
};

const CustomerOrderWater = () => {
  const [selectedCapacity, setSelectedCapacity] = useState('5000'); 
  const [mapPosition, setMapPosition] = useState(YARD_LOCATION);
  const [distanceKm, setDistanceKm] = useState(5); 
  const [deliveryAddress, setDeliveryAddress] = useState('Masafi Central Yard Delivery Zone');
  const [isOutOfBounds, setIsOutOfBounds] = useState(false);
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedId, setSelectedSavedId] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [createdOrderResponse, setCreatedOrderResponse] = useState(null);

  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const faqList = [
    {
      q: "What payment methods are accepted?",
      a: "We operate strictly on a Cash on Delivery (COD) basis. You pay hand-to-hand directly to the driver upon successful arrival."
    },
    {
      q: "How is the delivery price calculated?",
      a: "Pricing is calculated automatically using our standard formula: [Base Rate + (Road Distance in km x Per-km Rate)] x Volume Multiplier."
    },
    {
      q: "What regions do you service?",
      a: "Our fleet operates exclusively within the designated Masafi and Fujairah regional operational boundaries."
    },
    {
      q: "What happens after I place an order?",
      a: "Your order goes directly to the central dispatch queue. Once an operator assigns a verified driver and vehicle, you will receive an in-app notification and tracking access."
    }
  ];

  // Load saved addresses from localStorage on mount and apply default pin if available
  useEffect(() => {
    const storedAddresses = JSON.parse(localStorage.getItem('customer_saved_addresses') || '[]');
    setSavedAddresses(storedAddresses);

    if (storedAddresses.length > 0) {
      const defaultPin = storedAddresses.find(a => a.isDefault) || storedAddresses[0];
      setSelectedSavedId(defaultPin.id);
      setDeliveryAddress(`${defaultPin.title}: ${defaultPin.addressLine}`);
      // Fallback coordinate mapping for demo or custom injection if lat/lng are added
      if (defaultPin.title.toLowerCase().includes('fujairah')) {
        setMapPosition([25.1288, 56.3265]);
      } else {
        setMapPosition([25.2861, 56.3314]);
      }
    }
  }, []);

  const handleSelectSavedAddress = (e) => {
    const id = e.target.value;
    setSelectedSavedId(id);
    const chosen = savedAddresses.find(a => String(a.id) === String(id));
    if (chosen) {
      setDeliveryAddress(`${chosen.title}: ${chosen.addressLine}`);
      if (chosen.title.toLowerCase().includes('fujairah')) {
        setMapPosition([25.1288, 56.3265]);
      } else {
        setMapPosition([25.2861, 56.3314]);
      }
    }
  };

  useEffect(() => {
    const updateLocationData = async () => {
      const validZone = isWithinGeofence(mapPosition[0], mapPosition[1]);
      setIsOutOfBounds(!validZone);

      const dist = await fetchRoadDistance(YARD_LOCATION[0], YARD_LOCATION[1], mapPosition[0], mapPosition[1]);
      setDistanceKm(dist);
    };
    updateLocationData();
  }, [mapPosition]);

  const baseRate = 150; 
  const perKmRate = 3.5; 
  const volumeMultipliers = {
    '1000': 1.0,
    '5000': 2.5
  };

  const multiplier = volumeMultipliers[selectedCapacity] || 2.5;
  const calculatedTotal = Math.round((baseRate + (distanceKm * perKmRate)) * multiplier);

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await geoResponse.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapPosition([lat, lon]);
        setDeliveryAddress(data[0].display_name);
        setSelectedSavedId(''); // Custom pin selected
      } else {
        alert("Location not found. Try searching for 'Masafi' or 'Fujairah'.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isOutOfBounds) {
      alert("Order placement blocked: Selected location falls outside the authorized Masafi/Fujairah operating boundary.");
      return;
    }

    setIsSubmitting(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const customerId = storedUser.id || "cmslp0iy30000xcuoff9hgxr7";

      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
          serviceType: "Bulk Water Delivery",
          volumeGallons: Number(selectedCapacity),
          deliveryAddress: deliveryAddress,
          phoneNumber: storedUser.phone || "+923449419310",
          locationLat: mapPosition[0],
          locationLng: mapPosition[1],
          price: calculatedTotal
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order on backend queue');
      }

      const data = await response.json();
      setCreatedOrderResponse(data.order || data);
      setIsSubmitting(false);
      setOrderPlaced(true);
    } catch (error) {
      console.error("Order submission error:", error);
      alert("Error submitting order to admin queue. Please check your connection.");
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    const displayId = createdOrderResponse?.id ? `WTR-2026-${String(createdOrderResponse.id).slice(-3).toUpperCase()}` : '#WTR-2026-942';
    const currentStatus = createdOrderResponse?.status ? createdOrderResponse.status.toLowerCase() : 'pending';
    const isApproved = currentStatus === 'completed' || currentStatus === 'approved' || currentStatus === 'active';

    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden my-10">
        <div className="bg-gradient-to-r from-[#0B2A4D] to-blue-900 p-8 text-white text-center relative">
          <div className="w-14 h-14 bg-amber-400 text-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Clock size={28} className={isApproved ? "" : "animate-spin-slow"} />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {isApproved ? "Order Approved & Confirmed by Admin" : "Order Successfully Dispatched to Admin Queue"}
          </h2>
          <p className="text-blue-200 text-xs mt-1 max-w-lg mx-auto">
            {isApproved ? "Your bulk water order has been reviewed and approved by dispatch administration." : "Your bulk water order has been logged and sent to admin for review and driver assignment."}
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto text-xs font-bold shadow">
                <CheckCircle size={16} />
              </div>
              <p className="text-[11px] font-bold text-gray-900">1. Order Placed</p>
            </div>
            <div className="space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold shadow ${isApproved ? 'bg-green-600 text-white' : 'bg-amber-500 text-white animate-pulse'}`}>
                {isApproved ? <CheckCircle size={16} /> : <Radio size={16} />}
              </div>
              <p className={`text-[11px] font-bold ${isApproved ? 'text-green-700' : 'text-amber-600'}`}>
                {isApproved ? '2. Admin Approved' : '2. Dispatcher Review'}
              </p>
            </div>
            <div className="space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${isApproved ? 'bg-green-600 text-white shadow' : 'bg-gray-200 text-gray-400'}`}>
                {isApproved ? <CheckCircle size={16} /> : '3'}
              </div>
              <p className={`text-[11px] ${isApproved ? 'font-bold text-gray-900' : 'font-medium text-gray-400'}`}>3. Driver Assigned</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mx-auto text-xs font-bold">
                4
              </div>
              <p className="text-[11px] font-medium text-gray-400">4. Live Tracking</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reference Code</span>
              <span className="text-sm font-black text-[#0B2A4D]">{displayId}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="block text-[11px] text-gray-400 uppercase font-semibold">Volume</span>
                <span className="font-bold text-gray-800">{createdOrderResponse?.volume || selectedCapacity} Gallons</span>
              </div>
              <div>
                <span className="block text-[11px] text-gray-400 uppercase font-semibold">Distance</span>
                <span className="font-bold text-gray-800">{distanceKm} km from Yard</span>
              </div>
              <div>
                <span className="block text-[11px] text-gray-400 uppercase font-semibold">Payment</span>
                <span className="font-bold text-gray-800">Cash on Delivery</span>
              </div>
              <div>
                <span className="block text-[11px] text-gray-400 uppercase font-semibold">Total Cost</span>
                <span className="font-black text-[#0B2A4D]">AED {createdOrderResponse?.price || calculatedTotal}.00</span>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Destination:</span>
              <span className="font-bold text-gray-800 truncate max-w-[300px]">{deliveryAddress}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <button 
              onClick={() => setOrderPlaced(false)}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft size={16} /> Place Another Order
            </button>
            <button 
              onClick={() => window.location.href = '/customer/dashboard/orders'}
              className="flex items-center justify-center gap-2 bg-[#0B2A4D] hover:bg-blue-900 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              <History size={16} /> View Order History & Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12 relative">
      <div className="bg-gradient-to-r from-[#0B2A4D] via-[#103E73] to-[#0B2A4D] p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 skew-x-12 pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/30 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase text-blue-200">
            <Navigation size={13} /> Logistics & Fulfillment
          </div>
          <h1 className="text-3xl font-black tracking-tight">Order Industrial Bulk Water</h1>
          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            Select your tanker capacity and pinpoint your delivery location in the Masafi/Fujairah region.
          </p>
        </div>
        
        <button 
          onClick={() => setIsFaqOpen(true)}
          className="relative z-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-2xl text-xs font-black transition border border-white/20 backdrop-blur-md cursor-pointer shrink-0 shadow-inner"
        >
          <HelpCircle size={16} className="text-blue-300" /> Ordering FAQ
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">
            <h2 className="text-sm font-black text-[#0B2A4D] uppercase tracking-wider flex items-center gap-2">
              <Droplets size={20} className="text-blue-600" /> Choose Tanker Capacity Volume
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {[
                { cap: '1000', label: '1,000 Gallons Tanker', desc: 'Residential & Small Farm Supply' },
                { cap: '5000', label: '5,000 Gallons Tanker', desc: 'Standard Commercial Industrial Fleet' }
              ].map((item) => (
                <button
                  key={item.cap}
                  type="button"
                  onClick={() => setSelectedCapacity(item.cap)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedCapacity === item.cap 
                      ? 'border-[#0B2A4D] bg-blue-50/50 shadow-md scale-[1.02]' 
                      : 'border-gray-200 hover:border-gray-300 bg-white shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCapacity === item.cap ? 'bg-[#0B2A4D] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Truck size={20} />
                      </div>
                      <span className={`text-xs font-black px-3 py-1 rounded-xl ${selectedCapacity === item.cap ? 'bg-[#0B2A4D] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {item.cap} Gal
                      </span>
                    </div>
                    <p className="text-sm font-black text-gray-900">{item.label}</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[#0B2A4D] uppercase tracking-wider flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" /> Select Delivery Location
              </h2>
              <span className="text-xs bg-blue-50 text-blue-700 font-black px-3 py-1 rounded-xl border border-blue-100">Masafi / Fujairah Region</span>
            </div>

            {/* Quick Select from Saved Addresses Book */}
            {savedAddresses.length > 0 && (
              <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl space-y-2">
                <label className="block text-xs font-black text-[#0B2A4D] uppercase flex items-center gap-1.5">
                  <Bookmark size={14} className="text-blue-600" /> Quick-Select from Saved Address Book
                </label>
                <select
                  value={selectedSavedId}
                  onChange={handleSelectSavedAddress}
                  className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                >
                  <option value="">-- Select a saved delivery pin --</option>
                  {savedAddresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.title} ({addr.category}) - {addr.addressLine} {addr.isDefault ? '[Default]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isOutOfBounds && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-900 text-xs font-bold animate-pulse shadow-xs">
                <AlertTriangle size={20} className="text-red-600 shrink-0" />
                <span>Selected location is outside the authorized Masafi/Fujairah operational boundary. Fleet dispatch restricted.</span>
              </div>
            )}

            <form onSubmit={handleLocationSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search location globally (e.g. Masafi, Fujairah)..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="bg-[#0B2A4D] text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-blue-900 transition cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            <div className="relative h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-0">
              <MapContainer 
                center={mapPosition} 
                zoom={11} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController center={mapPosition} />
                <LocationPicker position={mapPosition} setPosition={setMapPosition} />
              </MapContainer>

              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 shadow-md border border-gray-200 z-10 pointer-events-none">
                Lat: {mapPosition[0].toFixed(4)}° N, Long: {mapPosition[1].toFixed(4)}° E | Road Distance: {distanceKm} km
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#0B2A4D] uppercase mb-1.5">Destination Address Description</label>
              <input 
                type="text" 
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                placeholder="Enter exact landmark or site name..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6 sticky top-6">
            <h2 className="text-sm font-black text-[#0B2A4D] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-4">
              <Calculator size={20} className="text-blue-600" /> Pre-Checkout Pricing Ticket
            </h2>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between text-gray-600 font-semibold">
                <span>Base Rate Fee:</span>
                <span className="font-bold text-gray-900">AED {baseRate}.00</span>
              </div>
              <div className="flex justify-between text-gray-600 font-semibold">
                <span>Road Distance ({distanceKm} km × {perKmRate}):</span>
                <span className="font-bold text-gray-900">AED {distanceKm * perKmRate}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-semibold">
                <span>Volume Multiplier ({selectedCapacity} Gal):</span>
                <span className="font-bold text-gray-900">{multiplier}x</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="font-black text-gray-900 text-sm">Total Calculated Cost:</span>
                <span className="font-black text-2xl text-[#0B2A4D]">AED {calculatedTotal}.00</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wide">
                <ShieldCheck size={16} /> Verified Payment Policy
              </div>
              <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                Payment Method: Hand-to-Hand Cash on Delivery (COD) Only. Paid directly to driver upon successful arrival.
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || isOutOfBounds}
              className="w-full bg-[#0B2A4D] hover:bg-blue-900 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs tracking-wide"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting to Admin Queue...
                </span>
              ) : isOutOfBounds ? (
                'Outside Operational Zone'
              ) : (
                'Confirm & Request Tanker Now'
              )}
            </button>
          </div>
        </div>
      </div>

      {isFaqOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-blue-50 text-[#0B2A4D] rounded-xl flex items-center justify-center font-bold">
                  <HelpCircle size={20} />
                </div>
                <h3 className="text-base font-black text-[#0B2A4D]">Frequently Asked Questions</h3>
              </div>
              <button 
                onClick={() => setIsFaqOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {faqList.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden transition bg-gray-50/50">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-4 py-3.5 text-left font-bold text-xs text-gray-800 hover:bg-gray-100 flex justify-between items-center cursor-pointer transition"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 py-3 text-xs text-gray-600 bg-white border-t border-gray-100 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsFaqOpen(false)}
                className="bg-[#0B2A4D] text-white font-black px-6 py-3 rounded-xl text-xs hover:bg-blue-900 transition cursor-pointer"
              >
                Close FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrderWater;