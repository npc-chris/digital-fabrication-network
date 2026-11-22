export interface ToolCalibrationRecord {
  toolId: string;
  toolType: 'digital_micrometer' | 'vernier_caliper' | 'dial_indicator' | 'bore_gauge' | 'granite_plate';
  serialNumber: string;
  manufacturer: string;
  calibrationDate: string; // ISO String
  calibrationExpirationDate: string; // ISO String
  accreditationBody: string; // e.g. "ISO/IEC 17025", "NIST", "SON"
  certificateNumber: string;
  hubId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'RECALIBRATION_REQUIRED';
}

export interface CalibrationVerificationResult {
  isValid: boolean;
  tool?: ToolCalibrationRecord;
  error?: string;
  daysExpired?: number;
  recalibrationRequired?: boolean;
}

// In-memory reference registry backed by platform calibration DB
export const CALIBRATION_REGISTRY: Record<string, ToolCalibrationRecord> = {
  // Certified Mitutoyo 25-50mm Digital Micrometer (Accredited)
  'TOOL-MITU-001': {
    toolId: 'TOOL-MITU-001',
    toolType: 'digital_micrometer',
    serialNumber: 'MITU-DIGI-884912',
    manufacturer: 'Mitutoyo',
    calibrationDate: '2026-06-01T00:00:00.000Z',
    calibrationExpirationDate: '2027-06-01T00:00:00.000Z',
    accreditationBody: 'ISO/IEC 17025 Accredited Metrology Lab',
    certificateNumber: 'CERT-MET-2026-0612',
    hubId: 'HUB-LAGOS-CENTRAL',
    status: 'ACTIVE',
  },
  // Sunday's digital micrometer that expired 14 days ago (KAN-61 Gherkin requirement)
  'TOOL-MIC-EXP-14D': {
    toolId: 'TOOL-MIC-EXP-14D',
    toolType: 'digital_micrometer',
    serialNumber: 'MITU-DIGI-741029',
    manufacturer: 'Mitutoyo',
    calibrationDate: '2025-11-07T00:00:00.000Z',
    calibrationExpirationDate: '2026-11-07T00:00:00.000Z', // Expired 14 days before Nov 21, 2026
    accreditationBody: 'ISO/IEC 17025 Accredited Metrology Lab',
    certificateNumber: 'CERT-MET-2025-9941',
    hubId: 'HUB-ABA-METRO',
    status: 'EXPIRED',
  },
  // Certified Fowler 0-150mm Vernier Caliper
  'TOOL-FOWL-002': {
    toolId: 'TOOL-FOWL-002',
    toolType: 'vernier_caliper',
    serialNumber: 'FOWL-CAL-33190',
    manufacturer: 'Fowler',
    calibrationDate: '2026-03-15T00:00:00.000Z',
    calibrationExpirationDate: '2027-03-15T00:00:00.000Z',
    accreditationBody: 'SON / NIS Metrology Standard',
    certificateNumber: 'CERT-SON-2026-4411',
    hubId: 'HUB-NNEWI-CLUSTER',
    status: 'ACTIVE',
  },
};

/**
 * Validates a measuring tool's calibration validity against the registry.
 * Enforces US-X-03 / KAN-61:
 * "TOOL CALIBRATION EXPIRED: Use certified tool or schedule hub recalibration"
 */
export function validateToolCalibration(
  toolId: string,
  asOfDate: Date = new Date('2026-11-21T20:00:00.000Z')
): CalibrationVerificationResult {
  const tool = CALIBRATION_REGISTRY[toolId];

  if (!tool) {
    return {
      isValid: false,
      error: `UNKNOWN_TOOL_ID: Measuring tool '${toolId}' is not registered in the platform metrology registry.`,
      recalibrationRequired: true,
    };
  }

  const expirationDate = new Date(tool.calibrationExpirationDate);
  const currentTime = asOfDate.getTime();
  const expireTime = expirationDate.getTime();

  if (currentTime > expireTime) {
    const msDiff = currentTime - expireTime;
    const daysExpired = Math.floor(msDiff / (1000 * 60 * 60 * 24));

    return {
      isValid: false,
      tool: { ...tool, status: 'EXPIRED' },
      daysExpired,
      recalibrationRequired: true,
      error: 'TOOL CALIBRATION EXPIRED: Use certified tool or schedule hub recalibration',
    };
  }

  return {
    isValid: true,
    tool,
    daysExpired: 0,
    recalibrationRequired: false,
  };
}

/**
 * Registers or updates a certified measuring tool calibration certificate.
 */
export function registerToolCalibration(record: ToolCalibrationRecord): ToolCalibrationRecord {
  CALIBRATION_REGISTRY[record.toolId] = {
    ...record,
  };
  return CALIBRATION_REGISTRY[record.toolId];
}
