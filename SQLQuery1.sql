INSERT INTO Vehicles (VehicleNumber, Model, Type, Capacity, Status, InsurancePolicyNo, InsuranceExpiry, RegistrationExpiry)
VALUES 
-- Tankers
('TNK-701', 'Isuzu FTR Tanker 2023', 'Water Tanker', 15000.00, 'Available', 'POL-99812-A', '2027-06-30', '2027-05-15'),
('TNK-702', 'Hino 500 Series', 'Fuel Tanker', 25000.00, 'On Trip', 'POL-44321-B', '2026-11-20', '2026-10-10'),
('TNK-703', 'UD Trucks Quester', 'Chemical Tanker', 20000.00, 'Maintenance', 'POL-11234-C', '2027-01-15', '2026-12-01'),

-- Cargo & Transport Trucks
('TRK-401', 'JAC N-Series Cargo', 'Flatbed Truck', 10000.00, 'Available', 'POL-55678-D', '2027-08-12', '2027-07-01'),
('TRK-402', 'Master Forland 4x2', 'Box Truck', 8000.00, 'On Trip', 'POL-33219-E', '2026-12-31', '2026-11-30'),
('TRK-403', 'Hyundai Mighty EX8', 'Refrigerated Truck', 7500.00, 'Available', 'POL-77890-F', '2027-04-10', '2027-03-25'),

-- Fleet Rentals / Light Commercial
('RNT-201', 'Toyota Hilux Revo', 'Pickup Rental', 1200.00, 'Available', 'POL-88901-G', '2027-09-15', '2027-08-30'),
('RNT-202', 'Toyota HiAce Panel Van', 'Cargo Van', 1500.00, 'On Trip', 'POL-22345-H', '2027-02-28', '2027-01-15'),

-- Support / Recovery Dispatch
('REC-101', 'Isuzu FVR Recovery', 'Tow Truck', 5000.00, 'Available', 'POL-66543-I', '2027-10-05', '2027-09-10');
