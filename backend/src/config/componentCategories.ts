// Component Categories Configuration
// Hierarchical structure: Category -> Subcategory -> Application

export interface CategoryDefinition {
  id: string;
  name: string;
  subcategories: SubcategoryDefinition[];
}

export interface SubcategoryDefinition {
  id: string;
  name: string;
  applications?: string[];
}

export const COMPONENT_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'electrical',
    name: 'Electrical',
    subcategories: [
      {
        id: 'power',
        name: 'Power Components',
        applications: ['Voltage Regulators', 'Power Supplies', 'Batteries', 'Solar Panels', 'Inverters', 'UPS Systems'],
      },
      {
        id: 'passive',
        name: 'Passive Components',
        applications: ['Resistors', 'Capacitors', 'Inductors', 'Transformers', 'Fuses', 'Ferrites'],
      },
      {
        id: 'active',
        name: 'Active Components',
        applications: ['Transistors', 'Diodes', 'Thyristors', 'MOSFETs', 'IGBTs', 'Triacs'],
      },
      {
        id: 'signal',
        name: 'Signal Processing',
        applications: ['Op-Amps', 'Comparators', 'ADC/DAC', 'Amplifiers', 'Filters', 'Oscillators'],
      },
      {
        id: 'rf',
        name: 'RF & Communication',
        applications: ['Antennas', 'RF Modules', 'Transceivers', 'WiFi Modules', 'Bluetooth Modules', 'LoRa', 'GSM Modules'],
      },
      {
        id: 'microcontrollers',
        name: 'Microcontrollers & Processors',
        applications: ['Arduino', 'ESP32', 'Raspberry Pi', 'STM32', 'PIC', 'AVR', 'ARM'],
      },
      {
        id: 'displays',
        name: 'Displays & Indicators',
        applications: ['LCDs', 'OLEDs', 'LEDs', '7-Segment', 'TFT Screens', 'E-Paper'],
      },
      {
        id: 'connectors',
        name: 'Connectors & Interfaces',
        applications: ['USB', 'HDMI', 'RJ45', 'Terminal Blocks', 'Headers', 'Sockets', 'Plugs'],
      },
    ],
  },
  {
    id: 'mechanical',
    name: 'Mechanical',
    subcategories: [
      {
        id: 'motors',
        name: 'Motors & Drives',
        applications: ['DC Motors', 'Stepper Motors', 'Servo Motors', 'Brushless Motors', 'Gear Motors', 'Motor Drivers'],
      },
      {
        id: 'actuators',
        name: 'Actuators & Solenoids',
        applications: ['Linear Actuators', 'Solenoids', 'Pneumatic Cylinders', 'Hydraulic Cylinders', 'Relays'],
      },
      {
        id: 'bearings',
        name: 'Bearings & Bushings',
        applications: ['Ball Bearings', 'Roller Bearings', 'Linear Bearings', 'Bushings', 'Pillow Blocks'],
      },
      {
        id: 'gears',
        name: 'Gears & Transmission',
        applications: ['Spur Gears', 'Bevel Gears', 'Timing Belts', 'Chains', 'Pulleys', 'Couplings'],
      },
      {
        id: 'fasteners',
        name: 'Fasteners & Hardware',
        applications: ['Screws', 'Nuts', 'Bolts', 'Washers', 'Rivets', 'Standoffs', 'Brackets'],
      },
      {
        id: 'linear',
        name: 'Linear Motion',
        applications: ['Lead Screws', 'Ball Screws', 'Linear Rails', 'Slides', 'Linear Guides'],
      },
      {
        id: 'structural',
        name: 'Structural Components',
        applications: ['Extrusions', 'Profiles', 'Frames', 'Mounts', 'Enclosures'],
      },
    ],
  },
  {
    id: 'sensors',
    name: 'Sensors & Modules',
    subcategories: [
      {
        id: 'environmental',
        name: 'Environmental Sensors',
        applications: ['Temperature', 'Humidity', 'Pressure', 'Gas', 'Air Quality', 'Light'],
      },
      {
        id: 'motion',
        name: 'Motion & Position',
        applications: ['Accelerometers', 'Gyroscopes', 'IMU', 'Encoders', 'Proximity', 'Ultrasonic'],
      },
      {
        id: 'imaging',
        name: 'Imaging & Vision',
        applications: ['Cameras', 'Image Sensors', 'IR Cameras', 'Thermal Imaging', 'Barcode Scanners'],
      },
      {
        id: 'current_voltage',
        name: 'Current & Voltage',
        applications: ['Current Sensors', 'Voltage Sensors', 'Power Meters', 'Hall Effect'],
      },
      {
        id: 'biometric',
        name: 'Biometric Sensors',
        applications: ['Fingerprint', 'Heart Rate', 'Pulse Oximeter', 'ECG', 'EMG'],
      },
    ],
  },
  {
    id: 'materials',
    name: 'Materials',
    subcategories: [
      {
        id: 'metals',
        name: 'Metals & Alloys',
        applications: ['Aluminum', 'Steel', 'Copper', 'Brass', 'Stainless Steel', 'Titanium'],
      },
      {
        id: 'plastics',
        name: 'Plastics & Polymers',
        applications: ['ABS', 'PLA', 'PETG', 'Nylon', 'Polycarbonate', 'Acrylic', 'HDPE'],
      },
      {
        id: 'composites',
        name: 'Composites',
        applications: ['Carbon Fiber', 'Fiberglass', 'Kevlar', 'Foam Core'],
      },
      {
        id: 'adhesives',
        name: 'Adhesives & Tapes',
        applications: ['Epoxy', 'Super Glue', 'Hot Glue', 'Thermal Paste', 'Double-Sided Tape'],
      },
      {
        id: 'filaments',
        name: '3D Printing Filaments',
        applications: ['PLA', 'ABS', 'PETG', 'TPU', 'Nylon', 'Wood Fill', 'Metal Fill'],
      },
    ],
  },
  {
    id: 'thermal',
    name: 'Thermal Management',
    subcategories: [
      {
        id: 'cooling',
        name: 'Cooling Solutions',
        applications: ['Heatsinks', 'Fans', 'Blowers', 'Heat Pipes', 'Water Cooling'],
      },
      {
        id: 'heating',
        name: 'Heating Elements',
        applications: ['Heating Cartridges', 'Heat Beds', 'Heating Wire', 'Peltier Modules'],
      },
      {
        id: 'insulation',
        name: 'Thermal Insulation',
        applications: ['Thermal Pads', 'Insulation Tape', 'Thermal Sleeves'],
      },
    ],
  },
  {
    id: 'chemical',
    name: 'Chemical & Fluids',
    subcategories: [
      {
        id: 'solvents',
        name: 'Solvents & Cleaners',
        applications: ['Isopropyl Alcohol', 'Acetone', 'Flux Cleaner', 'Contact Cleaner'],
      },
      {
        id: 'lubricants',
        name: 'Lubricants & Greases',
        applications: ['Machine Oil', 'Silicone Grease', 'PTFE Lubricant', 'Lithium Grease'],
      },
      {
        id: 'resins',
        name: 'Resins & Coatings',
        applications: ['UV Resin', 'Epoxy Resin', 'Conformal Coating', 'Potting Compound'],
      },
    ],
  },
  {
    id: 'tools',
    name: 'Tools & Equipment',
    subcategories: [
      {
        id: 'hand_tools',
        name: 'Hand Tools',
        applications: ['Screwdrivers', 'Pliers', 'Wrenches', 'Cutters', 'Crimpers', 'Tweezers'],
      },
      {
        id: 'power_tools',
        name: 'Power Tools',
        applications: ['Drills', 'Grinders', 'Saws', 'Heat Guns', 'Soldering Stations'],
      },
      {
        id: 'measurement',
        name: 'Measurement & Testing',
        applications: ['Multimeters', 'Oscilloscopes', 'Power Supplies', 'Calipers', 'Micrometers'],
      },
      {
        id: 'workholding',
        name: 'Workholding',
        applications: ['Vises', 'Clamps', 'Jigs', 'Fixtures', 'Helping Hands'],
      },
    ],
  },
  {
    id: 'consumables',
    name: 'Consumables',
    subcategories: [
      {
        id: 'wires_cables',
        name: 'Wires & Cables',
        applications: ['Hookup Wire', 'Ribbon Cable', 'Coaxial Cable', 'Ethernet Cable', 'Power Cable'],
      },
      {
        id: 'soldering',
        name: 'Soldering Supplies',
        applications: ['Solder Wire', 'Solder Paste', 'Flux', 'Desoldering Braid', 'Solder Tips'],
      },
      {
        id: 'pcb',
        name: 'PCB & Prototyping',
        applications: ['Breadboards', 'Perfboards', 'PCB Blanks', 'Jumper Wires', 'Header Pins'],
      },
      {
        id: 'enclosures',
        name: 'Enclosures & Cases',
        applications: ['Project Boxes', 'Rack Mounts', 'DIN Rail', 'Panel Mounts'],
      },
    ],
  },
];
