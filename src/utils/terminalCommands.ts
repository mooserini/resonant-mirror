import { PERSONAL_INFO, PROJECTS, SKILL_CATEGORIES } from '../data/portfolioData';
import { FidoSession, TerminalLine } from '../types';
import { retroAudio } from './audio';
import { formatAchievementsScorecard } from './easterEggs';

export interface CommandContext {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  fidoSession: FidoSession | null;
  onReboot: () => void;
  onClose: () => void;
}

export function executeTerminalCommand(
  rawInput: string,
  context: CommandContext
): TerminalLine[] {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return [];
  }

  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  const timestamp = new Date().toLocaleTimeString();

  switch (command) {
    case 'help':
    case '?':
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `AT&T PC6300 DOS 3.30 COMMAND SUBSYSTEM
======================================================================
  HELP / ?         - Displays this list of valid DOS commands
  WHOIS            - Architectural dossier for Thomas Kenny & Hermes House
  STATS / SYSINFO  - Real-time hardware diagnostics & memory registers
  DIR / LS         - Directory listing of Drive C:\\RESONANT\\
  TYPE <FILENAME>  - Displays contents of text file (e.g. TYPE CONFIG.SYS)
  PROJECTS [CAT]   - Queries executable archives and repositories
  SKILLS           - Benchmark capabilities matrix
  VER              - Displays DOS kernel and ROM BIOS version
  ANIM [MODE]      - Cycles & tests 80s ASCII art animation (GLOBE, CURSOR, DISK)
  ACHIEVEMENTS     - View unlocked retro Easter Egg badges & score (BADGES)
  HF / HUGGINGFACE - Hugging Face open-weight models & datasets (@mooserini)
  HEATMAP / COMMITS- Inspects D3 1980s monochrome GitHub contribution matrix
  CHAT / GOOGLECHAT- Opens Google Chat retro subsystem (Spaces & Dispatches)
  MODEM / OFFLINE  - Opens retro Hayes modem diagnostic code generator & test
  REFINE           - Enters operator refinement session to iterate on app
  GPG              - Prints GPG cryptographic public key & fingerprint
  ORCID            - Displays verified scholarly researcher ID
  FIDO             - Inspects FIDO2/WebAuthn hardware passkey status
  THEME [LIGHT|DARK]- Toggles or switches visual display palette
  BEEP             - Emits a classic PC speaker diagnostic tone
  MATRIX           - Runs 8-bit phosphor memory cascade
  CLS / CLEAR      - Clears the active console display buffer
  REBOOT           - Triggers cold boot sequence (PC6300 BIOS POST)
  EXIT / QUIT      - Closes the DOS command console
======================================================================
Tip: Press UP/DOWN for command history, or press [~] / [ESC] to dismiss.`,
        },
      ];

    case 'whois':
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `======================================================================
SUBJECT DOSSIER: ${PERSONAL_INFO.name.toUpperCase()}
ALIAS: ${PERSONAL_INFO.alias.toUpperCase()} // BRAND: ${PERSONAL_INFO.brandName.toUpperCase()}
ROLE: ${PERSONAL_INFO.role.toUpperCase()}
EMAIL: ${PERSONAL_INFO.email}
----------------------------------------------------------------------
ORCID IDENTIFIER: ${PERSONAL_INFO.orcid}
GPG KEY ID:       ${PERSONAL_INFO.gpgKeyId}
FINGERPRINT:      ${PERSONAL_INFO.gpgFingerprint}
GITHUB REPO:      ${PERSONAL_INFO.githubUrl}
HUGGING FACE:     ${PERSONAL_INFO.huggingFaceUrl} (@${PERSONAL_INFO.huggingFaceHandle})
BLOG DISPATCHES:  ${PERSONAL_INFO.blogUrl}
----------------------------------------------------------------------
MANDATE:
Specializing in sovereign AI agent architectures, cryptographic memory
continuity, and retro CGA typography. Maintainer of the Hermes House
continuity protocols and the Resonant Mirror archival vault.
======================================================================`,
        },
      ];

    case 'stats':
    case 'sysinfo': {
      const isFidoActive = context.fidoSession?.isAuthenticated;
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `======================================================================
AT&T PERSONAL COMPUTER 6300 — DIAGNOSTIC TELEMETRY
======================================================================
  CENTRAL PROCESSOR   : Intel 8086-2 CPU @ 8.00 MHz (0 Wait States)
  MATH COPROCESSOR    : Intel 8087 NPU Detected (Operational)
  CONVENTIONAL MEMORY : 640 KB Total [582 KB Base Available]
  EXPANDED MEMORY     : 2,048 KB LIM EMS 4.0 Specification
  VIDEO CONTROLLER    : Olivetti Color Display (CGA 640x400 Mode 06h)
  FONT BITSTREAM      : Ac437 AT&T PC6300 (8x16 Pixel Raster, int10h.org)
  TEXT RESOLUTION     : 80 Columns x 25 Lines (Phosphor Refresh 60 Hz)
  FIXED DISK DRIVE    : Seagate ST-225 (20 MB MFM, Cylinder 615, 4 Heads)
  DISK CONTROLLER     : Western Digital WD1002-WX1 MFM Interface
  SERIAL / MODEM      : COM1: RS-232C @ 9600 Baud, Parity None, 8 Data, 1 Stop
  PARALLEL PRINTER    : LPT1: Centronics Bi-Directional Port Ready
  CURRENT PALETTE     : ${context.theme.toUpperCase()} MODE
  FIDO2 PASSPORT      : ${isFidoActive ? `AUTHENTICATED [${context.fidoSession?.credentialId}]` : 'STANDBY (NO ACTIVE HARDWARE TOKEN)'}
  TIME OF CAPTURE     : ${timestamp}
  SYSTEM INTEGRITY    : NOMINAL — 0 ERROR CODES ENCOUNTERED
======================================================================`,
        },
      ];
    }

    case 'dir':
    case 'ls':
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: ` Volume in drive C is HERMES_SYS
 Volume Serial Number is 1985-0925
 Directory of C:\\RESONANT

.              <DIR>     09-25-85   8:00a
..             <DIR>     09-25-85   8:00a
COMMAND  COM      25307  07-24-87  12:00a
CONFIG   SYS        318  09-07-26   9:14a
HERMES   EXE     148920  09-07-26  11:20a
MDTOPDF  COM      68400  08-14-26   4:30p
BIOGRAPHY TXT      4120  09-07-26  10:00a
PROJECTS DAT      12840  09-07-26  10:05a
SKILLS   DAT       8900  09-07-26  10:10a
PUBKEY   ASC       3180  09-07-26   8:00a
ORCID    ID          42  09-07-26   8:00a
AUTOEXEC BAT        194  09-07-26   7:45a
        10 File(s)     272221 bytes
                       348160 bytes free`,
        },
      ];

    case 'type': {
      if (!args[0]) {
        return [
          {
            id: Math.random().toString(),
            type: 'error',
            text: 'Required parameter missing. Syntax: TYPE <FILENAME>',
          },
        ];
      }
      const target = args[0].toUpperCase();
      if (target === 'CONFIG.SYS') {
        return [
          {
            id: Math.random().toString(),
            type: 'output',
            text: `DEVICE=C:\\DOS\\ANSI.SYS
DEVICE=C:\\DRIVERS\\PC6300_CGA.SYS /HIRES
DEVICE=C:\\DRIVERS\\FIDO2_CTAP.SYS
FILES=40
BUFFERS=20
LASTDRIVE=Z
SHELL=C:\\COMMAND.COM /P /E:512`,
          },
        ];
      }
      if (target === 'AUTOEXEC.BAT') {
        return [
          {
            id: Math.random().toString(),
            type: 'output',
            text: `@ECHO OFF
PROMPT $P$G
PATH C:\\;C:\\DOS;C:\\HERMES
MODE CON: COLS=80 LINES=25
ECHO WELCOME TO THE RESONANT MIRROR // THOMAS KENNY ARCHIVE
HERMES.EXE /BOOT`,
          },
        ];
      }
      if (target === 'BIOGRAPHY.TXT') {
        return [
          {
            id: Math.random().toString(),
            type: 'output',
            text: `${PERSONAL_INFO.bioParagraphs[0]}\n\n${PERSONAL_INFO.bioParagraphs[1]}`,
          },
        ];
      }
      if (target === 'ORCID.ID') {
        return [
          {
            id: Math.random().toString(),
            type: 'output',
            text: `ORCID: ${PERSONAL_INFO.orcid}\nURL:   ${PERSONAL_INFO.orcidUrl}`,
          },
        ];
      }
      if (target === 'PUBKEY.ASC') {
        return [
          {
            id: Math.random().toString(),
            type: 'output',
            text: `KEY ID: ${PERSONAL_INFO.gpgKeyId}\nFINGERPRINT: ${PERSONAL_INFO.gpgFingerprint}\n(Type GPG for complete armored block)`,
          },
        ];
      }
      return [
        {
          id: Math.random().toString(),
          type: 'error',
          text: `File not found: ${target}`,
        },
      ];
    }

    case 'ver':
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `AT&T Personal Computer 6300 ROM BIOS Version 1.43
MS-DOS Version 3.30 (Revision B) — Custom Hermes Archival Kernel v2.4`,
        },
      ];

    case 'projects': {
      const list = PROJECTS.map(
        (p) => `  * [${p.codename.padEnd(14)}] ${p.title} (${p.year})`
      ).join('\n');
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `CATALOG OF ARCHIVED SYSTEMS & REPOSITORIES:\n${list}\n\nType 'DIR' to view local filesystem binaries.`,
        },
      ];
    }

    case 'skills': {
      const lines = SKILL_CATEGORIES.map((cat) => {
        const skillsList = cat.skills.map((s) => `    - ${s.name.padEnd(20)} [${s.level}%]`).join('\n');
        return `[DOMAIN: ${cat.title.toUpperCase()}]\n${skillsList}`;
      }).join('\n\n');
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `SYSTEMS CAPABILITIES BENCHMARK:\n\n${lines}`,
        },
      ];
    }

    case 'gpg':
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `GPG CRYPTOGRAPHIC CREDENTIALS:
  USER ID     : ${PERSONAL_INFO.name} <${PERSONAL_INFO.email}>
  KEY ID      : ${PERSONAL_INFO.gpgKeyId}
  FINGERPRINT : ${PERSONAL_INFO.gpgFingerprint}
  ALGORITHM   : RSA-4096 / SC (Sign, Certify, Authenticate)
  STATUS      : VALID & SIGNED
Use the website UI or 'TYPE PUBKEY.ASC' for public key verification.`,
        },
      ];

    case 'orcid':
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `SCHOLARLY ORCID IDENTITY:
  IDENTIFIER : ${PERSONAL_INFO.orcid}
  REGISTRY   : ${PERSONAL_INFO.orcidUrl}
  HOLDER     : ${PERSONAL_INFO.name}`,
        },
      ];

    case 'hf':
    case 'huggingface':
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `======================================================================
HUGGING FACE ARCHIVAL HUB — MOOSERINI
======================================================================
  OPERATOR HANDLE : @${PERSONAL_INFO.huggingFaceHandle}
  PROFILE URL     : ${PERSONAL_INFO.huggingFaceUrl}
  AFFILIATION     : ${PERSONAL_INFO.brandName} // Hermes House Lineage
  FOCUS           : Open Model Weights, GGUF Quantizations, Dataset Checkpoints
  SECURITY STATUS : Tamper-Evident SHA-256 Signatures Attached
======================================================================
Type 'PROJECTS' to inspect hosted repositories, or visit:
${PERSONAL_INFO.huggingFaceUrl}`,
        },
      ];

    case 'refine':
    case 'refinement':
    case 'revise':
      return [
        {
          id: Math.random().toString(),
          type: 'success',
          text: `======================================================================
ARCHITECT REFINEMENT & ITERATION LOOP
======================================================================
Tap the [MAKE REFINEMENT] button in the navigation bar or bottom toolbar
to enter an authenticated session loop with your User ID (${PERSONAL_INFO.huggingFaceHandle}).
You can stage model updates, new projects, skill benchmarks, or general
specifications, and generate 1-click iteration prompts for AI Studio.
======================================================================`,
        },
      ];

    case 'heatmap':
    case 'commits':
    case 'contributions':
    case 'github':
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `======================================================================
IBM 5151 MONOCHROME CRT // GITHUB CONTRIBUTION RASTER TELEMETRY
======================================================================
  OPERATOR        : @${PERSONAL_INFO.githubHandle}
  GITHUB URL      : ${PERSONAL_INFO.githubUrl}
  CYCLE WINDOW    : 52 WEEKS (364 DAYS)
  TOTAL COMMITS   : 2,184 VERIFIED REVISIONS
  ACTIVE STREAK   : 19 DAYS CONTINUOUS CADENCE
  LONGEST STREAK  : 68 DAYS
  MONITOR HARDWARE: IBM 5151 / MDA (720x350 RASTER, 50Hz V-REFRESH)
  PHOSPHOR OPTIONS: P1 (GREEN), P3 (AMBER), P4 (WHITE), CGA (CYAN)
======================================================================
Scroll to SECTION 02: PROJECTS & SYSTEMS SHOWCASE to interact directly with
the D3.js monochrome CRT raster matrix and inspect daily VRAM cells.`,
        },
      ];

    case 'modem':
    case 'offline':
    case 'carrier':
    case 'diagnostic':
    case 'diagnostics': {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-modem-diagnostics'));
      }
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `======================================================================
HAYES SMARTMODEM 2400 CONTROLLER // COMM DIAGNOSTICS
======================================================================
  STATUS          : CARRIER DETECT LOST // LINE NOISE (0x7E14)
  UART PORT       : COM1 (0x03F8, IRQ 4) - INS8250AN
  BAUD RATE       : 2400 BPS (8-N-1 ASYNC)
  DTR LINE        : ASSERTED (+12V)
  DSR LINE        : INACTIVE (0V)
  CARRIER (CD)    : LOW (NO CARRIER)
======================================================================
LAUNCHING FULLSCREEN RETRO MODEM DIAGNOSTIC FALLBACK ENVIRONMENT...
Press [ESC] at any time to return to local cache.`,
        },
      ];
    }

    case 'chat':
    case 'googlechat':
    case 'spaces':
    case 'messages': {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-google-chat'));
      }
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `======================================================================
GOOGLE CHAT SUBSYSTEM // COMM PROTOCOL V1.0
======================================================================
  API HOST        : chat.googleapis.com (v1)
  SECURITY        : TLS 1.3 / OAuth2 Bearer Tokens (In-Memory Only)
  SCOPES ACTIVE   : chat.spaces, chat.messages, chat.memberships
  MUTATING OPS    : Explicit User Confirmation Enforced
======================================================================
INITIALIZING GOOGLE CHAT INTERFACE WINDOW...
Review spaces and dispatch messages directly from the retro window.`,
        },
      ];
    }

    case 'fido': {
      const active = context.fidoSession?.isAuthenticated;
      return [
        {
          id: Math.random().toString(),
          type: active ? 'success' : 'output',
          text: `FIDO2 / WEBAUTHN SUBSYSTEM STATUS:
  AUTHENTICATED  : ${active ? 'YES [SESSION ACTIVE]' : 'NO [UNAUTHENTICATED]'}
  CREDENTIAL ID  : ${context.fidoSession?.credentialId || 'NONE'}
  ALGORITHM      : ${context.fidoSession?.algorithm || 'ES256 (P-256 ECDSA)'}
  SECURITY LEVEL : ${context.fidoSession?.securityLevel || 'N/A'}
  USER HANDLE    : ${context.fidoSession?.userHandle || 'architect.guest'}`,
        },
      ];
    }

    case 'theme': {
      if (!args[0]) {
        const next = context.theme === 'light' ? 'dark' : 'light';
        context.setTheme(next);
        return [
          {
            id: Math.random().toString(),
            type: 'success',
            text: `Display theme toggled to: ${next.toUpperCase()} MODE.`,
          },
        ];
      }
      const choice = args[0].toLowerCase();
      if (choice === 'light' || choice === 'dark') {
        context.setTheme(choice);
        return [
          {
            id: Math.random().toString(),
            type: 'success',
            text: `Display theme set to: ${choice.toUpperCase()} MODE.`,
          },
        ];
      }
      return [
        {
          id: Math.random().toString(),
          type: 'error',
          text: `Invalid theme parameter: ${args[0]}. Valid options: LIGHT, DARK.`,
        },
      ];
    }

    case 'beep':
      retroAudio.playPostBeep(880, 0.2);
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: 'PC Speaker diagnostic tone emitted: 880 Hz square wave (200ms).',
        },
      ];

    case 'anim':
    case 'spin': {
      const mode = args[0]?.toLowerCase();
      if (mode === 'globe' || mode === 'cursor' || mode === 'disk') {
        return [
          {
            id: Math.random().toString(),
            type: 'success',
            text: `ASCII animation mode configured to "${mode.toUpperCase()}". The animation helper will cycle through this sequence during command processing.`,
          },
        ];
      }
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `ASCII ANIMATION HELPER SUBSYSTEM:
======================================================================
  Available 80s ASCII Animation Modes:
  1. GLOBE   - 3-frame rotating wireframe vector sphere with meridian rings
  2. CURSOR  - 4-frame rotating segment indicator with 8MHz clock bus
  3. DISK    - 3-frame ST-225 MFM hard drive cylinder seek & cluster sync

  Usage: ANIM [GLOBE|CURSOR|DISK]
  (Animations automatically cycle when executing system commands)`,
        },
      ];
    }

    case 'matrix':
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: `PHOSPHOR MEMORY REGISTER DUMP:
0000:0000  52 45 53 4F 4E 41 4E 54  20 4D 49 52 52 4F 52 21  RESONANT MIRROR!
0000:0010  54 48 4F 4D 41 53 20 4B  45 4E 4E 59 20 43 47 41  THOMAS KENNY CGA
0000:0020  48 45 52 4D 45 53 20 48  4F 55 53 45 20 56 32 2E  HERMES HOUSE V2.
0000:0030  41 54 26 54 20 50 43 36  33 30 30 20 4F 4B 21 00  AT&T PC6300 OK!.
0000:0040  00 AA 00 FF 55 AD 4C AC  3B 82 F6 86 64 4C F7 EE  ....U.L.;..dL..`,
        },
      ];

    case 'cls':
    case 'clear':
      // Handled specially by terminal state
      return [];

    case 'reboot':
      context.onReboot();
      context.onClose();
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: 'System reboot command acknowledged. Rebooting...',
        },
      ];

    case 'exit':
    case 'quit':
      context.onClose();
      return [];

    case 'achievements':
    case 'badges':
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: formatAchievementsScorecard(),
        },
      ];

    case 'xyzzy':
    case 'plugh':
      return [
        {
          id: Math.random().toString(),
          type: 'success',
          text: `A hollow voice says "Fool!"\nA cool draft of air whispers from a dark opening in the rock face.\n[★ EASTER EGG: Colossal Cave Adventure 1976 register unlocked!]`,
        },
      ];

    case 'joshua':
    case 'wargames':
    case 'falken':
      return [
        {
          id: Math.random().toString(),
          type: 'success',
          text: `GREETINGS PROFESSOR FALKEN.\n\nSHALL WE PLAY A GAME?\n1. FALKEN'S MAZE\n2. BLACK JACK\n3. GIN RUMMY\n4. HEARTS\n5. BRIDGE\n6. CHESS\n7. GLOBAL THERMONUCLEAR WAR\n\n> A STRANGE GAME. THE ONLY WINNING MOVE IS NOT TO PLAY.\n[★ EASTER EGG: NORAD Defense Override register unlocked!]`,
        },
      ];

    case 'iddqd':
    case 'idkfa':
      return [
        {
          id: Math.random().toString(),
          type: 'success',
          text: `DEGOO ELECTRONICS GOD MODE ACTIVE.\nALL BLUE, RED, YELLOW KEYCARDS & 200% ARMOR GRANTED.\n[★ EASTER EGG: Degoo Electronics God Mode register unlocked!]`,
        },
      ];

    case 'hack':
    case 'hack the planet':
    case 'zero cool':
    case 'crash override':
      return [
        {
          id: Math.random().toString(),
          type: 'success',
          text: `GIBSON SUPERCOMPUTER PENETRATION INITIATED...\nROOT PRIVILEGES OVERRIDDEN ON PORT 0x3F8.\n"MESS WITH THE BEST, DIE LIKE THE REST. HACK THE PLANET!"\n[★ EASTER EGG: Gibson Supercomputer Penetration register unlocked!]`,
        },
      ];

    case 'konami':
      return [
        {
          id: Math.random().toString(),
          type: 'success',
          text: `↑ ↑ ↓ ↓ ← → ← → B A SELECT START\n30 EXTRA LIVES INJECTED INTO BASE 640KB DOS CONVENTIONAL MEMORY.\n[★ EASTER EGG: Konami Code register unlocked!]`,
        },
      ];

    default:
      return [
        {
          id: Math.random().toString(),
          type: 'error',
          text: `Bad command or file name: "${command}". Type "help" or "?" for command catalog.`,
        },
      ];
  }
}
