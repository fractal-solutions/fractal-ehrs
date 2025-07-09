
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const TOOTH_STATUSES = {
  NONE: 'None',
  HEALTHY: 'Healthy',
  DECAY: 'Decay',
  FILLING: 'Filling',
  CROWN: 'Crown',
  EXTRACTION: 'Extraction',
  ROOT_CANAL: 'Root Canal',
  IMPLANT: 'Implant',
  MISSING: 'Missing',
};





const ADULT_TEETH_QUADRANTS = {
  UPPER_RIGHT: [18, 17, 16, 15, 14, 13, 12, 11],
  UPPER_LEFT: [21, 22, 23, 24, 25, 26, 27, 28],
  LOWER_LEFT: [31, 32, 33, 34, 35, 36, 37, 38],
  LOWER_RIGHT: [41, 42, 43, 44, 45, 46, 47, 48],
};

const Tooth = ({ number, toothData, onToothClick }) => {
  const status = toothData?.status || TOOTH_STATUSES.HEALTHY;
  const colorMap = {
    [TOOTH_STATUSES.NONE]: '#FFFFFF', // White or transparent
    [TOOTH_STATUSES.HEALTHY]: '#22C55E', // Green-500
    [TOOTH_STATUSES.DECAY]: '#EAB308', // Yellow-500
    [TOOTH_STATUSES.FILLING]: '#3B82F6', // Blue-500
    [TOOTH_STATUSES.CROWN]: '#A855F7', // Purple-500
    [TOOTH_STATUSES.EXTRACTION]: '#EF4444', // Red-500
    [TOOTH_STATUSES.ROOT_CANAL]: '#F97316', // Orange-500
    [TOOTH_STATUSES.IMPLANT]: '#14B8A6', // Teal-500
    [TOOTH_STATUSES.MISSING]: '#6B7280', // Gray-500
  };
  const backgroundColor = colorMap[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="h-6 w-6 rounded-full flex items-center justify-center cursor-pointer text-white font-bold text-xs"
          style={{ backgroundColor: backgroundColor }}
        >
          {status === TOOTH_STATUSES.MISSING && (
            <svg width="18" height="18" viewBox="0 0 18 18" className="absolute">
              <line x1="4" y1="4" x2="14" y2="14" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="4" y1="14" x2="14" y2="4" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.values(TOOTH_STATUSES).map((s) => (
          <DropdownMenuItem key={s} onSelect={() => onToothClick(s)}>
            {s}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const DentalFormula = ({ initialFormula, onFormulaChange }) => {
  const [formula, setFormula] = React.useState(initialFormula || {});

  const handleToothClick = (toothNumber, newStatus) => {
    const newFormula = { ...formula, [toothNumber]: { status: newStatus } };
    setFormula(newFormula);
    if (onFormulaChange) {
      onFormulaChange(newFormula);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dental Formula</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {/* Upper Right */}
          <div className="flex justify-end gap-0.5">
            {ADULT_TEETH_QUADRANTS.UPPER_RIGHT.map((toothNumber) => (
              <div key={toothNumber} className="flex flex-col items-center">
                <span className="text-xs font-bold mb-1">{toothNumber}</span>
                <Tooth
                  toothData={formula[toothNumber]}
                  onToothClick={(newStatus) => handleToothClick(toothNumber, newStatus)}
                />
              </div>
            ))}
          </div>
          {/* Upper Left */}
          <div className="flex justify-start gap-0.5">
            {ADULT_TEETH_QUADRANTS.UPPER_LEFT.map((toothNumber) => (
              <div key={toothNumber} className="flex flex-col items-center">
                <span className="text-xs font-bold mb-1">{toothNumber}</span>
                <Tooth
                  toothData={formula[toothNumber]}
                  onToothClick={(newStatus) => handleToothClick(toothNumber, newStatus)}
                />
              </div>
            ))}
          </div>
          {/* Lower Right */}
          <div className="flex justify-end gap-0.5">
            {ADULT_TEETH_QUADRANTS.LOWER_RIGHT.map((toothNumber) => (
              <div key={toothNumber} className="flex flex-col items-center">
                <Tooth
                  toothData={formula[toothNumber]}
                  onToothClick={(newStatus) => handleToothClick(toothNumber, newStatus)}
                />
                <span className="text-xs font-bold mt-1">{toothNumber}</span>
              </div>
            ))}
          </div>
          {/* Lower Left */}
          <div className="flex justify-start gap-0.5">
            {ADULT_TEETH_QUADRANTS.LOWER_LEFT.map((toothNumber) => (
              <div key={toothNumber} className="flex flex-col items-center">
                <Tooth
                  toothData={formula[toothNumber]}
                  onToothClick={(newStatus) => handleToothClick(toothNumber, newStatus)}
                />
                <span className="text-xs font-bold mt-1">{toothNumber}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {Object.entries(TOOTH_STATUSES).map(([key, status]) => {
            const colorMap = {
              [TOOTH_STATUSES.NONE]: '#FFFFFF', // White or transparent
              [TOOTH_STATUSES.HEALTHY]: '#22C55E', // Green-500
              [TOOTH_STATUSES.DECAY]: '#EAB308', // Yellow-500
              [TOOTH_STATUSES.FILLING]: '#3B82F6', // Blue-500
              [TOOTH_STATUSES.CROWN]: '#A855F7', // Purple-500
              [TOOTH_STATUSES.EXTRACTION]: '#EF4444', // Red-500
              [TOOTH_STATUSES.ROOT_CANAL]: '#F97316', // Orange-500
              [TOOTH_STATUSES.IMPLANT]: '#14B8A6', // Teal-500
              [TOOTH_STATUSES.MISSING]: '#6B7280', // Gray-500
            };
            const color = colorMap[status];
            return (
              <div key={status} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs">{status}</span>
              </div>
            );
          })}
        </div>


      </CardContent>
    </Card>
  );
};
