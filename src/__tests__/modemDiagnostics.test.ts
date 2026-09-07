import { generateModemDiagnostic, processHayesCommand } from '../utils/modemDiagnostics';
import { executeTerminalCommand } from '../utils/terminalCommands';

describe('Modem Diagnostics & Offline Fallback Subsystem', () => {
  test('should generate valid modem diagnostic report with retro error code', () => {
    const report = generateModemDiagnostic();
    expect(report.errorCode).toMatch(/^ERR-MODEM-0x[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(report.errorName).toBeDefined();
    expect(['CRITICAL', 'FAULT', 'WARNING']).toContain(report.severity);
    expect(report.port).toContain('COM1');
    expect(report.irq).toBe(4);
    expect(report.telemetrySignature).toContain('SHA256:');
  });

  test('should generate complete UART 8250 register diagnostics', () => {
    const report = generateModemDiagnostic(42);
    expect(report.uartRegisters.length).toBeGreaterThanOrEqual(6);
    const registerNames = report.uartRegisters.map((r) => r.name);
    expect(registerNames.some((n) => n.includes('LSR'))).toBe(true);
    expect(registerNames.some((n) => n.includes('MSR'))).toBe(true);
    expect(registerNames.some((n) => n.includes('LCR'))).toBe(true);
  });

  test('should include Hayes front-panel LED indicators with carrier lost', () => {
    const report = generateModemDiagnostic();
    expect(report.leds.cd).toBe(false); // Carrier Detect lost
    expect(report.leds.mr).toBe(true);  // Modem Ready on
    expect(report.leds.tr).toBe(true);  // Terminal Ready on
  });

  test('should provide hex dump raster memory lines', () => {
    const report = generateModemDiagnostic();
    expect(report.hexDump).toHaveLength(4);
    report.hexDump.forEach((line) => {
      expect(line).toMatch(/^0x0[34][0-9A-F]{2}:/);
    });
  });

  test('should include actionable operator troubleshooting instructions', () => {
    const report = generateModemDiagnostic();
    expect(report.troubleshootingSteps.length).toBeGreaterThan(2);
    report.troubleshootingSteps.forEach((step) => {
      expect(step.length).toBeGreaterThan(10);
    });
  });

  describe('Hayes AT Command Processor', () => {
    test('should respond OK to AT and ATZ commands', () => {
      const atResult = processHayesCommand('AT');
      expect(atResult.response).toContain('OK');

      const atzResult = processHayesCommand('ATZ');
      expect(atzResult.response[0]).toBe('OK');
      expect(atzResult.response[1]).toContain('RESET');
    });

    test('should simulate off-hook dialtone acquisition for ATH1', () => {
      const result = processHayesCommand('ATH1');
      expect(result.response[0]).toBe('OK');
      expect(result.response[1]).toContain('OFF-HOOK');
      expect(result.audioAction).toBe('dialtone');
    });

    test('should report NO CARRIER on dialing attempts', () => {
      const result = processHayesCommand('ATDT 555-2368');
      expect(result.response.some((l) => l.includes('NO CARRIER'))).toBe(true);
      expect(result.audioAction).toBe('error');
    });

    test('should provide modem hardware identification for ATI3', () => {
      const result = processHayesCommand('ATI3');
      expect(result.response.some((l) => l.includes('HAYES SMARTMODEM 2400B'))).toBe(true);
      expect(result.response.some((l) => l.includes('V.22bis'))).toBe(true);
    });

    test('should report error on invalid AT commands', () => {
      const result = processHayesCommand('INVALID_CMD');
      expect(result.response[0]).toContain('ERROR: UNRECOGNIZED COMMAND');
      expect(result.audioAction).toBe('error');
    });
  });

  describe('DOS Terminal Integration for MODEM', () => {
    test('should process MODEM / OFFLINE commands in DOS terminal', () => {
      const context = {
        theme: 'dark' as const,
        setTheme: jest.fn(),
        fidoSession: null,
        onReboot: jest.fn(),
        onOpenRefinement: jest.fn(),
        onClose: jest.fn(),
      };

      const results = executeTerminalCommand('MODEM', context);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].text).toContain('HAYES SMARTMODEM 2400 CONTROLLER');
      expect(results[0].text).toContain('CARRIER DETECT LOST');
    });
  });
});
