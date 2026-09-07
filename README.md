> Custom-domain migration: see [DEPLOYMENT.md](DEPLOYMENT.md) for current routing, authentication, and verification status.

# The Resonant Mirror — Personal Portfolio & Archival Dossier
### Thomas Kenny (`Uncle Russet` / `@mooserini`)

A professional, high-craft retro personal portfolio built with **React 19**, **TypeScript**, and **Tailwind CSS**, designed in the authentic visual language of 1980s personal computing (**AT&T PC6300 CGA typography**, spectral rainbow rules, and paper/obsidian substrates) paired with modern cryptographic sovereign identity (**FIDO2 / WebAuthn passkeys**, **GPG**, and **ORCID**).

---

## 1. Design & Typography Architecture

### 1.1 Authentic CGA Bitstream Font
- **Primary Typeface**: `Ac437 AT&T PC6300` sourced from [int10h.org](https://int10h.org/oldschool-pc-fonts/fontlist/font?att_pc6300).
- **Matrix**: 8×16 glyph rasterization mimicking the Olivetti M24 / AT&T 6300 high-resolution 640×400 monochrome text mode.
- **Delivery**: Dual-packaged via local WOFF webfont in `/public/fonts/web_att_pc6300.woff` and pre-embedded base64 data URI in `src/fonts.css` for zero-latency, flash-free (0ms FOIT) display.
- **Global Application**: Applied strictly across all headings (`h1`–`h6`), body paragraphs, code blocks, form inputs, and buttons.

### 1.2 Signature Brand Palette (From Hermes House Audit v2)
The visual theme reflects the user's proprietary `.md to PDF generator` styling and brand identity swatches:
- **Resonant Ivory / Paper (Light Mode)**:
  - Substrate Canvas: `#FAF7F0`
  - Chrome Top: `#F7EEE2`
  - Chrome Bottom / Copper: `#A98B70` / `#86644C`
  - Deep Headings: `#4A342A`
  - Primary Ink: `#171717`
  - Secondary Ink: `#4A342A` / `#6B6357`
- **Obsidian CRT Phosphor (Dark Mode)**:
  - Canvas: `#0F1011`
  - Secondary Shell: `#171819`
  - Green Phosphor Status: `#00AA00` / `#00FF66`
  - Amber Warning: `#FFFF55`
  - Violet Emphasis: `#AD4CAC`
  - Electric Cyan / Blue: `#3B82F6`
- **Spectral Rainbow Rules**:
  - `border-image: linear-gradient(90deg, #3b82f6 0%, #a855f7 35%, #ec4899 70%, #f59e0b 100%) 1`

---

## 2. Core Features & Capabilities

### 2.1 AT&T PC6300 BIOS Boot Sequence
- Animates a classic 1980s PC startup sequence:
  - RAM check (640 KB Base Memory OK)
  - Video subsystem initialization (CGA 80×25)
  - Fixed disk controller check (ST-225 20MB)
  - Peripheral diagnostics (8259 PIC, 8253 PIT, Keyboard)
  - FIDO2 hardware token detection
  - Kernel boot (`RESONANT_MIRROR_OS v2.4`)
- Keyboard accessible: `[ESC]` or `[SPACE]` triggers instant fast-boot.
- Cached in `sessionStorage` so refreshing does not force repetitive waiting.
- User can trigger **[REBOOT]** anytime from the top navigation bar.

### 2.2 FIDO2 / WebAuthn Passkey Authentication
- Supports hardware passkey registration and assertion using the browser's `navigator.credentials` API.
- Automatically handles sandboxed iframe environments: seamlessly shifts to a high-security hardware simulator protocol if cross-origin frame restrictions block native biometrics.
- Displays live cryptographic session badge in the navigation bar (`[FIDO2: ACTIVE]` vs `[FIDO2 AUTH]`) with user handle, credential ID, algorithm (`ES256`), and attestation timestamp.

### 2.3 Cryptographic Keyring & ORCID Registry
- **GPG Key Reference**:
  - Key ID: `4A9F B872 19EC 4E53`
  - Full Fingerprint: `ED39 8C7B 4A9F B872 19EC 4E53 D82A 991B 77B4 C390`
  - Interactive modal with 1-click clipboard copying and `.asc` public key download.
- **ORCID Verification**:
  - ID: `0009-0000-9987-6106`
  - Direct verified link to scholarly record.
- **Personal Blog / Dispatches Reader**:
  - Built-in reader modal displaying archival essays on autonomic agent continuity and CGA graphics archaeology, alongside external link to `https://www.getadongle.com/#dispatches`.

### 2.4 Contact & Dispatch Terminal
- Public destination: `tom@getadongle.com`.
- The form prepares a local email draft and opens the visitor's email app through a `mailto:` link.
- Visitors send the message from their email app. Preparing a draft does not send, queue, or archive it on a server.
- The optional armored-envelope display is a plaintext simulation, not encryption.

### 2.5 Web Audio Retro PC Speaker Synthesizer
- Built-in Web Audio API square-wave generator simulating classic vintage PC internal speaker beeps (880Hz POST beeps, D5/A5 boot chime, keyclicks).
- Kept **muted by default** to respect browser sound policies; easily toggled via the speaker icon in the navbar.

### 2.6 Hidden 80s DOS Interactive Terminal Console
- An authentic MS-DOS 3.30 command-line terminal environment styled with green phosphor text on obsidian black, scanlines, and an authentic blinking block cursor (`█`).
- **Access Vectors**:
  - Global keyboard shortcut: press **`** (backtick) or **~** (tilde) anywhere on the site.
  - Desktop / mobile navigation bar button: **`[ DOS (~) ]`**.
  - Floating bottom-right quick prompt button: **`[ >_ DOS PROMPT [~] ]`**.
- **Interactive Commands**:
  - `HELP` / `?`: Output the complete DOS command catalog.
  - `WHOIS`: Retrieve the full architectural dossier for Thomas Kenny, aliases, and credentials.
  - `STATS` / `SYSINFO`: Query real-time simulated 80s hardware diagnostics (Intel 8086-2 CPU @ 8MHz, 640KB RAM, Olivetti CGA 640x400 Mode 06h, ST-225 disk registers).
  - `DIR` / `LS`: Display directory tree of drive `C:\RESONANT` with file sizes and timestamps.
  - `TYPE <FILE>`: Read text files (e.g. `TYPE CONFIG.SYS`, `TYPE AUTOEXEC.BAT`, `TYPE BIOGRAPHY.TXT`).
  - `PROJECTS`: Inspect active software catalogs.
  - `SKILLS`: Display system proficiency benchmarks.
  - `VER`: Print AT&T PC6300 ROM BIOS v1.43 & MS-DOS 3.30 version banner.
  - `GPG`, `ORCID`, `FIDO`: Inspect cryptographic keys and hardware passkey sessions.
  - `THEME [LIGHT|DARK]`: Switch display palette directly from the command prompt.
  - `BEEP`: Emit square-wave PC speaker diagnostic tone.
  - `MATRIX`: Trigger an 8-bit phosphor memory register cascade.
  - `CLS`: Clear console buffer.
  - `ANIM [GLOBE|CURSOR|DISK]`: Test or switch 80s ASCII art animation modes.
  - `REBOOT`: Re-trigger PC6300 BIOS cold boot sequence.
  - `EXIT` / `QUIT` or `[ESC]`: Close the console.
- **ASCII Animation Helper Subsystem**:
  - Automatically cycles through authentic 80s multi-frame ASCII art while the terminal is "processing" a command:
    - **Spinning Globe** (`globe`): 3-frame rotating wireframe sphere with latitude/longitude meridian lines and orbital degree telemetry (used for identity and network queries like `whois`, `gpg`, `orcid`, `fido`).
    - **Loading Cursor** (`cursor`): 4-frame rotating segment loader (`|`, `/`, `─`, `\`) with 8086 CPU register / bus progress bars (used for kernel commands like `ver`, `help`).
    - **Disk MFM Head Seek** (`disk`): 3-frame Seagate ST-225 cylinder stepping motor & cluster sync sequence (used for file operations like `dir`, `type`, `stats`, `projects`).
  - Direct toolbar triggers: `[ ANIM: GLOBE ]`, `[ CURSOR ]`, and `[ DISK ]` in the DOS window chrome.
- **Terminal Ergonomics**: Supports Command History (`UP`/`DOWN` arrows), `[TAB]` auto-completion, window maximize/restore, and interactive command chips.

### 2.7 80s ASCII Art Logo Component
- A dedicated retro banner component rendering "The Resonant Mirror" using authentic IBM CP437 box-drawing and block-shading characters (`█`, `▓`, `▒`, `░`, `╗`, `╝`).
- Positioned prominently at the apex of the `HeroBio` archival dossier section.
- **Interactive Controls**:
  - **Phosphor Palette Switcher**: Allows cycling through vintage screen aesthetics: P1 Phosphor Green (`#00FF66`), P3 Amber (`#FFB000`), CGA Cyan (`#00E5FF`), Hermes Bronze (`#E29B68`), and Resonant Violet (`#D946EF`).
  - **View Mode Switcher**: Toggles between the wide typographic CGA ASCII banner and the compact Hermes House Archival Mirror Emblem.
  - **1-Click Copy**: Copies the clean ASCII text string directly to the clipboard.
  - **CRT Scanline Filter**: Styled with a low-opacity scanline overlay and vintage tube glow (`text-shadow`).

### 2.8 Hidden Easter Egg & Retro Achievement System
- A sequence tracking engine embedded in the DOS terminal that monitors commands and sequence histories to reward curiosity with retro-themed achievements:
  - **Secret Commands**:
    - `XYZZY` or `PLUGH`: *Colossal Cave Adventurer (1976)* (+50 pts)
    - `JOSHUA` or `WARGAMES`: *NORAD Defense Override (1983)* (+75 pts)
    - `IDDQD` or `IDKFA`: *Degoo Electronics God Mode (1993)* (+50 pts)
    - `HACK` or `HACK THE PLANET`: *Gibson Supercomputer Infiltrator (1995)* (+100 pts)
    - `KONAMI`: *Konami Code Veteran (1986)* (+50 pts)
  - **Multi-Step Command Sequences**:
    - `WHOIS` → `ORCID` → `GPG`: *Hermes Archive Auditor* (+75 pts)
    - `STATS` → `BEEP`: *8086 Hardware Whisperer* (+50 pts)
    - `DIR` → `TYPE CONFIG.SYS`: *Autoexec Commander* (+50 pts)
    - `ANIM GLOBE` → `ANIM CURSOR` → `ANIM DISK`: *Tri-Phosphor Synesthete* (+75 pts)
    - `CLS` → `MATRIX`: *Phosphor Cascade Diver* (+50 pts)
  - **Retro Notification Toast**:
    - Rendered in `<AchievementToast />` with CRT scanline styling, glowing phosphor badge icons, point counters, and auto-dismissal (7 seconds) with manual close button.
    - Plays a cheerful 4-note 8-bit synthesized fanfare chime (`playAchievementFanfare`).
  - **Scorecard Display**:
    - Run `ACHIEVEMENTS` or `BADGES` in the terminal to print an ASCII scorecard with unlock progress, total points, and unlock timestamps.
    - Includes a quick **[ BADGES ]** button in the terminal toolbar with a trophy icon.

---

## 3. Project Structure

```
├── public/
│   ├── favicon.ico
│   ├── resonant-mirror-crest.png        # Resonant Mirror Hermes Crest (300x338 RGBA)
│   ├── logo_resonant-mirror_square@2x.png
│   └── fonts/
│       └── web_att_pc6300.woff         # Official AT&T PC6300 webfont (9.8 KB)
├── src/
│   ├── __tests__/                      # Jest Comprehensive Unit Test Suite
│   │   ├── contactService.test.ts      # Validation, mailto generation, GPG encapsulation
│   │   ├── dosTerminal.test.ts         # DOS command parsing, system info, and file reads
│   │   ├── easterEggs.test.ts          # Easter eggs, sequence evaluator, scorecard
│   │   ├── fidoAuth.test.ts            # Crypto challenges, WebAuthn sessions
│   │   ├── logo.test.ts                # 80s ASCII art representation and glyph verification
│   │   ├── portfolioData.test.ts       # Identity verification, data models
│   │   └── terminalAnimations.test.ts  # Animation frames, cycle helper, registry
│   ├── components/
│   │   ├── AchievementToast.tsx        # Retro CRT notification toast for unlocks
│   │   ├── BlogModal.tsx               # Interactive blog / essay reader
│   │   ├── BootSequence.tsx            # BIOS startup sequence animation
│   │   ├── ContactSection.tsx          # Contact form with receipt & mailto
│   │   ├── DosTerminal.tsx             # 80s DOS prompt interactive console
│   │   ├── FidoModal.tsx               # FIDO2 passkey registration & assertion
│   │   ├── Footer.tsx                  # GPG, ORCID, Blog, social links & copyright
│   │   ├── GpgModal.tsx                # ASCII armored public key inspector & download
│   │   ├── HeroBio.tsx                 # Archival dossier header & biography
│   │   ├── Logo.tsx                    # 80s-style ASCII art representation of The Resonant Mirror
│   │   ├── Navbar.tsx                  # Retro chrome bar, toggles, FIDO badge
│   │   ├── ProjectsSection.tsx         # Filterable projects with terminal emulation
│   │   └── SkillsMatrix.tsx            # Technical capabilities with ASCII block meters
│   ├── data/
│   │   └── portfolioData.ts            # Verified credentials, projects, blog & skills
│   ├── utils/
│   │   ├── audio.ts                    # Web Audio PC speaker square wave synthesizer
│   │   ├── contactService.ts           # Form validation, mailto builder, API dispatch
│   │   ├── easterEggs.ts               # Easter egg catalog, sequence detector, scorecards
│   │   ├── fidoAuth.ts                 # WebAuthn and CTAP2 protocol management
│   │   └── terminalAnimations.ts       # 80s ASCII art animation helper & frame sets
│   ├── App.tsx                         # Main state coordinator
│   ├── fonts.css                       # Embedded base64 CGA font definition
│   ├── index.css                       # Color palette, scanlines, retro button styling
│   ├── main.tsx                        # DOM mount entry point
│   └── types.ts                        # TypeScript interfaces & types
├── jest.config.cjs                     # Jest + ts-jest configuration
├── metadata.json                       # AI Studio project manifest
├── package.json                        # Dependencies, test and build scripts
└── vite.config.ts                      # Vite build configuration
```

---

## 4. Setup & Developer Guide

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation
Clone the repository and install all dependencies:
```bash
npm install
```

### Running the Development Server
Starts Vite on `http://localhost:3000`:
```bash
npm run dev
```

### Running the Jest Unit Test Suite
Runs all 14 unit tests validating the FIDO authentication logic, contact service, and static data integrity:
```bash
npm test
```

### Type Checking & Linting
Validates TypeScript typings across the entire codebase:
```bash
npm run lint
```

### Building for Production
Compiles optimized static production assets to `/dist`:
```bash
npm run build
```

---

## 5. Team Onboarding Checklist

1. **Typography Rule**: Never introduce non-monospace or antialiased modern fonts (e.g. Inter, Roboto) into the main content. All elements must inherit from `var(--font-cga)` (`'PC6300'`).
2. **Color Inversion Discipline**: When introducing new cards or visual modules, ensure both Light Mode (`var(--bg-primary)` / `#FAF7F0`) and Dark Mode (`var(--bg-primary)` / `#0F1011`) color tokens are verified.
3. **Contact**: The form prepares a `mailto:` draft for `tom@getadongle.com`. A future server delivery feature needs a separately configured mail provider.
4. **FIDO Hardware Credentials**: Any adjustments to `fidoAuth.ts` must maintain compatibility with both native `PublicKeyCredential` in top-level browser contexts and the sandboxed iframe fallback protocol.
