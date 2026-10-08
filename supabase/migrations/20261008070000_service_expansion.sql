-- Owner-authorized expansion; stable service IDs used by intake and vendor coverage.
INSERT INTO public.services (id, name, slug) VALUES
('hvac', 'Heating & Cooling', 'hvac'),
('roofing', 'Roofing', 'roofing'),
('house-cleaning', 'House Cleaning', 'house-cleaning'),
('gutters', 'Gutter Services', 'gutters'),
('pest-control', 'Pest Control', 'pest-control'),
('junk-removal', 'Junk Removal', 'junk-removal'),
('tree-services', 'Tree Services', 'tree-services'),
('appliance-repair', 'Appliance Repair', 'appliance-repair')
ON CONFLICT (id) DO NOTHING;
