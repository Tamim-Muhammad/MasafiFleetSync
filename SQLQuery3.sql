IF NOT EXISTS (SELECT 1 FROM Vehicles WHERE VehicleNumber = 'V-1000T')
INSERT INTO Vehicles (VehicleNumber, Model, Type, Capacity, ChassisNumber, YearOfManufacture, Status, InsurancePolicyNumber, InsuranceExpiryDate, MulkiyaNumber, RegistrationExpiryDate, MulkiyaDocumentUrl, InsuranceDocumentUrl, VehiclePhotoUrl, FleetCategory, IsCompliant)
VALUES ('V-1000T', '1,000 Gallon Compact Water Tanker', 'Water Tanker', 1000, 'CHS-UAE-99881', 2023, 'Available', 'POL-99812-A', '2027-06-30', 'MULK-55441', '2027-05-15', '/docs/mulkiya1.pdf', '/docs/ins1.pdf', '/images/v1000t.jpg', 'Rental Catalog Asset', 1);

IF NOT EXISTS (SELECT 1 FROM Vehicles WHERE VehicleNumber = 'V-5000T')
INSERT INTO Vehicles (VehicleNumber, Model, Type, Capacity, ChassisNumber, YearOfManufacture, Status, InsurancePolicyNumber, InsuranceExpiryDate, MulkiyaNumber, RegistrationExpiryDate, MulkiyaDocumentUrl, InsuranceDocumentUrl, VehiclePhotoUrl, FleetCategory, IsCompliant)
VALUES ('V-5000T', '5,000 Gallon Heavy Water Tanker', 'Water Tanker', 5000, 'CHS-UAE-44322', 2024, 'Available', 'POL-44321-B', '2026-11-20', 'MULK-77882', '2026-10-10', '/docs/mulkiya2.pdf', '/docs/ins2.pdf', '/images/v5000t.jpg', 'Rental Catalog Asset', 1);

IF NOT EXISTS (SELECT 1 FROM Vehicles WHERE VehicleNumber = 'V-5000T-2')
INSERT INTO Vehicles (VehicleNumber, Model, Type, Capacity, ChassisNumber, YearOfManufacture, Status, InsurancePolicyNumber, InsuranceExpiryDate, MulkiyaNumber, RegistrationExpiryDate, MulkiyaDocumentUrl, InsuranceDocumentUrl, VehiclePhotoUrl, FleetCategory, IsCompliant)
VALUES ('V-5000T-2', '5,000 Gallon Heavy Water Tanker', 'Water Tanker', 5000, 'CHS-UAE-44323', 2024, 'Available', 'POL-44321-C', '2027-02-15', 'MULK-77883', '2027-01-10', '/docs/mulkiya2b.pdf', '/docs/ins2b.pdf', '/images/v5000t.jpg', 'Rental Catalog Asset', 1);

IF NOT EXISTS (SELECT 1 FROM Vehicles WHERE VehicleNumber = 'V-FLT01')
INSERT INTO Vehicles (VehicleNumber, Model, Type, Capacity, ChassisNumber, YearOfManufacture, Status, InsurancePolicyNumber, InsuranceExpiryDate, MulkiyaNumber, RegistrationExpiryDate, MulkiyaDocumentUrl, InsuranceDocumentUrl, VehiclePhotoUrl, FleetCategory, IsCompliant)
VALUES ('V-FLT01', 'Heavy Loading Flatbed Truck', 'Loading Asset', 8000, 'CHS-UAE-11233', 2022, 'Rented', 'POL-11234-C', '2027-01-15', 'MULK-33221', '2026-12-01', '/docs/mulkiya3.pdf', '/docs/ins3.pdf', '/images/flatbed.jpg', 'Rental Catalog Asset', 1);

IF NOT EXISTS (SELECT 1 FROM Vehicles WHERE VehicleNumber = 'V-FLT02')
INSERT INTO Vehicles (VehicleNumber, Model, Type, Capacity, ChassisNumber, YearOfManufacture, Status, InsurancePolicyNumber, InsuranceExpiryDate, MulkiyaNumber, RegistrationExpiryDate, MulkiyaDocumentUrl, InsuranceDocumentUrl, VehiclePhotoUrl, FleetCategory, IsCompliant)
VALUES ('V-FLT02', 'Heavy Loading Flatbed Truck', 'Loading Asset', 8000, 'CHS-UAE-11234', 2023, 'Available', 'POL-11234-D', '2027-04-20', 'MULK-33222', '2027-03-10', '/docs/mulkiya3b.pdf', '/docs/ins3b.pdf', '/images/flatbed.jpg', 'Rental Catalog Asset', 1);

IF NOT EXISTS (SELECT 1 FROM Vehicles WHERE VehicleNumber = 'V-TOW01')
INSERT INTO Vehicles (VehicleNumber, Model, Type, Capacity, ChassisNumber, YearOfManufacture, Status, InsurancePolicyNumber, InsuranceExpiryDate, MulkiyaNumber, RegistrationExpiryDate, MulkiyaDocumentUrl, InsuranceDocumentUrl, VehiclePhotoUrl, FleetCategory, IsCompliant)
VALUES ('V-TOW01', 'Heavy Recovery & Towing Truck', 'Recovery Asset', 3000, 'CHS-UAE-99002', 2023, 'Available', 'POL-55678-D', '2027-08-12', 'MULK-99001', '2027-07-01', '/docs/mulkiya4.pdf', '/docs/ins4.pdf', '/images/towtruck.jpg', 'Internal', 1);

IF NOT EXISTS (SELECT 1 FROM Vehicles WHERE VehicleNumber = 'V-TOW02')
INSERT INTO Vehicles (VehicleNumber, Model, Type, Capacity, ChassisNumber, YearOfManufacture, Status, InsurancePolicyNumber, InsuranceExpiryDate, MulkiyaNumber, RegistrationExpiryDate, MulkiyaDocumentUrl, InsuranceDocumentUrl, VehiclePhotoUrl, FleetCategory, IsCompliant)
VALUES ('V-TOW02', 'Heavy Recovery & Towing Truck', 'Recovery Asset', 3000, 'CHS-UAE-99003', 2024, 'Available', 'POL-55678-E', '2027-09-15', 'MULK-99002', '2027-08-01', '/docs/mulkiya4b.pdf', '/docs/ins4b.pdf', '/images/towtruck.jpg', 'Internal', 1);

IF NOT EXISTS (SELECT 1 FROM Vehicles WHERE VehicleNumber = 'V-CAR01')
INSERT INTO Vehicles (VehicleNumber, Model, Type, Capacity, ChassisNumber, YearOfManufacture, Status, InsurancePolicyNumber, InsuranceExpiryDate, MulkiyaNumber, RegistrationExpiryDate, MulkiyaDocumentUrl, InsuranceDocumentUrl, VehiclePhotoUrl, FleetCategory, IsCompliant)
VALUES ('V-CAR01', 'Industrial Cargo Transport Truck', 'Cargo Transport', 12000, 'CHS-UAE-77661', 2022, 'Available', 'POL-77661-X', '2027-05-10', 'MULK-88111', '2027-04-01', '/docs/mulkiya5.pdf', '/docs/ins5.pdf', '/images/cargo.jpg', 'Rental Catalog Asset', 1);