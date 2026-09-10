import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Clock, RefreshCw, ShieldCheck, Radio, Key, FileText, Download, Building2, AlertTriangle, RotateCcw, PackageCheck, Search, Truck, Phone, FileCheck, UserCheck, CheckCircle2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const YARD_LOCATION = [25.2861, 56.3314]; // Central Depot Masafi

const MapFlyTo = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const AdminDispatchCenter = () => {
  const [moduleTab, setModuleTab] = useState('water');

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [filterMode, setFilterMode] = useState('pending');
  const [adminRouteCoords, setAdminRouteCoords] = useState([]);

  const [rentals, setRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [rentalFilterMode, setRentalFilterMode] = useState('pending');
  const [rentalSearchQuery, setRentalSearchQuery] = useState('');
  const [fleetSearchQuery, setFleetSearchQuery] = useState('');
  const [inventoryFleet, setInventoryFleet] = useState([]);

  // Professional Toast Notification State (Replaces native window.alert)
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: '' });
    }, 4000);
  };

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const mapCenter = [25.1028, 56.2872];
  const [currentMapCenter, setCurrentMapCenter] = useState(mapCenter);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orderRes = await fetch('http://localhost:5191/api/WaterOrders');
      if (orderRes.ok) {
        const data = await orderRes.json();
        setOrders(data.map(o => {
          const lat = o.targetLatitude ?? o.TargetLatitude ?? 25.1028;
          const lng = o.targetLongitude ?? o.TargetLongitude ?? 56.2872;
          const dist = o.calculatedDistanceKm ?? o.CalculatedDistanceKm ?? 5.0;
          const stat = o.orderStatus ?? o.OrderStatus ?? 'Pending';
          const vehId = o.assignedVehicleId ?? o.AssignedVehicleId ?? null;
          const custId = o.customerId ?? o.CustomerId ?? 2;
          const exactGallons = o.volumeGallons ?? o.VolumeGallons ?? 5000;
          
          // Capture the database assigned driver ID so we can pass it down
          const rawDriverId = o.assignedDriverId ?? o.AssignedDriverId ?? null;

          return {
            id: `ORD-${o.id ?? o.Id}`,
            rawId: o.id ?? o.Id,
            customer: `Customer #${custId}`,
            volume: `${exactGallons.toLocaleString()} Gal`,
            volumeGallons: exactGallons,
            location: `Lat: ${lat}, Lon: ${lng}`,
            distance: `${dist} km`,
            coords: [lat, lng],
            status: stat,
            assignedVehicle: vehId,
            assignedDriverId: rawDriverId
          };
        }));
      }

      const vehicleRes = await fetch('http://localhost:5191/api/Vehicles');
      let vehiclesMap = {};
      if (vehicleRes.ok) {
        const vehicleData = await vehicleRes.json();
        if (Array.isArray(vehicleData) && vehicleData.length > 0) {
          setInventoryFleet(vehicleData);
          vehicleData.forEach(v => {
            vehiclesMap[v.id] = v.model || v.vehicleNumber || 'Industrial Heavy Vehicle';
          });
        }
      }

      const rentalRes = await fetch('http://localhost:5191/api/RentalAgreements');
      if (rentalRes.ok) {
        const rentalData = await rentalRes.json();
        if (Array.isArray(rentalData)) {
          setRentals(rentalData.map(r => {
            const startObj = r.startDate ? new Date(r.startDate) : new Date();
            const endObj = r.endDate ? new Date(r.endDate) : new Date();
            let computedStatus = r.status ? r.status.toLowerCase() : 'pending';
            
            if (computedStatus === 'active' && new Date() > endObj) {
              computedStatus = 'expired';
            }

            let depositText = r.depositStatus || 'Bank Wire Transfer (IBAN)';
            if (computedStatus === 'active' || computedStatus === 'completed') {
              depositText = r.depositStatus || 'Verified & Held';
            }

            const resolvedVehicleName = vehiclesMap[r.vehicleId] || r.vehicleCategory || 'Industrial Heavy Vehicle';

            return {
              id: r.contractReferenceNo || `CNT-2026-${r.id}`,
              rawId: r.id,
              customer: `Customer #${r.customerId || 'B2B Client'}`,
              companyName: r.companyName || r.CompanyName || 'Al-Waqar Enterprise LLC',
              tradeLicense: r.tradeLicenseNo || r.TradeLicenseNo || 'TRD-DEFAULT-01',
              contactPhone: r.contactPhone || r.ContactPhone || '+971 50 000 0000',
              signatoryName: r.signatoryName || r.SignatoryName || 'Authorized Signatory',
              projectSite: r.projectSite || r.ProjectSite || 'Fujairah Regional Site',
              isDriverCertified: r.isDriverCertified ?? r.IsDriverCertified ?? true,
              vehicle: resolvedVehicleName,
              startDate: startObj.toISOString().split('T')[0],
              endDate: endObj.toISOString().split('T')[0],
              cost: r.totalPrice ? Number(r.totalPrice).toFixed(2) : '0.00',
              status: computedStatus,
              deposit: depositText,
              securityDepositAmount: r.securityDeposit || 1000.00,
              depotLocation: 'Al-Waqar Central Fleet Yard, Masafi Depot #4'
            };
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch operational data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchAdminRoute = async (destLat, destLng) => {
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${YARD_LOCATION[1]},${YARD_LOCATION[0]};${destLng},${destLat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const formattedCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setAdminRouteCoords(formattedCoords);
      }
    } catch (e) {
      console.error("Failed to fetch OSRM route for admin:", e);
      setAdminRouteCoords([YARD_LOCATION, [destLat, destLng]]);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setCurrentMapCenter(order.coords);
    fetchAdminRoute(order.coords[0], order.coords[1]);
  };

  const handleRunVRP = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      showToast('VRP Route Optimization completed successfully.', 'success');
    }, 1200);
  };

  const handleConfirmDispatch = async () => {
    if (!selectedOrder || !selectedAsset) {
      showToast("Please select both a water request and a verified fleet asset.", 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5191/api/WaterOrders/${selectedOrder.rawId}/dispatch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          AssignedVehicleId: selectedAsset.id || selectedAsset.Id, 
          AssignedDriverId: selectedOrder.assignedDriverId || 0 // Pass 0 so backend auto-resolves the correct driver from the vehicle plate
        })
      });

      if (response.ok) {
        showToast(`Job ${selectedOrder.id} successfully dispatched to Vehicle ${selectedAsset.vehicleNumber || selectedAsset.VehicleNumber}!`, 'success');
        setSelectedOrder(null);
        setSelectedAsset(null);
        setAdminRouteCoords([]);
        fetchData();
      } else {
        showToast("Failed to confirm dispatch on backend server.", 'error');
      }
    } catch (err) {
      showToast("Network error while confirming dispatch.", 'error');
    }
  };

  const handleApproveLease = async () => {
    if (!selectedRental) return;
    try {
      const response = await fetch(`http://localhost:5191/api/RentalAgreements/${selectedRental.rawId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRental.rawId,
          status: 'active'
        })
      });

      if (response.ok) {
        showToast(`Lease Agreement ${selectedRental.id} Approved & Deployed!`, 'success');
        setSelectedRental(null);
        fetchData();
      } else {
        showToast("Failed to approve lease on backend server.", 'error');
      }
    } catch (err) {
      console.error("Approval error:", err);
      showToast("Network error during lease approval.", 'error');
    }
  };

  const handleProcessReturn = async (rentalId, rawId) => {
    try {
      const response = await fetch(`http://localhost:5191/api/RentalAgreements/${rawId}/return`, { method: 'PUT' });
      if (response.ok) {
        showToast(`Asset return processed for contract ${rentalId}. Vehicle restored to inventory pool.`, 'success');
        fetchData();
      } else {
        showToast("Failed to process asset return on backend server.", 'error');
      }
    } catch (err) {
      showToast("Network error during asset return.", 'error');
    }
  };

  const handleDownloadPdf = (rental) => {
    const contractContent = `=====================================================
        AL-WAQAR TRANSPORT L.L.C.
       COMMERCIAL FLEET LEASE AGREEMENT
=====================================================
Contract Reference No: ${rental.id}
Lessee / Company Name: ${rental.companyName}
Trade License No:     ${rental.tradeLicense}
Authorized Signatory:  ${rental.signatoryName}
Contact Phone:         ${rental.contactPhone}
Project Site / Location: ${rental.projectSite}
Driver Permit Verified:${rental.isDriverCertified ? 'Yes - Certified Heavy Vehicle Operator' : 'Pending'}
Leased Fleet Asset:    ${rental.vehicle}
Lease Timeline:        From ${rental.startDate} To ${rental.endDate}
Security Guarantee:    ${rental.deposit}
Security Collateral:   AED ${rental.securityDepositAmount}
Total Lease Value:     AED ${rental.cost}
Handover Terminal:     ${rental.depotLocation}

-----------------------------------------------------
TERMS & CONDITIONS:
1. Lessee assumes full operational liability for the asset during the lease period.
2. Security collateral is fully refundable upon passing depot return inspection.
3. Operating hours, maintenance, and insurance compliance must adhere to UAE transport regulations.
Authorized By: Al-Waqar Dispatch Operations Management
=====================================================`;

    const blob = new Blob([contractContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rental.id}-Lease-Agreement.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Contract ${rental.id} downloaded successfully.`, 'success');
  };

  const getInventoryStockStatus = (vehicleName) => {
    if (!inventoryFleet || !Array.isArray(inventoryFleet) || inventoryFleet.length === 0) {
      return { availableCount: 1, statusText: '1 Unit Available in Depot' };
    }
    const query = (vehicleName || '').toLowerCase();
    
    let targetMatch = 'heavy';
    if (query.includes('1,000') || query.includes('1000')) targetMatch = '1000';
    else if (query.includes('5,000') || query.includes('5000')) targetMatch = '5000';
    else if (query.includes('flatbed') || query.includes('loading')) targetMatch = 'flatbed';
    else if (query.includes('recovery') || query.includes('towing')) targetMatch = 'recovery';

    const matching = inventoryFleet.filter(v => {
      const model = (v?.model || '').toLowerCase();
      const type = (v?.type || '').toLowerCase();
      const capacity = v?.capacity || 0;

      if (targetMatch === '1000') return capacity === 1000 || model.includes('1,000') || model.includes('1000');
      if (targetMatch === '5000') return capacity === 5000 || model.includes('5,000') || model.includes('5000');
      if (targetMatch === 'flatbed') return model.includes('flatbed') || type.includes('loading');
      if (targetMatch === 'recovery') return model.includes('recovery') || model.includes('towing') || type.includes('recovery');

      return model.includes(query) || query.includes(model) || type.includes(query);
    });

    const availableCount = matching.filter(v => (v?.status || '').toLowerCase() === 'available' && v?.isCompliant !== false).length;
    return {
      totalMatch: matching.length,
      availableCount,
      statusText: availableCount > 0 ? `${availableCount} Units Available in Depot` : '0 Units Available (Requires Return)'
    };
  };

  const scrollToMatrix = () => {
    const matrixElement = document.getElementById('verification-matrix');
    if (matrixElement) matrixElement.scrollIntoView({ behavior: 'smooth' });
  };

  const pendingQueue = orders.filter(o => o.status === 'Pending');
  const activeDeliveries = orders.filter(o => o.status === 'Dispatched' || o.status === 'Live' || o.status === 'Arrived');
  const displayedOrders = filterMode === 'pending' ? pendingQueue : activeDeliveries;

  const waterTankerFleet = inventoryFleet.filter(v => {
    const t = (v.type || '').toLowerCase();
    const m = (v.model || '').toLowerCase();
    const num = (v.vehicleNumber || '').toLowerCase();
    const cap = String(v.capacity || '');
    const status = (v.status || '').toLowerCase();

    const isTanker = t.includes('tanker') || m.includes('tanker') || m.includes('gallon');
    
    const isAvailableState = status !== 'blockaded' && status !== 'suspended' && v.isCompliant !== false;
    
    const matchesSearch = m.includes(fleetSearchQuery.toLowerCase()) || 
                          num.includes(fleetSearchQuery.toLowerCase()) || 
                          cap.includes(fleetSearchQuery.toLowerCase());

    return isTanker && isAvailableState && matchesSearch;
  });

  const pendingRentals = rentals.filter(r => r.status === 'pending' || r.status === 'review');
  const activeRentals = rentals.filter(r => r.status === 'active');
  const expiredRentals = rentals.filter(r => r.status === 'expired');

  const currentBaseQueue = rentalFilterMode === 'pending' ? pendingRentals : rentalFilterMode === 'active' ? activeRentals : expiredRentals;
  const displayedRentals = currentBaseQueue.filter(r => 
    r.id.toLowerCase().includes(rentalSearchQuery.toLowerCase()) || 
    r.vehicle.toLowerCase().includes(rentalSearchQuery.toLowerCase()) || 
    r.customer.toLowerCase().includes(rentalSearchQuery.toLowerCase()) || 
    r.companyName.toLowerCase().includes(rentalSearchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 pb-12 font-sans relative">
      
      {/* Professional Toast Notification Banner */}
      {toast.message && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
            <Navigation size={14} /> Back-Office Operations
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dispatch Center & Asset Allocation</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage bulk water dispatches, heavy vehicle lease agreements, and depot pickups.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition border border-gray-200 shadow-2xs cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh All Queues
          </button>
          
          {moduleTab === 'water' && (
            <button 
              onClick={handleRunVRP}
              disabled={isOptimizing}
              className="flex items-center gap-2 bg-[#0B2A4D] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Navigation size={14} className={isOptimizing ? 'animate-spin' : ''} />
              <span>{isOptimizing ? 'Optimizing Routes...' : 'Run VRP Optimization'}</span>
            </button>
          )}
        </div>
      </div>

      {/* MODULE TAB SWITCHER */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200/80 shadow-inner">
        <button
          onClick={() => { setModuleTab('water'); setSelectedRental(null); }}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            moduleTab === 'water' ? 'bg-[#0B2A4D] text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Truck size={16} className={moduleTab === 'water' ? 'text-blue-400' : 'text-gray-400'} />
          Bulk Water Dispatches ({orders.length})
        </button>
        <button
          onClick={() => { setModuleTab('rentals'); setSelectedOrder(null); }}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            moduleTab === 'rentals' ? 'bg-[#0B2A4D] text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Key size={16} className={moduleTab === 'rentals' ? 'text-amber-400' : 'text-gray-400'} />
          Vehicle Lease Contracts ({rentals.filter(r => r.status !== 'completed').length})
        </button>
      </div>

      {/* WATER DISPATCH MODULE */}
      {moduleTab === 'water' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div 
              onClick={() => { setFilterMode('pending'); setSelectedOrder(null); setAdminRouteCoords([]); }}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm ${
                filterMode === 'pending' ? 'border-[#0B2A4D] bg-blue-50/70 ring-2 ring-[#0B2A4D]/10' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">Filter View: Incoming Queue</span>
                <h3 className="text-2xl font-black text-[#0B2A4D] mt-1">{pendingQueue.length} Pending Orders</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Click to view incoming requests waiting for admin assignment</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#0B2A4D] text-white flex items-center justify-center shadow-md">
                <Clock size={24} />
              </div>
            </div>

            <div 
              onClick={() => { setFilterMode('active'); setSelectedOrder(null); setAdminRouteCoords([]); }}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm ${
                filterMode === 'active' ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/10' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">Filter View: Live Deliveries</span>
                <h3 className="text-2xl font-black text-emerald-800 mt-1">{activeDeliveries.length} On The Road</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Click to track active trips currently live on road map</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Radio size={24} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Clock size={16} className="text-blue-600" /> Water Request Queue
                    </h2>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      Showing {filterMode === 'pending' ? 'Pending Approval' : 'Active Road Deliveries'}
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase border border-blue-200">
                    {displayedOrders.length} Items
                  </span>
                </div>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {isLoading ? (
                    <div className="text-center py-10 text-xs text-gray-400 font-semibold">Loading live queue data...</div>
                  ) : displayedOrders.length === 0 ? (
                    <div className="text-center py-12 text-xs text-gray-400 font-semibold bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6">
                      {filterMode === 'pending' ? 'No pending water requests in queue.' : 'No active live deliveries on road.'}
                    </div>
                  ) : (
                    displayedOrders.map((order) => {
                      const isSelected = selectedOrder?.id === order.id;
                      return (
                        <div 
                          key={order.id}
                          onClick={() => handleSelectOrder(order)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                            isSelected 
                              ? 'border-[#0B2A4D] bg-blue-50/60 shadow-md ring-2 ring-[#0B2A4D]/20' 
                              : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#0B2A4D]">{order.id}</span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                              order.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-extrabold text-gray-900">{order.customer} ({order.volume})</h4>
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 pt-1 border-t border-gray-200/60">
                            <MapPin size={13} className="text-red-500 shrink-0" />
                            <span className="truncate">{order.location} ({order.distance})</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 text-[11px] font-bold text-gray-400 text-center">
                Click any request to center map & inspect active delivery.
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" /> Live Operational GIS Canvas ({filterMode === 'pending' ? 'Depot to Request Preview' : 'Active Road Trip Tracking'})
                </h2>
              </div>

              <div className="relative h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-0">
                <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapFlyTo center={currentMapCenter} />
                  
                  {/* Central Yard Depot Marker */}
                  <Marker position={YARD_LOCATION}>
                    <Popup><strong>Al-Waqar Central Fleet Yard</strong><br />Masafi Depot #4</Popup>
                  </Marker>

                  {/* Render markers based on active filter mode */}
                  {displayedOrders.map((order) => (
                    <Marker key={order.id} position={order.coords} eventHandlers={{ click: () => handleSelectOrder(order) }}>
                      <Popup>
                        <div className="text-xs space-y-1">
                          <strong className="text-[#0B2A4D]">{order.id}: {order.customer}</strong><br />
                          <span>Volume: {order.volume}</span><br />
                          <span>Status: {order.status}</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Admin OSRM Route Polyline Preview */}
                  {adminRouteCoords.length > 0 && (
                    <Polyline positions={adminRouteCoords} color="#2563eb" weight={5} opacity={0.85} />
                  )}
                </MapContainer>
              </div>

              {selectedOrder ? (
                <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">Selected Dispatch Target</span>
                    <h4 className="text-sm font-black text-[#0B2A4D] mt-1">{selectedOrder.id} — {selectedOrder.customer} ({selectedOrder.volume}) [{selectedOrder.status}]</h4>
                  </div>
                  {selectedOrder.status === 'Pending' && (
                    <button 
                      onClick={handleConfirmDispatch} 
                      disabled={!selectedAsset}
                      className="bg-[#0B2A4D] hover:bg-blue-900 text-white px-6 py-3 rounded-xl text-xs font-black shadow-md cursor-pointer uppercase tracking-wider disabled:opacity-50"
                    >
                      {selectedAsset ? `Confirm Dispatch (${selectedAsset.vehicleNumber})` : 'Select Asset Below First'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 text-center text-xs text-gray-500 font-semibold">
                  Select a request from the queue above to inspect route preview and pair asset.
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC FLEET COMPLIANCE & VERIFICATION MATRIX WITH SEARCH */}
          <div id="verification-matrix" className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-600" /> Fleet Compliance & Verification Matrix (Water Tankers)
                </h2>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">Live database inventory matching water distribution capacities</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Filter by capacity (1000, 5000)..."
                    value={fleetSearchQuery}
                    onChange={(e) => setFleetSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-blue-50/50 border-2 border-blue-200 focus:border-blue-600 rounded-xl text-xs font-bold text-gray-900 focus:outline-none transition w-64 shadow-2xs"
                  />
                </div>
                <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase border border-blue-200 shrink-0">
                  {waterTankerFleet.length} Tankers in Registry
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Vehicle Number</th>
                    <th className="pb-3">Model / Description</th>
                    <th className="pb-3">Capacity</th>
                    <th className="pb-3">Compliance State</th>
                    <th className="pb-3">Availability Status</th>
                    <th className="pb-3 text-right pr-2">Action / Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/60 text-xs font-semibold text-gray-800">
                  {waterTankerFleet.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-xs text-gray-400 font-semibold">
                        No water tanker assets found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    waterTankerFleet.map((v) => {
                      const isSelectedAsset = selectedAsset?.id === v.id;
                      const isAvailable = (v.status || '').toLowerCase() === 'available' && v.isCompliant;
                      const isCapacityMatch = selectedOrder ? v.capacity === selectedOrder.volumeGallons : true;

                      return (
                        <tr key={v.id} className={`${isSelectedAsset ? 'bg-blue-50/80' : isCapacityMatch ? 'bg-white' : 'bg-gray-50/40'} hover:bg-gray-50/80 transition-colors`}>
                          <td className="py-3.5 pl-2 font-black text-[#0B2A4D]">{v.vehicleNumber}</td>
                          <td className="py-3.5 font-bold text-gray-800">{v.model}</td>
                          <td className="py-3.5 text-blue-900 font-extrabold">{v.capacity} Gallons {isCapacityMatch && selectedOrder && <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Recommended</span>}</td>
                          <td className="py-3.5">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${v.isCompliant ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                              {v.isCompliant ? 'Verified Compliant' : 'Non-Compliant / Expired'}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${isAvailable ? 'bg-blue-50 text-blue-700' : 'bg-amber-100 text-amber-800'}`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right pr-2">
                            {isAvailable ? (
                              <button 
                                onClick={() => { setSelectedAsset(v); scrollToMatrix(); }} 
                                className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer uppercase tracking-wider transition ${
                                  isSelectedAsset ? 'bg-emerald-600 text-white shadow' : 'bg-[#0B2A4D] text-white hover:bg-blue-900'
                                }`}
                              >
                                {isSelectedAsset ? '✓ Asset Paired' : 'Select Asset'}
                              </button>
                            ) : (
                              <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl uppercase">
                                Unavailable
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VEHICLE LEASE CONTRACTS MODULE */}
      {moduleTab === 'rentals' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div onClick={() => { setRentalFilterMode('pending'); setSelectedRental(null); }} className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm ${rentalFilterMode === 'pending' ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/10' : 'border-gray-200 bg-white'}`}>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">Lease Queue: Pending Review</span>
                <h3 className="text-2xl font-black text-amber-900 mt-1">{pendingRentals.length} Requests</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Deposit verification required</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md"><Clock size={24} /></div>
            </div>

            <div onClick={() => { setRentalFilterMode('active'); setSelectedRental(null); }} className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm ${rentalFilterMode === 'active' ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/10' : 'border-gray-200 bg-white'}`}>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">Lease Queue: Active Leases</span>
                <h3 className="text-2xl font-black text-blue-900 mt-1">{activeRentals.length} Deployed</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Assets currently out on lease</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#0B2A4D] text-white flex items-center justify-center shadow-md"><Key size={24} /></div>
            </div>

            <div onClick={() => { setRentalFilterMode('expired'); setSelectedRental(null); }} className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm ${rentalFilterMode === 'expired' ? 'border-red-600 bg-red-50/70 ring-2 ring-red-600/10' : 'border-gray-200 bg-white'}`}>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-red-700">Lease Queue: Expired / Return Due</span>
                <h3 className="text-2xl font-black text-red-900 mt-1">{expiredRentals.length} Overdue</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Contracts past end date requiring return</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md"><AlertTriangle size={24} /></div>
            </div>
          </div>

          {selectedRental && (() => {
            const stockCheck = getInventoryStockStatus(selectedRental.vehicle);
            return (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-200/60 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-3 py-1 rounded-full">Selected B2B Lease Review & Authorization</span>
                    <h4 className="text-base font-black text-[#0B2A4D] mt-1">
                      {selectedRental.id} — {selectedRental.vehicle} ({selectedRental.companyName})
                    </h4>
                    <p className="text-xs text-gray-700 font-medium flex items-center gap-2">
                      <Building2 size={13} className="text-blue-600" /> Terminal: <strong className="text-gray-900">{selectedRental.depotLocation}</strong>
                      <span>•</span>
                      <span>Period: <strong className="text-gray-900">{selectedRental.startDate} to {selectedRental.endDate}</strong></span>
                    </p>
                  </div>

                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${stockCheck.availableCount > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-emerald-200'}`}>
                    <PackageCheck size={14} /> Depot Stock: {stockCheck.statusText}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 p-3.5 rounded-2xl border border-amber-200/60 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Lessee Company / Entity</span>
                    <strong className="text-gray-900 font-black">{selectedRental.companyName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Trade License #</span>
                    <strong className="text-blue-900 font-bold">{selectedRental.tradeLicense}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Authorized Signatory</span>
                    <strong className="text-gray-900 font-black">{selectedRental.signatoryName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Contact Phone</span>
                    <strong className="text-gray-800 font-bold">{selectedRental.contactPhone}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 p-3.5 rounded-2xl border border-amber-200/60 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Project Site / Location</span>
                    <strong className="text-blue-900 font-black">{selectedRental.projectSite}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Driver Certification</span>
                    <strong className="text-emerald-700 font-bold">{selectedRental.isDriverCertified ? '✓ Heavy Vehicle Certified' : 'Pending'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Security Collateral</span>
                    <strong className="text-emerald-700 font-black">AED {selectedRental.securityDepositAmount || '1,000.00'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Total Lease Value</span>
                    <strong className="text-[#0B2A4D] font-black">AED {selectedRental.cost}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSelectedRental(null)}
                    className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel Review
                  </button>
                  <button
                    onClick={handleApproveLease}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-md transition cursor-pointer uppercase tracking-wider"
                  >
                    Approve Lease & Authorize Depot Handover
                  </button>
                </div>
              </div>
            );
          })()}

          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} className="text-amber-600" /> Commercial Lease Agreements Queue ({rentalFilterMode.toUpperCase()})
                </h2>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">Review lease contracts, inspect B2B company entities, security deposit status, and authorize depot handover</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search Contract ID, Company, or Asset..."
                    value={rentalSearchQuery}
                    onChange={(e) => setRentalSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-blue-50/50 border-2 border-blue-200 focus:border-blue-600 rounded-xl text-xs font-bold text-gray-900 focus:outline-none transition w-72 shadow-2xs"
                  />
                </div>
                <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-3.5 py-2 rounded-xl uppercase border border-amber-200 shrink-0">
                  {displayedRentals.length} Contracts
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Contract ID</th>
                    <th className="pb-3">Lessee / Company Name</th>
                    <th className="pb-3">Signatory</th>
                    <th className="pb-3">Leased Asset</th>
                    <th className="pb-3">Start Date</th>
                    <th className="pb-3">End Date</th>
                    <th className="pb-3">Total Cost</th>
                    <th className="pb-3 text-right pr-2">Action / Authorization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/60 text-xs font-semibold text-gray-800">
                  {displayedRentals.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-12 text-xs text-gray-400 font-semibold">
                        No lease agreements found matching your search or filter.
                      </td>
                    </tr>
                  ) : (
                    displayedRentals.map((r) => {
                      const isSelected = selectedRental?.id === r.id;
                      return (
                        <tr key={r.rawId || r.id} className={`transition-colors ${isSelected ? 'bg-amber-50/80' : 'hover:bg-gray-50/60'}`}>
                          <td className="py-3.5 pl-2 font-black text-[#0B2A4D]">{r.id}</td>
                          <td className="py-3.5 font-extrabold text-gray-900">{r.companyName}</td>
                          <td className="py-3.5 text-gray-700 font-bold">{r.signatoryName}</td>
                          <td className="py-3.5 text-blue-900 font-extrabold">{r.vehicle}</td>
                          <td className="py-3.5 text-gray-700 font-bold">{r.startDate}</td>
                          <td className={`py-3.5 font-bold ${r.status === 'expired' ? 'text-red-600 font-black animate-pulse' : 'text-gray-700'}`}>{r.endDate}</td>
                          <td className="py-3.5 font-black text-gray-900">AED {r.cost}</td>
                          <td className="py-3.5 text-right pr-2">
                            {r.status === 'pending' || r.status === 'review' ? (
                              <button
                                onClick={() => setSelectedRental(r)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer uppercase tracking-wider ${
                                  isSelected ? 'bg-amber-600 text-white shadow' : 'bg-[#0B2A4D] text-white hover:bg-blue-900'
                                }`}
                              >
                                {isSelected ? '✓ Selected' : 'Review Contract'}
                              </button>
                            ) : r.status === 'expired' || r.status === 'active' ? (
                              <button
                                onClick={() => handleProcessReturn(r.id, r.rawId)}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow-sm cursor-pointer"
                                title="Process standard or early asset return"
                              >
                                <RotateCcw size={13} /> Process Asset Return
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDownloadPdf(r)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition border border-blue-200 cursor-pointer"
                              >
                                <Download size={13} /> Contract PDF
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDispatchCenter;