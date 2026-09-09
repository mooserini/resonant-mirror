import { Project, SkillCategory, BlogPost } from '../types';

export const PERSONAL_INFO = {
  name: 'Thomas Kenny',
  alias: 'Mooserini / Moosenberg',
  brandName: 'The Resonant Mirror',
  role: 'Systems Architect, Agentic Lineage & Cryptographic Security Engineer',
  location: 'Distributed / United States',
  email: 'tom@getadongle.com',
  orcid: '0009-0000-9987-6106',
  orcidUrl: 'https://orcid.org/0009-0000-9987-6106',
  gpgKeyId: '17B5 86FD 7394 2305',
  gpgFingerprint: 'E7B3 223E A0F0 3348 C674 7EBA 17B5 86FD 7394 2305',
  blogUrl: 'https://www.getadongle.com/#dispatches',
  githubUrl: 'https://github.com/mooserini',
  githubHandle: 'mooserini',
  avatarUrl: 'https://avatars.githubusercontent.com/u/270805952?s=400&v=4',
  huggingFaceUrl: 'https://huggingface.co/mooserini',
  huggingFaceHandle: 'mooserini',
  linkedinUrl: 'https://www.linkedin.com/in/mooserini/',
  tagline: 'Bridging 1980s CGA Architecture with 2026 Autonomous Neural Lineage',
  bioParagraphs: [
    'I am a systems architect and distributed computing engineer specializing in verifiable agentic continuity, cryptographic hardware attestation, and vintage computer graphics typography. Operating at the intersection of autonomic agent lineage (Hermes House) and strict local boundary security, my work emphasizes deterministic state, zero-trust telemetry, and durable knowledge preservation.',
    'My technical heritage draws from classic computing paradigms—where every byte of memory and every clock cycle of video bandwidth mattered—translated directly into modern high-throughput local AI orchestrations, FIDO2/WebAuthn passkey pipelines, and tamper-evident documentation systems.',
    'Whether engineering local Qwen/Ollama inference gateways under Launchd supervision, architecting markdown-to-PDF compilers with CGA bitstream fonts, or auditing cryptographic agent state across distributed boundaries, I build systems designed for transparent inspection, resilience, and longevity.'
  ]
};

export const GPG_ARMORED_PUBLIC_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEapZ5BxYJKwYBBAHaRw8BAQdASokeEFwt+WIuExipycjEldrNmlZcDop/g6uE
LE8oZzW0K1Rob21hcyBLZW5ueSAoR2l0IEdvdCkgPHRvbUBnZXRhZG9uZ2xlLmNv
bT6IrAQTFgoAVBYhBOezIj6g8DNIxnR+uhe1hv1zlCMFBQJqlnkHGxSAAAAAAAQA
Dm1hbnUyLDIuNSsxLjEyLDAsMwIbAwULCQgHAgYVCgkICwIEFgIDAQIeAQIXgAAK
CRAXtYb9c5QjBZxPAP0RwZPy2neVhcpEnqhIoF/x0/+VEYR3ewDD9SucYanhQwD/
fSWICZUcyIBDpuMN27hCoLNBMNLxIQBhhcXDHT6YsA24OARqlnkHEgorBgEEAZdV
AQUBAQdArcpsqZQ4dWB3CXTk74vT1IOd7dpcPxBQYYYQwt2OWUsDAQgHiJQEGBYK
ADwWIQTnsyI+oPAzSMZ0froXtYb9c5QjBQUCapZ5BxsUgAAAAAAEAA5tYW51Miwy
LjUrMS4xMiwwLDMCGwwACgkQF7WG/XOUIwUwIgD+NvZ0P2w6bLOmx1p9kQUEJeB3
MApar7gm60TEeRWJnDoBALiu4QTCkuvy1/ge0rVbJgxcVGMTU2Z3FuEGE3SKLzQH
=mMJH
-----END PGP PUBLIC KEY BLOCK-----`;

// Curated from anonymously accessible repositories and a specific public contribution.
export const PROJECTS: Project[] = [
  {
    "id": "hermes-config-guardian",
    "title": "Hermes Config Guardian",
    "codename": "CONFIG-GUARDIAN",
    "category": "security",
    "year": "2026",
    "summary": "Independent macOS menu-bar tool for reviewing Hermes configuration changes and restoring a human-approved snapshot. Includes read-only skill-state indicators.",
    "description": "Independent macOS menu-bar tool for reviewing Hermes configuration changes and restoring a human-approved snapshot. Includes read-only skill-state indicators.",
    "tags": [
      "Swift",
      "macOS",
      "Configuration review"
    ],
    "repoUrl": "https://github.com/mooserini/hermes-config-guardian",
    "sourceKind": "repository",
    "featured": true
  },
  {
    "id": "hermes-secure-launcher",
    "title": "Hermes Secure Launcher",
    "codename": "SECURE-LAUNCHER",
    "category": "security",
    "year": "2026",
    "summary": "Independent macOS menu-bar controller for starting, stopping, and checking a Hermes gateway through a Keychain-backed launchd definition.",
    "description": "Independent macOS menu-bar controller for starting, stopping, and checking a Hermes gateway through a Keychain-backed launchd definition.",
    "tags": [
      "Swift",
      "macOS",
      "Keychain",
      "launchd"
    ],
    "repoUrl": "https://github.com/mooserini/hermes-secure-launcher",
    "sourceKind": "repository",
    "featured": true
  },
  {
    "id": "mac-inac-sendblue",
    "title": "Mac-Inac iMessage Bridge",
    "codename": "MAC-INAC",
    "category": "systems",
    "year": "2026",
    "summary": "Python iMessage bridge for CLI-driven agents, with SendBlue transport and independent, read-only observation of Apple Messages receipts.",
    "description": "Python iMessage bridge for CLI-driven agents, with SendBlue transport and independent, read-only observation of Apple Messages receipts.",
    "tags": [
      "Python",
      "iMessage",
      "SendBlue",
      "Receipt observation"
    ],
    "repoUrl": "https://github.com/mooserini/mac-inac-sendblue",
    "sourceKind": "repository",
    "featured": true
  },
  {
    "id": "resonant-mirror",
    "title": "The Resonant Mirror Portfolio",
    "codename": "RESONANT-MIRROR",
    "category": "web",
    "year": "2026",
    "summary": "The React and TypeScript portfolio behind this site, with a CRT-inspired interface, contribution calendar, and profile cards. Uses the credited Oldschool PC Font Pack.",
    "description": "The React and TypeScript portfolio behind this site, with a CRT-inspired interface, contribution calendar, and profile cards. Uses the credited Oldschool PC Font Pack.",
    "tags": [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "D3"
    ],
    "repoUrl": "https://github.com/mooserini/resonant-mirror",
    "sourceKind": "repository",
    "featured": true,
    "link": "https://www.getadongle.com/index.html"
  },
  {
    "id": "mirror_landing_page",
    "title": "Original CRT Landing Page",
    "codename": "CRT-LANDING",
    "category": "retro",
    "year": "2026",
    "summary": "Self-contained landing page with a simulated BIOS boot, terminal commands, and a public work manifest. Uses the AT&T PC6300 font from the Oldschool PC Font Pack.",
    "description": "Self-contained landing page with a simulated BIOS boot, terminal commands, and a public work manifest. Uses the AT&T PC6300 font from the Oldschool PC Font Pack.",
    "tags": [
      "HTML",
      "CSS",
      "JavaScript",
      "Retro computing"
    ],
    "repoUrl": "https://github.com/mooserini/mirror_landing_page",
    "sourceKind": "repository",
    "featured": false
  },
  {
    "id": "vesper-real-weather-lab",
    "title": "Vesper Real Weather Lab",
    "codename": "VESPER-WEATHER",
    "category": "web",
    "year": "2026",
    "summary": "Client-side weather prototype that maps Open-Meteo conditions to an animated character, lighting, and motion. Includes place search and optional geolocation.",
    "description": "Client-side weather prototype that maps Open-Meteo conditions to an animated character, lighting, and motion. Includes place search and optional geolocation.",
    "tags": [
      "HTML",
      "SVG",
      "Open-Meteo",
      "Weather"
    ],
    "repoUrl": "https://github.com/mooserini/vesper-real-weather-lab",
    "sourceKind": "repository",
    "featured": false
  },
  {
    "id": "resonant-railway",
    "title": "Resonant Railway Task Server",
    "codename": "TASK-MCP",
    "category": "systems",
    "year": "2026",
    "summary": "A small MCP server for creating, listing, and completing tasks stored in Cloudflare D1. The public repository documents configuration, authentication, and offline tests.",
    "description": "A small MCP server for creating, listing, and completing tasks stored in Cloudflare D1. The public repository documents configuration, authentication, and offline tests.",
    "tags": [
      "TypeScript",
      "MCP",
      "Cloudflare D1"
    ],
    "repoUrl": "https://github.com/mooserini/resonant-railway",
    "sourceKind": "repository",
    "featured": false
  },
  {
    "id": "hermes-image-patch-recovery",
    "title": "Hermes Image Patch-Limit Recovery",
    "codename": "HERMES-PR-106186",
    "category": "ai",
    "year": "2026",
    "summary": "A proposed upstream fix for image patch-limit errors.",
    "description": "Proposed fix for image patch-limit errors in Hermes Agent. Routes oversized requests through resize/retry handling, with regression tests covering original files and conversation history.",
    "tags": [
      "Python",
      "Image handling",
      "Regression tests"
    ],
    "repoUrl": "https://github.com/NousResearch/hermes-agent/pull/106186",
    "sourceKind": "contribution",
    "featured": false
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'Systems & Architecture',
    description: 'Distributed orchestration, state continuity, and low-level boundary controls.',
    iconName: 'Server',
    skills: [
      { name: 'Distributed Consensus & Memory State', level: 96, details: 'Verifiable agent state, deterministic checksums', badge: 'Expert' },
      { name: 'Launchd & Unix Daemon Orchestration', level: 94, details: 'macOS process supervisors, auto-restart, healthchecks' },
      { name: 'Network Boundaries & Firewall Isolation', level: 92, details: 'Zero-trust egress routing, local-only gateways' },
      { name: 'High-Availability Service Routing', level: 88, details: 'Reverse proxies, circuit breakers, backpressure' }
    ]
  },
  {
    title: 'Security & Cryptography',
    description: 'Hardware tokens, passkeys, asymmetric encryption, and identity attestation.',
    iconName: 'ShieldCheck',
    skills: [
      { name: 'FIDO2 / WebAuthn Passkeys', level: 95, details: 'Platform & cross-platform authenticators, CTAP2 protocol', badge: 'Core' },
      { name: 'GPG / PGP Infrastructure', level: 93, details: 'Subkey hierarchies, revocation rings, detached signatures' },
      { name: 'Zero-Knowledge Proofs & Hashes', level: 86, details: 'SHA-256 state trees, Merkle audit ledgers' },
      { name: 'Hardware Enclave & YubiKey Integration', level: 90, details: 'Secure enclave key generation, PIV/U2F modes' }
    ]
  },
  {
    title: 'Languages & Engineering',
    description: 'Core programming languages, runtime environments, and typing disciplines.',
    iconName: 'Code2',
    skills: [
      { name: 'TypeScript & JavaScript', level: 95, details: 'Strict TS, React 19, Node.js runtime, Vite build chains', badge: 'Primary' },
      { name: 'Python 3.x', level: 92, details: 'AsyncIO, FastAPI, PyTorch, Ollama client integration' },
      { name: 'Rust & WebAssembly', level: 84, details: 'Memory safety, high-performance CLI tools, Wasm compilation' },
      { name: 'Bash & Zsh Scripting', level: 92, details: 'Automation pipelines, launch daemon wrappers, posix tools' },
      { name: 'SQL & PostgreSQL / SQLite', level: 88, details: 'ACID transactions, relational schemas, WAL journaling' }
    ]
  },
  {
    title: 'AI & Cognitive Engineering',
    description: 'Local neural inference, context engineering, and autonomous agent systems.',
    iconName: 'Cpu',
    skills: [
      { name: 'Hugging Face Hub & Open Weights', level: 95, details: 'Open weights & GGUF checkpoints (@mooserini), model cards, safetensors', badge: 'Hub' },
      { name: 'Local Model Deployment (Ollama/vLLM)', level: 94, details: 'Qwen 2.5, Llama 3, DeepSeek quantized deployment', badge: 'Specialist' },
      { name: 'Context Window Optimization', level: 91, details: 'KV cache management, dynamic token sharding' },
      { name: 'Autonomous Agent Topology', level: 93, details: 'Hermes House lineage, multi-agent arbitration, state logs' },
      { name: 'RAG & Vector Retrieval', level: 87, details: 'Hybrid dense/sparse search, local embedding indexing' }
    ]
  },
  {
    title: 'Retro & Visual Craftsmanship',
    description: 'Vintage graphics modes, bitstream fonts, and document aesthetics.',
    iconName: 'Monitor',
    skills: [
      { name: 'CGA / EGA Graphic Architecture', level: 96, details: '16-color palette matrices, 80x25 character display', badge: 'Vintage' },
      { name: 'Oldschool PC Font Engineering', level: 94, details: 'Ac437 AT&T 6300, IBM character ROM rasterization' },
      { name: 'Print-Grade CSS & Paged Media', level: 92, details: 'Archival PDF generation, precision paged layouts' },
      { name: 'CRT Phosphor Simulation', level: 89, details: 'Scanlines, bloom, optical aperture grille physics' }
    ]
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'cga-typography-modern-web',
    title: 'The Unforgiving Clarity of the AT&T PC6300 Character ROM',
    date: '2026-08-14',
    readTime: '6 min read',
    category: 'Retro Computing',
    summary: 'Why the 16x8 glyph matrix of the Olivetti M24 / AT&T 6300 remains the pinnacle of technical monospace typography.',
    content: [
      'In 1984, the AT&T PC6300 arrived with an unusual video capability: high-resolution 640x400 monochrome text, doubling the vertical resolution of standard IBM CGA 80x25 text modes. Each character was crafted in an 8x16 box, producing razor-sharp serifs and perfectly balanced ascenders.',
      'Unlike modern antialiased fonts that rely on subpixel blurring, bitstream ROM typography was binary: a pixel was either illuminated with phosphor or black. This absolute contrast eliminates cognitive fatigue during marathon auditing sessions.',
      'In the Resonant Mirror design language, we do not treat PC6300 as nostalgic kitsch; we treat it as an optical precision instrument.'
    ]
  },
  {
    id: 'hermes-lineage-continuity',
    title: 'Hermes House: Sovereign Continuity in Autonomous Multi-Agent Systems',
    date: '2026-07-28',
    readTime: '9 min read',
    category: 'Autonomous Systems',
    summary: 'Solving the memory degradation problem when autonomous models hand off long-horizon tasks across session boundaries.',
    content: [
      'When autonomous agents operate over weeks or months, ephemeral chat contexts fail. State drifts, facts hallucinate, and identity fractures. The Hermes House architecture enforces strict lineage trees.',
      'Every major cognitive leap is serialized into a signed state artifact. If an agent crashes or is restarted under Launchd, it reconstitutes its mental model not by reading vague summaries, but by replaying cryptographically verified state deltas.',
      'The result is true long-horizon continuity: an intelligence that remembers its architectural commitments across cold boots.'
    ]
  },
  {
    id: 'fido-passkeys-local-gateways',
    title: 'Securing Agentic Gateways with Hardware-Backed WebAuthn',
    date: '2026-06-11',
    readTime: '7 min read',
    category: 'Security',
    summary: 'Bridging browser FIDO2 credentials with local Unix domain sockets for zero-trust agent control.',
    content: [
      'Standard API keys are a persistent liability: they sit in environment variables, leak into debug logs, and are easily exfiltrated. Passkeys change the calculus entirely.',
      'By anchoring privileged commands to a hardware authenticator (YubiKey or Touch ID Secure Enclave), execution requires physical human presence. Even if an agent runtime is compromised, malicious actions cannot proceed without the cryptographic biometric touch.',
      'Here is the exact verification handshake flow implemented in the Resonant Mirror Vault...'
    ]
  }
];

export const BOOT_SEQUENCE_STEPS = [
  { text: 'AT&T Personal Computer 6300 BIOS Version 2.2', delay: 180 },
  { text: 'Copyright (C) 1984, 1986 Olivetti & AT&T Information Systems', delay: 220 },
  { text: 'RAM CHECK: 640 KB BASE MEMORY ......... OK', delay: 350 },
  { text: 'VIDEO ADAPTER: COLOR GRAPHICS ADAPTER (CGA 80x25) ... OK', delay: 240 },
  { text: 'CHECKING FIXED DISK CONTROLLER: DRIVE C: (20 MB ST-225) ... OK', delay: 280 },
  { text: 'PERIPHERALS: KEYBOARD 84-KEY, 8259 PIC, 8253 TIMER ... OK', delay: 220 },
  { text: 'FIDO2 HARDWARE SECURITY MODULE: DETECTED (CTAP2)', delay: 260 },
  { text: 'BOOTING RESONANT_MIRROR_OS V2.4 [mooserini kernel] ...', delay: 320 },
  { text: 'LOADING AC437 AT&T PC6300 CHARACTER BITSTREAM ... [LOADED]', delay: 280 },
  { text: 'SYSTEM INTEGRITY VERIFIED (GPG: 17B5 86FD 7394 2305) ... OK', delay: 300 },
  { text: 'ALL SYSTEMS NOMINAL. ENTERING TERMINAL INTERFACE...', delay: 400 }
];
