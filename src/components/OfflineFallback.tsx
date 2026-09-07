import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  WifiOff, 
  RefreshCw, 
  Terminal, 
  Copy, 
  Check, 
  ArrowRight, 
  Cpu, 
  Wrench,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { 
  generateModemDiagnostic, 
  processHayesCommand, 
  ModemDiagnosticReport 
} from '../utils/modemDiagnostics';
import { retroAudio } from '../utils/audio';

interface OfflineFallbackProps {
  isOffline: boolean;
  onRetryConnection?: () => void;
  onDismiss?: () => void;
  isManualTest?: boolean;
}

export const OfflineFallback: React.FC<OfflineFallbackProps> = ({
  isOffline,
  onRetryConnection,
  onDismiss,
  isManualTest = false,
}) => {
  const [diagnostic, setDiagnostic] = useState<ModemDiagnosticReport>(() => generateModemDiagnostic());
  const [copied, setCopied] = useState(false);
  const [atCommandInput, setAtCommandInput] = useState('');
  const [atTerminalHistory, setAtTerminalHistory] = useState<{ cmd: string; resp: string[] }[]>([
    { cmd: 'ATDT 555-HERMES', resp: ['DIALING...', 'CONNECT 2400 / CCITT V.22bis', 'CARRIER SIGNAL LOST: LINE DISCONNECTED', 'NO CARRIER'] },
  ]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<string | null>(null);
  const [showHayesTerminal, setShowHayesTerminal] = useState(false);

  // Play warning error tone on initial mount
  useEffect(() => {
    if (isOffline) {
      retroAudio.playModemError();
    }
  }, [isOffline]);

  // Keyboard shortcut: ESC to dismiss / proceed offline
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onDismiss) {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  const handleGenerateNewCode = () => {
    retroAudio.playKeyclick();
    const newReport = generateModemDiagnostic();
    setDiagnostic(newReport);
    setCopied(false);
  };

  const handleCopyReport = async () => {
    retroAudio.playKeyclick();
    const textDump = `======================================================================
AT&T PC6300 // HAYES SMARTMODEM TELECOM DIAGNOSTIC REPORT
======================================================================
ERROR CODE    : ${diagnostic.errorCode}
NAME          : ${diagnostic.errorName}
SEVERITY      : ${diagnostic.severity}
PORT / IRQ    : ${diagnostic.port} (IRQ ${diagnostic.irq})
BAUD / PROTO  : ${diagnostic.baudRate} BAUD (${diagnostic.protocol})
TIMESTAMP     : ${diagnostic.timestamp}
SIGNATURE     : ${diagnostic.telemetrySignature}

[UART 8250 REGISTER DUMP]
${diagnostic.uartRegisters.map((r) => `${r.name.padEnd(16)} : ${r.hex} (${r.bits}) - ${r.desc}`).join('\n')}

[HAYES S-REGISTERS]
${diagnostic.sRegisters.map((s) => `${s.register} = ${s.value.padEnd(6)} [${s.desc}]`).join('\n')}

[RAW VRAM HEX DUMP]
${diagnostic.hexDump.join('\n')}

[OPERATOR ACTIONS]
${diagnostic.troubleshootingSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
======================================================================`;

    try {
      await navigator.clipboard.writeText(textDump);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleRunAtCommand = (cmdToRun?: string) => {
    const command = cmdToRun !== undefined ? cmdToRun : atCommandInput;
    if (!command.trim()) return;

    const result = processHayesCommand(command);

    if (result.audioAction === 'dialtone') {
      retroAudio.playDialTone(0.8);
    } else if (result.audioAction === 'error') {
      retroAudio.playModemError();
    } else if (result.audioAction === 'handshake') {
      retroAudio.playCarrierHandshake();
    } else {
      retroAudio.playKeyclick();
    }

    setAtTerminalHistory((prev) => [...prev.slice(-6), { cmd: result.input, resp: result.response }]);
    setAtCommandInput('');
  };

  const handleRetry = () => {
    retroAudio.playDialTone(0.5);
    setIsRetrying(true);
    setRetryResult('TESTING LOCAL CARRIER & MODEM LOOPBACK...');

    setTimeout(() => {
      const online = typeof navigator !== 'undefined' ? navigator.onLine : false;
      setIsRetrying(false);
      if (online && !isManualTest) {
        retroAudio.playBootSuccess();
        setRetryResult('CARRIER RESTORED: CONNECT 2400 (V.22bis ACKNOWLEDGED)');
        setTimeout(() => {
          if (onRetryConnection) onRetryConnection();
          if (onDismiss) onDismiss();
        }, 1200);
      } else {
        retroAudio.playModemError();
        setRetryResult('CARRIER TEST FAILED: NO_CARRIER (RJ-11 DISCONNECTED)');
      }
    }, 1200);
  };

  if (!isOffline) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="offline-modem-fallback-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-50 bg-[#0c0d0e] text-[#55ff55] p-3 sm:p-6 md:p-10 overflow-y-auto select-none font-mono flex flex-col justify-between"
        style={{ textShadow: '0 0 4px rgba(85, 255, 85, 0.4)' }}
      >
        {/* Top BIOS Banner */}
        <div>
          <div className="border-b border-[#2d552d] pb-3 mb-4 flex flex-wrap justify-between items-center text-xs sm:text-sm text-[#88cc88]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-[#ff5555] rounded-none animate-ping" />
              <span>AT&amp;T PC6300 CGA ROM BIOS // VERSION 2.2</span>
              <span className="text-[#ff5555] font-bold">[COMM EXCEPTION: 0x7E]</span>
            </div>
            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              {isManualTest && (
                <span className="px-2 py-0.5 text-[10px] border border-[#ffaa00] text-[#ffaa00] bg-[#ffaa00]/10">
                  DIAGNOSTIC TEST MODE
                </span>
              )}
              {onDismiss && (
                <button
                  id="offline-dismiss-btn"
                  onClick={() => {
                    retroAudio.playKeyclick();
                    onDismiss();
                  }}
                  className="px-2.5 py-1 text-xs border border-[#55ff55] text-[#55ff55] hover:bg-[#55ff55] hover:text-[#0c0d0e] transition-colors cursor-pointer"
                >
                  [ WORK OFFLINE: ESC ]
                </button>
              )}
            </div>
          </div>

          {/* Prominent Header Banner */}
          <div className="border border-[#ff5555] bg-[#ff5555]/10 p-3 sm:p-4 mb-4 text-[#ff5555]">
            <div className="flex items-center gap-3 mb-1">
              <WifiOff className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff5555] animate-pulse" />
              <h1 className="text-sm sm:text-lg md:text-xl font-bold tracking-wider">
                *** CONNECTION ERROR: CHECK MODEM ***
              </h1>
            </div>
            <div className="text-xs sm:text-sm text-[#ff9999] leading-relaxed">
              COMMUNICATION SUBSYSTEM OFFLINE // CARRIER DETECT (CD) SIGNAL DEASSERTED (0V).
              REMOTE HOST UNREACHABLE ON TELCO LOOPBACK CIRCUIT.
            </div>
          </div>

          {/* Hayes Smartmodem Front Panel Virtual LED Bank */}
          <div className="border border-[#2d552d] bg-black/60 p-3 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#2d552d] text-[11px] text-[#88cc88]">
              <div className="flex items-center gap-2 font-bold">
                <Radio className="w-3.5 h-3.5 text-[#55ff55]" />
                <span>HAYES SMARTMODEM 2400 FRONT PANEL (BELL 212A / CCITT V.22bis)</span>
              </div>
              <span>PORT: COM1 (0x03F8) • IRQ 4</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-[10px]">
              {/* HS */}
              <div className="p-1.5 border border-[#2d552d] bg-black/40">
                <div className={`w-2.5 h-2.5 mx-auto rounded-full mb-1 ${diagnostic.leds.hs ? 'bg-[#ffb000] shadow-[0_0_5px_#ffb000]' : 'bg-[#332200]'}`} />
                <span className="font-bold">HS</span>
                <div className="text-[8px] opacity-60">2400</div>
              </div>
              {/* AA */}
              <div className="p-1.5 border border-[#2d552d] bg-black/40">
                <div className={`w-2.5 h-2.5 mx-auto rounded-full mb-1 ${diagnostic.leds.aa ? 'bg-[#ff5555] shadow-[0_0_5px_#ff5555]' : 'bg-[#331111]'}`} />
                <span className="font-bold">AA</span>
                <div className="text-[8px] opacity-60">ANSWER</div>
              </div>
              {/* CD - ALERT */}
              <div className="p-1.5 border border-[#ff5555] bg-[#ff5555]/15 animate-pulse">
                <div className="w-2.5 h-2.5 mx-auto rounded-full mb-1 bg-[#ff0000] shadow-[0_0_6px_#ff0000]" />
                <span className="font-bold text-[#ff5555]">CD</span>
                <div className="text-[8px] text-[#ff7777] font-bold">LOST</div>
              </div>
              {/* OH */}
              <div className="p-1.5 border border-[#2d552d] bg-black/40">
                <div className={`w-2.5 h-2.5 mx-auto rounded-full mb-1 ${diagnostic.leds.oh ? 'bg-[#ff5555] shadow-[0_0_5px_#ff5555]' : 'bg-[#331111]'}`} />
                <span className="font-bold">OH</span>
                <div className="text-[8px] opacity-60">OFF HOOK</div>
              </div>
              {/* RD */}
              <div className="p-1.5 border border-[#2d552d] bg-black/40">
                <div className={`w-2.5 h-2.5 mx-auto rounded-full mb-1 ${diagnostic.leds.rd ? 'bg-[#55ff55] shadow-[0_0_5px_#55ff55]' : 'bg-[#113311]'}`} />
                <span className="font-bold">RD</span>
                <div className="text-[8px] opacity-60">RCV DATA</div>
              </div>
              {/* SD */}
              <div className="p-1.5 border border-[#2d552d] bg-black/40">
                <div className={`w-2.5 h-2.5 mx-auto rounded-full mb-1 ${diagnostic.leds.sd ? 'bg-[#55ff55] shadow-[0_0_5px_#55ff55]' : 'bg-[#113311]'}`} />
                <span className="font-bold">SD</span>
                <div className="text-[8px] opacity-60">SEND DATA</div>
              </div>
              {/* TR */}
              <div className="p-1.5 border border-[#2d552d] bg-black/40">
                <div className={`w-2.5 h-2.5 mx-auto rounded-full mb-1 ${diagnostic.leds.tr ? 'bg-[#55ff55] shadow-[0_0_5px_#55ff55]' : 'bg-[#113311]'}`} />
                <span className="font-bold">TR</span>
                <div className="text-[8px] opacity-60">TERM RDY</div>
              </div>
              {/* MR */}
              <div className="p-1.5 border border-[#2d552d] bg-black/40">
                <div className={`w-2.5 h-2.5 mx-auto rounded-full mb-1 ${diagnostic.leds.mr ? 'bg-[#ff5555] shadow-[0_0_5px_#ff5555]' : 'bg-[#331111]'}`} />
                <span className="font-bold">MR</span>
                <div className="text-[8px] opacity-60">MODEM RDY</div>
              </div>
            </div>
          </div>

          {/* Diagnostic Code Generator & Register Dump */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Left Col: Diagnostic Register Details */}
            <div className="lg:col-span-2 border border-[#2d552d] bg-black/50 p-3 sm:p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2d552d] text-xs">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#3b82f6]" />
                  <span className="font-bold text-[#88cc88]">VRAM DIAGNOSTIC MATRIX</span>
                </div>
                <div className="text-[10px] text-[#88cc88]">
                  {diagnostic.timestamp}
                </div>
              </div>

              {/* Code Banner */}
              <div className="bg-black border border-[#ff5555] p-2 text-xs">
                <div className="text-[#ff5555] font-bold">
                  DIAGNOSTIC ERROR CODE : <span className="text-white underline">{diagnostic.errorCode}</span>
                </div>
                <div className="text-[11px] text-[#a3ffa3] mt-0.5">
                  SUBSYSTEM EXCEPTION   : {diagnostic.errorName}
                </div>
                <div className="text-[10px] text-[#88cc88] mt-0.5">
                  TELEMETRY SIGNATURE   : {diagnostic.telemetrySignature}
                </div>
              </div>

              {/* UART 8250 Registers */}
              <div>
                <div className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider mb-1">
                  &gt; UART 8250 REGISTER REVISION AUDIT:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                  {diagnostic.uartRegisters.slice(0, 6).map((reg, idx) => (
                    <div key={idx} className="p-1 border border-[#2d552d] bg-black/40 flex justify-between items-center">
                      <span className="font-bold text-[#88cc88]">{reg.name}</span>
                      <span className="text-white">{reg.hex} ({reg.bits})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Memory Dump */}
              <div>
                <div className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider mb-1">
                  &gt; SERIAL VRAM RASTER HEX DUMP:
                </div>
                <pre className="p-2 border border-[#2d552d] bg-black text-[9px] sm:text-[10px] overflow-x-auto text-[#a3ffa3] leading-tight">
                  {diagnostic.hexDump.join('\n')}
                </pre>
              </div>

              {/* Recommended Physical Troubleshooting Steps */}
              <div>
                <div className="text-[10px] font-bold text-[#ffff55] uppercase tracking-wider mb-1">
                  &gt; RECOMMENDED OPERATOR ACTION (PC6300 TECHNICAL MANUAL):
                </div>
                <ul className="space-y-1 text-[11px] text-[#88cc88]">
                  {diagnostic.troubleshootingSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#3b82f6] font-bold">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Col: Interactive Actions & Hayes Command Console */}
            <div className="border border-[#2d552d] bg-black/50 p-3 sm:p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="pb-2 border-b border-[#2d552d] text-xs font-bold text-[#88cc88] flex items-center justify-between">
                  <span>DIAGNOSTIC GENERATOR</span>
                  <Wrench className="w-3.5 h-3.5 text-[#55ff55]" />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleGenerateNewCode}
                    className="w-full px-3 py-2 border-2 border-[#55ff55] bg-[#55ff55]/15 hover:bg-[#55ff55] hover:text-black transition-colors text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    id="generate-diagnostic-code-btn"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>[ GENERATE NEW DIAGNOSTIC CODE ]</span>
                  </button>

                  <button
                    onClick={handleCopyReport}
                    className="w-full px-3 py-1.5 border border-[#88cc88] bg-black hover:bg-[#2d552d] transition-colors text-xs font-bold flex items-center justify-center gap-2 text-[#88cc88] cursor-pointer"
                    id="copy-diagnostic-report-btn"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#55ff55]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '[ LOG COPIED TO CLIPBOARD ]' : '[ COPY DIAGNOSTIC LOG ]'}</span>
                  </button>

                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="w-full px-3 py-2 border-2 border-[#ffaa00] bg-[#ffaa00]/15 hover:bg-[#ffaa00] hover:text-black transition-colors text-xs font-bold flex items-center justify-center gap-2 text-[#ffaa00] cursor-pointer"
                    id="retry-modem-carrier-btn"
                  >
                    <Radio className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>{isRetrying ? '[ TESTING CARRIER... ]' : '[ RETEST CARRIER / RECONNECT ]'}</span>
                  </button>
                </div>

                {/* Status Readout from retry */}
                {retryResult && (
                  <div className="p-2 border border-[#3b82f6] bg-[#3b82f6]/10 text-[10px] text-white">
                    {retryResult}
                  </div>
                )}

                {/* Hayes AT Console Toggle */}
                <div className="pt-2 border-t border-[#2d552d]">
                  <button
                    onClick={() => {
                      retroAudio.playKeyclick();
                      setShowHayesTerminal(!showHayesTerminal);
                    }}
                    className="text-xs text-[#3b82f6] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{showHayesTerminal ? '[-] HIDE HAYES AT TERMINAL' : '[+] OPEN HAYES AT TERMINAL'}</span>
                  </button>
                </div>

                {/* Hayes Command Simulator */}
                {showHayesTerminal && (
                  <div className="p-2.5 border border-[#2d552d] bg-black space-y-2 text-[10px]">
                    <div className="text-[#88cc88] font-bold">HAYES AT COMMAND SUBSYSTEM:</div>
                    <div className="max-h-28 overflow-y-auto space-y-1 text-[#a3ffa3]">
                      {atTerminalHistory.map((item, idx) => (
                        <div key={idx}>
                          <div className="text-white">&gt; {item.cmd}</div>
                          {item.resp.map((r, rIdx) => (
                            <div key={rIdx} className="text-[#55ff55] pl-2">{r}</div>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={atCommandInput}
                        onChange={(e) => setAtCommandInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRunAtCommand();
                        }}
                        placeholder="e.g. ATZ, ATH0, ATI3"
                        className="flex-1 bg-black border border-[#2d552d] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#55ff55]"
                      />
                      <button
                        onClick={() => handleRunAtCommand()}
                        className="px-2 py-1 border border-[#55ff55] bg-[#55ff55] text-black font-bold cursor-pointer"
                      >
                        SEND
                      </button>
                    </div>

                    {/* Quick AT presets */}
                    <div className="flex flex-wrap gap-1 pt-1 text-[9px]">
                      {['AT', 'ATZ', 'ATH0', 'ATH1', 'ATI3', 'AT&V'].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => handleRunAtCommand(preset)}
                          className="px-1.5 py-0.5 border border-[#2d552d] hover:border-[#55ff55] hover:bg-[#55ff55]/20 cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom dismissal button to allow offline browsing */}
              {onDismiss && (
                <div className="pt-2 border-t border-[#2d552d]">
                  <button
                    onClick={() => {
                      retroAudio.playKeyclick();
                      onDismiss();
                    }}
                    className="w-full px-3 py-2 border border-[#88cc88] bg-[#2d552d]/40 hover:bg-[#2d552d] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    id="proceed-offline-btn"
                  >
                    <span>[ PROCEED OFFLINE / USE LOCAL CACHE ]</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-[9px] text-[#88cc88] text-center mt-1">
                    All biography, projects, skills &amp; cryptographic tools remain accessible locally.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Hardware Diagnostics Bar (Matches BootSequence.tsx) */}
        <div className="border-t border-[#2d552d] pt-3 mt-4 text-[10px] sm:text-xs text-[#66aa66] flex flex-wrap justify-between items-center gap-2">
          <div>
            BUS: 8086-2 (8 MHz) | UART: INS8250AN (COM1 0x03F8, IRQ 4) | BAUD: 2400 (8-N-1) | CRYPTO: SHA-256
          </div>
          <div className="text-right text-[#88cc88]">
            {onDismiss ? 'PRESS [ESC] TO PROCEED OFFLINE' : 'DIAGNOSTIC STATUS: CARRIER LOST'}
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
};
