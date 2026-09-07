// 1980s Retro Modem & Telecommunications Diagnostic Code Generator

export interface ModemDiagnosticReport {
  timestamp: string;
  errorCode: string;
  errorName: string;
  severity: 'CRITICAL' | 'WARNING' | 'FAULT';
  baudRate: number;
  protocol: string;
  port: string;
  irq: number;
  baseAddress: string;
  leds: {
    hs: boolean; // High Speed (2400)
    aa: boolean; // Auto Answer
    cd: boolean; // Carrier Detect (false = lost)
    oh: boolean; // Off Hook (true = off hook)
    rd: boolean; // Receive Data
    sd: boolean; // Send Data
    tr: boolean; // Terminal Ready
    mr: boolean; // Modem Ready
  };
  uartRegisters: {
    name: string;
    hex: string;
    bits: string;
    desc: string;
  }[];
  sRegisters: { register: string; value: string; desc: string }[];
  hexDump: string[];
  telemetrySignature: string;
  troubleshootingSteps: string[];
}

const ERROR_TEMPLATES = [
  {
    code: '0x7E14',
    name: 'CARRIER_DETECT_TIMEOUT (NO CARRIER)',
    severity: 'CRITICAL' as const,
    protocol: 'CCITT V.22bis / Bell 212A',
    baudRate: 2400,
    steps: [
      'Verify RJ-11 modular telephone line cord is seated firmly in LINE jack.',
      'Listen for local dialtone on handset; confirm line voltage is ~48V DC idle.',
      'Check if pulse/tone dialing switch is set to Tone (T) on PBX network.',
      'Issue ATH0 command to hang up, followed by ATZ to reset modem registers.',
    ],
  },
  {
    code: '0x3F88',
    name: 'UART_8250_FRAMING_ERROR (FRAME MISMATCH)',
    severity: 'FAULT' as const,
    protocol: 'ASYNC 8-N-1 (Start/Stop parity fault)',
    baudRate: 1200,
    steps: [
      'Verify serial port baud rate matches remote host (1200 / 2400 baud).',
      'Check RS-232 DB-25 cable shielding and ground continuity pin 7.',
      'Inspect 8250 UART crystal oscillator (1.8432 MHz) on PC6300 motherboard.',
      'Re-initialize line control register (LCR) to 0x03 for 8 Data Bits, 1 Stop Bit.',
    ],
  },
  {
    code: '0x00D7',
    name: 'NO_DIALTONE_DETECTED (OFF HOOK FAULT)',
    severity: 'CRITICAL' as const,
    protocol: 'POTS ANALOG LOOPBACK',
    baudRate: 300,
    steps: [
      'Verify telephone company central office (CO) loop current is active.',
      'Ensure telephone handset is placed properly into acoustic coupler cradle.',
      'Inspect line protection MOV varistor and line coupling transformer (600 ohm).',
      'Issue ATX1 to disable dial tone detection if operating on noisy private circuit.',
    ],
  },
  {
    code: '0x8086',
    name: 'BUS_TIMEOUT_IRQ4_HANDSHAKE_STALL',
    severity: 'FAULT' as const,
    protocol: 'PC/XT EXPANSION BUS TIMEOUT',
    baudRate: 2400,
    steps: [
      'Check COM1 / IRQ4 jumper settings on expansion serial card.',
      'Verify 8259 Interrupt Controller mask register allows IRQ 4.',
      'Power down chassis, clean gold edge fingers with isopropyl alcohol and reseat card.',
      'Run AT&F in terminal to reload default factory profile from NVRAM.',
    ],
  },
];

/**
 * Generates an authentic 1980s retro modem diagnostic report
 */
export function generateModemDiagnostic(customSeed?: number): ModemDiagnosticReport {
  const seed = customSeed !== undefined ? customSeed : Math.floor(Math.random() * 100000);
  const template = ERROR_TEMPLATES[seed % ERROR_TEMPLATES.length];

  const hexSuffix = (seed % 0xffff).toString(16).toUpperCase().padStart(4, '0');
  const errorCode = `ERR-MODEM-${template.code}-${hexSuffix}`;

  const now = new Date();
  const timestamp = `${now.toISOString().replace('T', ' ').slice(0, 19)} PST`;

  const uartRegisters = [
    { name: 'RBR/THR (0x3F8)', hex: '0x00', bits: '00000000', desc: 'Transmit/Receive Buffer (Empty)' },
    { name: 'IER     (0x3F9)', hex: '0x01', bits: '00000001', desc: 'Received Data Available Interrupt Enable' },
    { name: 'IIR     (0x3FA)', hex: '0x01', bits: '00000001', desc: 'Interrupt ID: No Interrupt Pending' },
    { name: 'LCR     (0x3FB)', hex: '0x03', bits: '00000011', desc: 'Line Control: 8 Bits, No Parity, 1 Stop' },
    { name: 'MCR     (0x3FC)', hex: '0x0B', bits: '00001011', desc: 'Modem Control: DTR=1, RTS=1, OUT2=1' },
    { name: 'LSR     (0x3FD)', hex: '0x60', bits: '01100000', desc: 'Line Status: Transmit Empty (THRE|TEMT)' },
    { name: 'MSR     (0x3FE)', hex: '0x00', bits: '00000000', desc: 'Modem Status: DCD=0, DSR=0, CTS=0, RI=0' },
  ];

  const sRegisters = [
    { register: 'S0', value: '000', desc: 'Ring count on auto-answer (0 = disabled)' },
    { register: 'S1', value: '000', desc: 'Ring counter' },
    { register: 'S2', value: '043', desc: 'Escape character code (43 = ASCII +)' },
    { register: 'S6', value: '002', desc: 'Wait time for dial tone before blind dial (seconds)' },
    { register: 'S7', value: '030', desc: 'Wait time for carrier detect (seconds)' },
    { register: 'S8', value: '002', desc: 'Pause time for dial modifier comma (seconds)' },
    { register: 'S9', value: '006', desc: 'Carrier detect response time (tenths of sec)' },
    { register: 'S10', value: '014', desc: 'Lost carrier hang up delay (tenths of sec)' },
  ];

  // 4 rows of 16-byte raw hex memory dump
  const hexDump: string[] = [
    `0x03F8:  00 01 01 03 0B 60 00 00  00 00 00 00 00 00 00 00  |.....\`..........|`,
    `0x0400:  2B 2B 2B 41 54 44 54 20  35 35 35 2D 32 33 36 38  |+++ATDT 555-2368|`,
    `0x0410:  4E 4F 20 43 41 52 52 49  45 52 0D 0A 00 00 7E 14  |NO CARRIER....~.|`,
    `0x0420:  56 2E 32 32 62 69 73 20  48 41 59 45 53 2D 32 34  |V.22bis HAYES-24|`,
  ];

  const telemetrySignature = `SHA256:[${template.code}:${hexSuffix}:4A9F:B872:19EC:4E53]`;

  return {
    timestamp,
    errorCode,
    errorName: template.name,
    severity: template.severity,
    baudRate: template.baudRate,
    protocol: template.protocol,
    port: 'COM1: / DEV-0x03F8',
    irq: 4,
    baseAddress: '0x03F8',
    leds: {
      hs: template.baudRate >= 2400,
      aa: false,
      cd: false, // Carrier Detect LOST
      oh: true,  // Off Hook
      rd: false,
      sd: true,  // Attempting to send
      tr: true,  // Terminal ready
      mr: true,  // Modem power on
    },
    uartRegisters,
    sRegisters,
    hexDump,
    telemetrySignature,
    troubleshootingSteps: template.steps,
  };
}

/**
 * Simulates Hayes AT commands for interactive modem testing
 */
export function processHayesCommand(cmd: string): {
  input: string;
  response: string[];
  audioAction?: 'dialtone' | 'handshake' | 'error' | 'click';
} {
  const normalized = cmd.trim().toUpperCase();

  if (!normalized) {
    return { input: '', response: [''] };
  }

  if (normalized === 'AT') {
    return {
      input: cmd,
      response: ['OK'],
      audioAction: 'click',
    };
  }

  if (normalized === '+++') {
    return {
      input: '+++',
      response: ['OK (ESCAPE TO COMMAND MODE)'],
      audioAction: 'click',
    };
  }

  if (normalized === 'ATZ') {
    return {
      input: cmd,
      response: [
        'OK',
        'MODEM REGISTERS RESET TO NON-VOLATILE EEPROM PROFILE 0',
      ],
      audioAction: 'click',
    };
  }

  if (normalized === 'ATH0') {
    return {
      input: cmd,
      response: ['OK', 'ON-HOOK (DISCONNECTED)'],
      audioAction: 'click',
    };
  }

  if (normalized === 'ATH1') {
    return {
      input: cmd,
      response: ['OK', 'OFF-HOOK (LINE SEIZED, MONITORING DIAL TONE)'],
      audioAction: 'dialtone',
    };
  }

  if (normalized.startsWith('ATDT') || normalized.startsWith('ATDP')) {
    const number = normalized.slice(4).trim() || '555-HERMES';
    return {
      input: cmd,
      response: [
        `DIALING: ${number}...`,
        'WAITING FOR REMOTE CARRIER DETECT...',
        'NO CARRIER',
        'DIAGNOSTIC HINT: Remote carrier silent or line open. Check modem cable.',
      ],
      audioAction: 'error',
    };
  }

  if (normalized === 'ATI' || normalized === 'ATI0') {
    return {
      input: cmd,
      response: ['2400', 'OK'],
      audioAction: 'click',
    };
  }

  if (normalized === 'ATI3' || normalized === 'ATI4') {
    return {
      input: cmd,
      response: [
        'HAYES SMARTMODEM 2400B (PC/XT INTERNAL)',
        'ROM BIOS REVISION 2.21 // BELL 212A / CCITT V.22bis',
        'CHIP: ROCKWELL RC224AT/1',
        'OK',
      ],
      audioAction: 'click',
    };
  }

  if (normalized === 'AT&F') {
    return {
      input: cmd,
      response: ['OK', 'FACTORY DEFAULTS RELOADED'],
      audioAction: 'click',
    };
  }

  if (normalized === 'AT&V') {
    return {
      input: cmd,
      response: [
        'ACTIVE PROFILE:',
        'B0 E1 L2 M1 N1 Q0 V1 W0 X4 Y0 &C1 &D2 &G0 &J0 &K3 &Q5 &R1 &S0 &T5 &X0',
        'S00:000 S01:000 S02:043 S03:013 S04:010 S05:008 S06:002 S07:030',
        'S08:002 S09:006 S10:014 S11:070 S12:050',
        'OK',
      ],
      audioAction: 'click',
    };
  }

  if (normalized.startsWith('ATS') && normalized.endsWith('?')) {
    const regNum = normalized.slice(3, -1);
    return {
      input: cmd,
      response: [`REGISTER S${regNum} = 000`, 'OK'],
      audioAction: 'click',
    };
  }

  return {
    input: cmd,
    response: [
      `ERROR: UNRECOGNIZED COMMAND '${cmd}'`,
      `VALID AT COMMANDS: AT, ATZ, ATH0, ATH1, ATDT <NUM>, ATI3, AT&F, AT&V`,
    ],
    audioAction: 'error',
  };
}
