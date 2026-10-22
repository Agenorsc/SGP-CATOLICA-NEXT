'use client';

import React from 'react';
import { 
  CorrectionScanner, 
  CorrectionScannerProps, 
  ScannerState 
} from './CorrectionScanner';

export type StageCorrection = 'IDLE' | 'READING_STUDENT' | 'READING_OMR' | 'RESULT_MIRROR';

export type LeituraTabProps = CorrectionScannerProps;

export function LeituraTab(props: LeituraTabProps) {
  return <CorrectionScanner {...props} />;
}

export { CorrectionScanner };
export type { ScannerState };
