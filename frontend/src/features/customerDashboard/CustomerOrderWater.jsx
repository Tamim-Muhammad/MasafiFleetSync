import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Droplets, Truck, Search, AlertTriangle, HelpCircle, X, ChevronDown, ChevronUp, Clock, ArrowLeft, History, CheckCircle, Radio, Navigation, Bookmark, Check, Receipt, Banknote, Phone } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const YARD_LOCATION = [25.2861, 56.3314];

// Strict operational boundary covering Masafi, Fujairah, and surrounding regional corridors
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
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isOutOfBounds, setIsOutOfBounds] = useState(false);
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [searchError, setSearchError] = useState('');
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedId, setSelectedSavedId] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const [pricingDetails, setPricingDetails] = useState({
    grossAmount: 525,
    commissionDeduction: 52.5,
    driverNetEarnings: 472.5
  });

  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const faqList = [
    {
      q: "What payment methods are accepted?",
      a: "We operate strictly on a Cash on Delivery (COD) basis. You pay hand-to-hand directly to the driver upon successful arrival."
    },
    {
      q: "How is the delivery price calculated?",
      a: "Pricing is calculated dynamically using backend system formulas linked to live operating parameters."
    },
    {
      q: "What regions do you service?",
      a: "Our fleet operates exclusively within the designated Masafi and Fujairah regional operational boundaries."
    },
    {
      q: "What happens after I place an order?",
      a: "Your order goes directly to the central dispatch queue for admin review, driver assignment, and live tracking."
    }
  ];

  useEffect(() => {
    const storedAddresses = JSON.parse(localStorage.getItem('customer_saved_addresses') || '[]');
    setSavedAddresses(storedAddresses);

    const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    if (storedUser.phoneNumber && !customerPhone) {
      setCustomerPhone(storedUser.phoneNumber);
    }

    if (storedAddresses.length > 0) {
      const defaultPin = storedAddresses.find(a => a.isDefault) || storedAddresses[0];
      setSelectedSavedId(defaultPin.id);
      setDeliveryAddress(`${defaultPin.title}: ${defaultPin.addressLine}`);
      if (defaultPin.phone) {
        setCustomerPhone(defaultPin.phone);
      }
      setHasSelectedLocation(true);
      if (defaultPin.lat && defaultPin.lon) {
        setMapPosition([Number(defaultPin.lat), Number(defaultPin.lon)]);
      } else if (defaultPin.latitude && defaultPin.longitude) {
        setMapPosition([Number(defaultPin.latitude), Number(defaultPin.longitude)]);
      } else {
        setMapPosition(YARD_LOCATION);
      }
    }
  }, []);

  const handleSelectSavedAddress = (e) => {
    const id = e.target.value;
    setSelectedSavedId(id);
    if (!id) return;
    
    const chosen = savedAddresses.find(a => String(a.id) === String(id));
    if (chosen) {
      setDeliveryAddress(`${chosen.title}: ${chosen.addressLine}`);
      
      if (chosen.phone) {
        setCustomerPhone(chosen.phone);
      }

      setHasSelectedLocation(true);
      
      if (chosen.lat && chosen.lon) {
        setMapPosition([Number(chosen.lat), Number(chosen.lon)]);
      } else if (chosen.latitude && chosen.longitude) {
        setMapPosition([Number(chosen.latitude), Number(chosen.longitude)]);
      } else {
        setMapPosition(YARD_LOCATION);
      }
    }
  };

  useEffect(() => {
    const updateLocationAndFare = async () => {
      const validZone = isWithinGeofence(mapPosition[0], mapPosition[1]);
      setIsOutOfBounds(!validZone);

      if (!validZone) return;

      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${YARD_LOCATION[1]},${YARD_LOCATION[0]};${mapPosition[1]},${mapPosition[0]}?overview=full&geometries=geojson`);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const distKm = Math.max(2, Math.round(data.routes[0].distance / 1000));
          setDistanceKm(distKm);
          const formattedCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteCoordinates(formattedCoords);
        }
      } catch (error) {
        console.error("Routing error:", error);
        setRouteCoordinates([YARD_LOCATION, mapPosition]);
      }

      const baseRate = parseFloat(localStorage.getItem('alwaqar_base_rate')) || 150;
      const perKmRate = parseFloat(localStorage.getItem('alwaqar_per_km_rate')) || 3.5;
      const commissionRate = parseFloat(localStorage.getItem('alwaqar_commission_rate')) || 10;

      const volumeMultiplier = selectedCapacity === '1000' ? 1.0 : 2.5;

      const calculatedGross = (baseRate + (distanceKm * perKmRate)) * volumeMultiplier;
      const commissionCut = calculatedGross * (commissionRate / 100);
      const netEarnings = calculatedGross - commissionCut;

      setPricingDetails({
        grossAmount: Math.round(calculatedGross),
        commissionDeduction: Number(commissionCut.toFixed(2)),
        driverNetEarnings: Number(netEarnings.toFixed(2))
      });
    };

    updateLocationAndFare();
  }, [mapPosition, selectedCapacity, distanceKm]);

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    try {
      let query = searchQuery.trim();
      const lowerQ = query.toLowerCase();

      if (!lowerQ.includes('masafi') && !lowerQ.includes('fujairah') && !lowerQ.includes('uae')) {
        query = `${query}, Masafi, Fujairah, UAE`;
      }

      const viewbox = '56.0,24.9,56.6,25.6';
      const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&bounded=1&viewbox=${viewbox}&q=${encodeURIComponent(query)}`);
      const data = await geoResponse.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        if (!isWithinGeofence(lat, lon)) {
          setSearchError('We do not operate here. Al-Waqar Transport provides bulk water services exclusively within Masafi and Fujairah regional corridors.');
          setIsSearching(false);
          return;
        }

        setMapPosition([lat, lon]);
        setDeliveryAddress(data[0].display_name);
        setHasSelectedLocation(true);
        setSelectedSavedId('');
      } else {
        setSearchError('Location not found within service bounds. Please search for a specific local landmark like "Masafi Friday Market" or "Masafi Fort".');
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setSearchError('Network error while searching location.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!hasSelectedLocation || !deliveryAddress.trim()) return;
    if (!customerPhone.trim()) return;
    if (isOutOfBounds) {
      alert("Cannot dispatch: Selected location is outside our operational service zone.");
      return;
    }

    setIsSubmitting(true);
    try {
      // --- THE BULLETPROOF TOKEN EXTRACTOR ---
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
      const storedUser = JSON.parse(userStr);
      
      // We check everywhere your frontend might possibly be saving the token
      const token = localStorage.getItem('token') || 
                    sessionStorage.getItem('token') || 
                    localStorage.getItem('jwt') || 
                    localStorage.getItem('userToken') || 
                    storedUser.token;
      
      if (!token) {
        alert("Authentication error: No session token found. Please click 'Logout' on the sidebar and log back in so the system can generate a fresh token.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        VolumeGallons: Number(selectedCapacity), 
        TargetLatitude: Number(mapPosition[0]),
        TargetLongitude: Number(mapPosition[1]),
        CalculatedDistanceKm: Number(distanceKm),
        GrossAmountAED: Number(pricingDetails.grossAmount),
        CommissionDeductionAED: Number(pricingDetails.commissionDeduction),
        DriverNetEarningsAED: Number(pricingDetails.driverNetEarnings),
        CustomerPhone: customerPhone,
        DeliveryAddress: deliveryAddress
      };

      const response = await fetch('http://localhost:5191/api/WaterOrders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
            alert("Your session has expired. Please log out and log back in.");
            setIsSubmitting(false);
            return;
        }
        throw new Error('Failed to create order on backend queue');
      }

      const data = await response.json();
      setCreatedOrderId(data.orderId || data.OrderId || 104);
      setIsSubmitting(false);
      setOrderPlaced(true);
    } catch (error) {
      console.error("Order submission error:", error);
      setSearchError("Error submitting order to admin queue. Ensure your .NET backend API is running.");
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    const displayId = `WTR-2026-${String(createdOrderId || 104).padStart(3, '0')}`;

    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden my-6">
        <div className="bg-gradient-to-r from-[#0B2A4D] to-blue-900 p-6 text-white text-center relative">
          <div className="w-12 h-12 bg-amber-400 text-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
            <Clock size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Order Successfully Booked & Under Admin Review</h2>
          <p className="text-blue-200 text-xs mt-1 max-w-lg mx-auto leading-relaxed">
            Your bulk water request has been securely logged into the dispatch queue. You will receive an in-app notification once administration reviews and assigns your delivery driver.
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-center">
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 space-y-1.5">
              <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto text-xs font-bold shadow">
                <CheckCircle size={14} />
              </div>
              <p className="text-xs font-black text-gray-900">1. Order Logged</p>
              <span className="text-[10px] text-gray-500 font-medium">Successfully saved in system</span>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1.5">
              <div className="w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto text-xs font-bold animate-pulse shadow">
                <Radio size={14} />
              </div>
              <p className="text-xs font-black text-amber-900">2. Admin Review</p>
              <span className="text-[10px] text-amber-700 font-medium">Awaiting operator verification</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reference Code</span>
              <span className="text-sm font-black text-[#0B2A4D]">{displayId}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="block text-[11px] text-gray-400 uppercase font-semibold">Volume</span>
                <span className="font-bold text-gray-800">{selectedCapacity} Gallons</span>
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
                <span className="font-black text-[#0B2A4D]">AED {pricingDetails.grossAmount}.00</span>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Destination:</span>
              <span className="font-bold text-gray-800 truncate max-w-[300px]">{deliveryAddress}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-1">
            <button 
              onClick={() => setOrderPlaced(false)}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft size={16} /> Place Another Order
            </button>
            <button 
              onClick={() => window.location.href = '/customer/dashboard/my-orders'}
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
    <div className="w-full space-y-6 pb-12 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
            <Navigation size={14} /> Logistics & Fulfillment
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Industrial Bulk Water</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Select your fleet tanker capacity and pinpoint your delivery destination in the Masafi/Fujairah region.
          </p>
        </div>
        
        <button 
          onClick={() => setIsFaqOpen(true)}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition border border-gray-200 shadow-2xs cursor-pointer shrink-0"
        >
          <HelpCircle size={15} className="text-blue-600" /> Ordering FAQ
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Droplets size={18} className="text-blue-600" /> 1. Choose Tanker Capacity Volume
              </h2>
              <span className="text-[10px] font-black text-[#0B2A4D] bg-blue-50 px-3 py-1 rounded-full uppercase border border-blue-200">
                Primary Selection Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  cap: '1000', 
                  label: '1,000 Gallons Tanker', 
                  desc: 'Ideal for residential villas, localized construction sites, and small farm water supply.',
                  tag: 'Light Commercial'
                },
                { 
                  cap: '5000', 
                  label: '5,000 Gallons Tanker', 
                  desc: 'Standard heavy industrial fleet vehicle for massive commercial sites and large infrastructure pools.',
                  tag: 'Heavy Industrial' 
                }
              ].map((item) => {
                const isSelected = selectedCapacity === item.cap;
                return (
                  <button
                    key={item.cap}
                    type="button"
                    onClick={() => setSelectedCapacity(item.cap)}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                      isSelected 
                        ? 'border-[#0B2A4D] bg-blue-50/40 shadow-md ring-2 ring-[#0B2A4D]/20' 
                        : 'border-gray-200 hover:border-gray-300 bg-white shadow-2xs'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3.5 right-3.5 w-7 h-7 bg-[#0B2A4D] text-white rounded-full flex items-center justify-center shadow-md">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#0B2A4D] text-white shadow' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Truck size={20} />
                        </div>
                        <div>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            isSelected ? 'bg-blue-100 text-[#0B2A4D]' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.tag}
                          </span>
                          <span className="block text-base font-black text-gray-900 mt-0.5">
                            {item.cap} Gallons
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-extrabold text-gray-900 mb-1">
                        {item.label}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-black ${
                      isSelected ? 'border-blue-200 text-[#0B2A4D]' : 'border-gray-100 text-gray-400'
                    }`}>
                      <span>{isSelected ? '✓ Active Selection' : 'Click to Select'}</span>
                      <span>→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" /> 2. Pinpoint Delivery Location & Contact
              </h2>
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Masafi / Fujairah</span>
            </div>

            {savedAddresses.length > 0 && (
              <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-2xl space-y-1.5">
                <label className="block text-[11px] font-black text-[#0B2A4D] uppercase flex items-center gap-1.5">
                  <Bookmark size={13} className="text-blue-600" /> Quick-Select Saved Address Book
                </label>
                <select
                  value={selectedSavedId}
                  onChange={handleSelectSavedAddress}
                  className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] shadow-2xs cursor-pointer"
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
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-900 text-xs">
                <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block font-black text-red-950 uppercase tracking-wide">Service Area Notice: We Do Not Operate Here</strong>
                  <p className="text-red-800 font-medium leading-relaxed">
                    Al-Waqar Transport provides industrial bulk water logistics exclusively within the Masafi and Fujairah regional operational corridors. Please select a valid location within our service bounds.
                  </p>
                </div>
              </div>
            )}

            {searchError && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-900 text-xs font-bold">
                ⚠️ {searchError}
              </div>
            )}

            <form onSubmit={handleLocationSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={15} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search specific landmark in Masafi (e.g. Friday Market, Masafi Fort)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="bg-[#0B2A4D] text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-blue-900 transition cursor-pointer disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            <div className="relative h-72 rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-0">
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
                
                <Marker position={YARD_LOCATION}>
                  <Popup><strong>Al-Waqar Central Fleet Yard</strong><br />Masafi Depot #4</Popup>
                </Marker>

                <LocationPicker position={mapPosition} setPosition={(pos) => {
                  if (!isWithinGeofence(pos[0], pos[1])) {
                    setIsOutOfBounds(true);
                  } else {
                    setIsOutOfBounds(false);
                    setMapPosition(pos);
                    setHasSelectedLocation(true);
                    setSelectedSavedId('');
                  }
                }} />

                {routeCoordinates.length > 0 && !isOutOfBounds && (
                  <Polyline positions={routeCoordinates} color="#2563eb" weight={5} opacity={0.85} />
                )}
              </MapContainer>

              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-700 shadow-md border border-gray-200 z-10 pointer-events-none">
                Actual Road Route • Distance: {distanceKm} km
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Destination Landmark / Address *</label>
                <input 
                  type="text" 
                  value={deliveryAddress}
                  onChange={(e) => {
                    setDeliveryAddress(e.target.value);
                    if (e.target.value.trim().length > 0) setHasSelectedLocation(true);
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                  placeholder="Enter exact site name or compound..."
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-700 uppercase mb-1 flex items-center gap-1">
                  <Phone size={12} className="text-blue-600" /> Site Contact Phone Number *
                </label>
                <input 
                  type="text" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                  placeholder="e.g. +971 50 123 4567"
                  required
                />
              </div>
            </div>
            {!hasSelectedLocation && (
              <p className="text-[10px] text-amber-600 font-bold">⚠️ Please search a specific landmark or click on the map inside Masafi/Fujairah to enable checkout.</p>
            )}
          </div>
        </div>

        <div className="space-y-6 sticky top-6">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 text-gray-900 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-[#0B2A4D]">
                <Receipt size={18} className="text-blue-600" /> Pre-Checkout Pricing Ticket
              </h2>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-md border border-blue-200">
                Tariff Auto-Calculated
              </span>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between items-center text-gray-600 font-semibold">
                <span>Calculated Gross Cost:</span>
                <span className="font-bold text-gray-900">AED {pricingDetails.grossAmount}.00</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 font-medium text-[11px]">
                <span>Platform Commission Cut:</span>
                <span>AED {pricingDetails.commissionDeduction}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 font-medium text-[11px]">
                <span>Driver Net Settlement:</span>
                <span className="text-emerald-600 font-bold">AED {pricingDetails.driverNetEarnings}</span>
              </div>
              
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="font-black text-gray-900 text-sm">Total Payable:</span>
                <span className="font-black text-2xl text-[#0B2A4D]">AED {pricingDetails.grossAmount}.00</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 font-black text-[11px] uppercase tracking-wide">
                <Banknote size={16} className="text-amber-700" /> Cash on Delivery (COD)
              </div>
              <p className="text-[11px] text-amber-900/90 font-medium leading-relaxed">
                Hand-to-hand payment collected directly by the assigned driver upon successful arrival.
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || isOutOfBounds || !hasSelectedLocation || !deliveryAddress.trim() || !customerPhone.trim()}
              className="w-full bg-[#0B2A4D] hover:bg-blue-900 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting to Queue...
                </span>
              ) : isOutOfBounds ? (
                'We Do Not Operate Here'
              ) : (!hasSelectedLocation || !deliveryAddress.trim() || !customerPhone.trim()) ? (
                'Fill Details to Continue'
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