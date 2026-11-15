import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  Field,
  CheckinData,
  ClimateData,
  StrategyResult,
  PDFConsentOptions,
} from '../../types/index';
import { ALGORITHM_VERSION, CATALOGUE_VERSION } from '../../domain/agronomy/constants';

interface GenerateReportOptions {
  field: Field;
  checkin?: CheckinData | null;
  climate?: ClimateData | null;
  strategies: StrategyResult[];
  consent: PDFConsentOptions;
  userEmail?: string;
  rainfallAdjustment?: number;
}

export function generateFieldReport(options: GenerateReportOptions): void {
  const {
    field,
    checkin,
    climate,
    strategies,
    consent,
    userEmail,
    rainfallAdjustment = 0,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [27, 67, 50]; // #1B4332 (Forest Green)
  const secondaryColor: [number, number, number] = [45, 106, 79]; // #2D6A4F
  const darkTextColor: [number, number, number] = [15, 23, 42]; // #0F172A

  let currentY = 18;

  // ─────────────────────────────────────────────────────────────
  // 1. HEADER & BRANDING
  // ─────────────────────────────────────────────────────────────
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TerraCrop — Agroclimatology & Crop Rotation Report', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `NASA Space Apps Challenge 2024 • Engine v${ALGORITHM_VERSION} • Catalogue v${CATALOGUE_VERSION}`,
    14,
    19,
  );

  currentY = 32;

  // ─────────────────────────────────────────────────────────────
  // 2. FIELD & FARMER PROFILE
  // ─────────────────────────────────────────────────────────────
  doc.setTextColor(...darkTextColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Field: ${field.name}`, 14, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const locationText = [field.village, field.district].filter(Boolean).join(', ') || 'Sri Lanka';
  doc.text(`Administrative Location: ${locationText}`, 14, currentY);
  currentY += 4.5;

  if (consent.includeExactCoordinates) {
    doc.text(
      `Exact Coordinates (Consent Granted): ${field.latitude.toFixed(6)}° N, ${field.longitude.toFixed(6)}° E`,
      14,
      currentY,
    );
  } else {
    doc.text(
      'Exact Coordinates: Redacted (Farmer consent omitted for public distribution)',
      14,
      currentY,
    );
  }
  currentY += 4.5;

  if (field.area) {
    doc.text(`Reported Area: ${field.area} ${field.areaUnit || 'ha'}`, 14, currentY);
    currentY += 4.5;
  }

  doc.text(`Report Generated: ${new Date().toLocaleDateString('en-GB')} for ${userEmail || 'Registered Farmer'}`, 14, currentY);
  currentY += 7;

  // ─────────────────────────────────────────────────────────────
  // 3. OBSERVED NASA CLIMATE METRICS
  // ─────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('Observed Agroclimatology (NASA POWER AG Community)', 14, currentY);
  currentY += 2;

  const climateRows = climate?.summary
    ? [
        [
          'Rainfall (PRECTOTCORR)',
          `${climate.summary.rainfallTotal ?? 'N/A'} mm (${climate.summary.rainfallDays} days >0.1mm)`,
          'MERRA-2 corrected precipitation (not GPM)',
        ],
        [
          'Temperature (T2M)',
          `${climate.summary.avgTemp ?? 'N/A'} °C (Range: ${climate.summary.minTemp}°C to ${climate.summary.maxTemp}°C)`,
          'NASA POWER 2m air temperature',
        ],
        [
          'Relative Humidity (RH2M)',
          `${climate.summary.avgHumidity ?? 'N/A'} %`,
          '2m relative humidity',
        ],
        [
          'Wind Speed (WS2M)',
          `${climate.summary.avgWindSpeed ?? 'N/A'} m/s`,
          '2m wind speed',
        ],
        [
          'Solar Radiation (ALLSKY_SFC)',
          `${climate.summary.avgSolarRadiation ?? 'N/A'} MJ/m²/day`,
          'All Sky Surface Shortwave Downward',
        ],
        [
          'Root Zone Moisture (GWETROOT)',
          `${climate.summary.avgRootZoneMoisture ?? 'N/A'} fraction (0–1)`,
          'Dimensionless root zone wetness fraction',
        ],
      ]
    : [
        [
          'Climate Data',
          'Historical 90-day NASA data was not retrieved for this report',
          'N/A',
        ],
      ];

  autoTable(doc, {
    startY: currentY,
    head: [['Parameter Code', 'Observed Value', 'Scientific Data Source & Description']],
    body: climateRows,
    theme: 'grid',
    headStyles: { fillColor: secondaryColor, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: darkTextColor },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Spatial resolution note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Spatial Resolution: ~0.5° × 0.625° grid (~50km regional assimilation). Data source: power.larc.nasa.gov. UTC time standard.',
    14,
    currentY,
  );
  currentY += 6;

  // ─────────────────────────────────────────────────────────────
  // 4. FIELD CHECK-IN PROFILE
  // ─────────────────────────────────────────────────────────────
  if (checkin) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('Field Check-in Profile & Soil Provenance', 14, currentY);
    currentY += 2;

    const checkinRows = [
      ['Current Crop / State', checkin.currentCrop, 'Farmer recorded status'],
      ['Previous Crops', (checkin.previousCrops || []).join(', ') || 'None reported', 'Rotation history'],
      [
        'Land Tenure & Horizon',
        `${checkin.landTenure}${checkin.leaseEndDate ? ` (Lease expires: ${checkin.leaseEndDate})` : ''}`,
        'Tenancy timeline constraint',
      ],
      ['Harvest Window Desired', `${checkin.harvestWindow} days`, 'Farmer operational cycle'],
      [
        'Water Access & Reliability',
        `${checkin.waterAccess.replace('_', ' ')} (${checkin.waterReliability || 'N/A'})`,
        'Irrigation source',
      ],
      [
        'Soil Texture',
        checkin.soilTexture || 'Unknown',
        checkin.soilTextureProvenance ? `Provenance: ${checkin.soilTextureProvenance}` : 'Not tested',
      ],
      [
        'Soil pH',
        checkin.soilPH !== null && checkin.soilPH !== undefined ? String(checkin.soilPH) : 'Unknown',
        checkin.soilPHProvenance ? `Provenance: ${checkin.soilPHProvenance}` : 'Not tested',
      ],
      [
        'Soil Drainage',
        checkin.soilDrainage || 'Unknown',
        checkin.soilDrainageProvenance ? `Provenance: ${checkin.soilDrainageProvenance}` : 'Not tested',
      ],
      [
        'Wildlife Observations',
        (checkin.observedWildlife || []).join(', ') || 'None noted',
        'Informational only (does not penalize ranking)',
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Attribute', 'Value', 'Methodology & Provenance']],
      body: checkinRows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: darkTextColor },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // ─────────────────────────────────────────────────────────────
  // 5. STRATEGY RECOMMENDATIONS (PAGE 2)
  // ─────────────────────────────────────────────────────────────
  doc.addPage();
  currentY = 18;

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Crop Rotation Strategies & Score Breakdown', 14, 11);

  currentY = 24;

  if (rainfallAdjustment !== 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(3, 105, 161);
    doc.text(
      `Scenario Simulation Active: Rainfall modified by ${rainfallAdjustment > 0 ? '+' : ''}${rainfallAdjustment}% (What-if scenario — not a forecast).`,
      14,
      currentY,
    );
    currentY += 5;
  }

  strategies.forEach((strat) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...primaryColor);
    doc.text(`Strategy: ${strat.label}`, 14, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(strat.description, 14, currentY);
    currentY += 2;

    const topCrops = strat.recommendations.slice(0, 4);

    const stratRows = topCrops.map((r) => [
      r.crop.name,
      `${r.score.total}/100`,
      `${r.score.climate}/30`,
      `${r.score.water}/25`,
      `${r.score.soil}/20`,
      `${r.score.seasonRotation}/15`,
      `${r.score.farmerPreference}/10`,
      r.score.reasons.slice(0, 2).join('; ') || 'Suitable',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          'Crop',
          'Score',
          'Climate (30)',
          'Water (25)',
          'Soil (20)',
          'Season (15)',
          'Farmer (10)',
          'Key Agronomic Reasons',
        ],
      ],
      body: stratRows,
      theme: 'striped',
      headStyles: { fillColor: secondaryColor, textColor: 255, fontSize: 7 },
      bodyStyles: { fontSize: 7, textColor: darkTextColor },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  });

  // ─────────────────────────────────────────────────────────────
  // 6. MANDATORY CAVEATS & EXTENSION OFFICER DISCLAIMER
  // ─────────────────────────────────────────────────────────────
  doc.setFillColor(254, 243, 199); // Light yellow box
  doc.rect(14, currentY, 182, 34, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text('IMPORTANT AGRONOMIC NOTICE & MANDATORY DISCLAIMER:', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  const disclaimerText = [
    '1. VERIFY WITH A LOCAL AGRICULTURAL OFFICER: This automated assessment provides advisory decision-support based on regional satellite data and general crop physiology. Always consult your regional Agricultural Extension Officer (Agrarian Services Center) prior to purchasing seeds or altering cropping cycles.',
    '2. NO YIELD OR FINANCIAL GUARANTEES: TerraCrop does not provide yield predictions, chemical fertilizer recommendations, or pest control directives.',
    '3. CLIMATE VARIABILITY: NASA POWER data reflects regional grid measurements and historical trends. Microclimates, localized cloudbursts, or seasonal drought anomalies can diverge from regional estimates.',
  ];

  let lineY = currentY + 11;
  disclaimerText.forEach((line) => {
    const split = doc.splitTextToSize(line, 174);
    doc.text(split, 18, lineY);
    lineY += split.length * 3.5;
  });

  // Save PDF file
  const filename = `TerraCrop_Report_${field.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
