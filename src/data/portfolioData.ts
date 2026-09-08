import { Project, SkillCategory, BlogPost } from '../types';

export const PERSONAL_INFO = {
  name: 'Thomas Kenny',
  alias: 'Uncle Russet / mooserini',
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

export const PROJECTS: Project[] = [
  {
    id: 'hermes-audit',
    title: 'Hermes House Audit & Continuity System v2',
    codename: 'HERMES-AUDIT-2026',
    category: 'systems',
    year: '2026',
    summary: 'Autonomous agent operational audit, memory checksum continuity, and reproducible PDF lineage records.',
    description: 'An end-to-end lineage tracking and state validation engine designed for autonomous agent deployments. Verifies working memory hashes against tamper-evident audit ledgers, generating archival reports with mathematical precision.',
    metrics: '100% Deterministic Checksums • 0-Leak Boundary Validation • Sub-second Ledger Audits',
    tags: ['Autonomous Agents', 'Cryptographic Ledger', 'State Continuity', 'TypeScript', 'Hermes Lineage'],
    repoUrl: 'https://github.com/mooserini',
    featured: true,
    retroOutput: 'C:\\HERMES> AUDIT.EXE --VERIFY-HASHES\n[OK] Memory state: 0x8F4A19B2 - PASSED\n[OK] Lineage sequence: HERMES-09 - PASSED\n[OK] Signature valid: mooserini GPG key'
  },
  {
    id: 'md-pdf-generator',
    title: 'Retro Markdown to PDF Generator v2',
    codename: 'MDTOPDF-PC6300',
    category: 'retro',
    year: '2026',
    summary: 'CGA-themed document publishing suite utilizing the authentic AT&T PC6300 bitstream font and spectral borders.',
    description: 'Transforms structured Markdown documents into publication-grade archival PDFs. Incorporates custom CSS variables, document crests, spectral gradient rules, and the exact Ac437 AT&T PC6300 retro font.',
    metrics: '640x400 Optical Rasterization • Strict CSS Paged Media • Multi-column Print Layout',
    tags: ['CGA Bitstream', 'AT&T PC6300', 'Document Engineering', 'PostCSS', 'Puppeteer'],
    repoUrl: 'https://github.com/mooserini',
    link: 'https://int10h.org/oldschool-pc-fonts/fontlist/font?att_pc6300',
    featured: true,
    retroOutput: 'C:\\BIN> MDTOPDF.COM REPORT.MD --THEME=CGA_ATT6300\nCompiling font tables: PC6300.WOF (9.8 KB)\nRendering 2-column layout...\nDocument crest attached. Output: REPORT.PDF'
  },
  {
    id: 'resonant-mirror-vault',
    title: 'Resonant Mirror Vault & Key Orchestrator',
    codename: 'RESONANT-VAULT',
    category: 'security',
    year: '2025-2026',
    summary: 'Hardware-backed FIDO2 / WebAuthn passkey custody, GPG ring automation, and macOS Launchd integration.',
    description: 'A sovereign identity and authentication boundary that pairs WebAuthn platform authenticators (TouchID, YubiKey) with local daemon process isolation, preventing unauthorized token extraction.',
    metrics: 'FIDO2 Level 2 Attestation • Zero Plaintext Secrets on Disk • Biometric Gating',
    tags: ['FIDO2 / WebAuthn', 'Passkeys', 'GPG Cryptography', 'macOS Launchd', 'Python CLI'],
    repoUrl: 'https://github.com/mooserini',
    featured: true,
    retroOutput: 'FIDO2 SUB-SYSTEM INIT...\nQuerying authenticator on USB Bus 0...\nCredential challenge validated. Token ID: RM-9025-FIDO\nAccess Granted.'
  },
  {
    id: 'context-key-engine',
    title: 'Context-Key Cognitive Routing Engine',
    codename: 'CTX-KEY-ROUTER',
    category: 'ai',
    year: '2025',
    summary: 'High-concurrency token routing and KV-cache manager for local inference clusters (Qwen, Ollama, DeepSeek).',
    description: 'Optimizes attention matrices across multi-tenant local model execution. Dynamically shards prompt context to reduce redundant KV computations and maintain low latency under batch workloads.',
    metrics: '3.4x KV Cache Reuse • 42ms First-Token Latency • 64k Context Window Pinning',
    tags: ['Local LLMs', 'Qwen 2.5', 'Ollama API', 'PyTorch', 'Vector Indexing'],
    repoUrl: 'https://github.com/mooserini',
    featured: true,
    retroOutput: 'CTX_ALLOC: Segment 0..16384 pinned to VRAM0\nCache hit ratio: 87.4%\nDispatched prompt tokens: 1,840 to Qwen-14B'
  },
  {
    id: 'huggingface-models',
    title: 'Hugging Face Public Model & Weight Repositories',
    codename: 'HF-MOOSERINI',
    category: 'ai',
    year: '2025-2026',
    summary: 'Public model weights, GGUF quantizations, and agentic dataset checkpoints hosted under @mooserini.',
    description: 'Centralized public Hugging Face repository hub featuring quantized open weights (GGUF/safetensors), fine-tuned adapters for autonomous agent continuity, custom tokenizer configurations, and evaluation benchmarks for the Hermes House lineage.',
    metrics: 'GGUF Quantizations • Open-Weight Checkpoints • 100% Deterministic Evaluations',
    tags: ['Hugging Face', 'Transformers', 'Model Weights', 'GGUF', 'Local Inference', 'Hermes House'],
    repoUrl: 'https://huggingface.co/mooserini',
    link: 'https://huggingface.co/mooserini',
    featured: true,
    retroOutput: 'HF_HUB: Connecting to huggingface.co/mooserini...\n[OK] User: mooserini (Verified Hub Contributor)\n[OK] Model registry synced: GGUF / safetensors / evaluation benchmarks'
  },
  {
    id: 'sendblue-imessage-bridge',
    title: 'SendBlue iMessage Transport Daemon',
    codename: 'SENDBLUE-GATEWAY',
    category: 'systems',
    year: '2025',
    summary: 'Secure background bridge routing mobile push notifications and agent dispatches via encrypted transport.',
    description: 'Background daemon bridging autonomous agent event loops to secure mobile communication channels, featuring retry queues, failure backoffs, and cryptographic delivery confirmations.',
    metrics: '99.98% Message Delivery • 200ms Dispatch Latency • Offline Queueing',
    tags: ['iMessage API', 'Background Daemons', 'System Orchestration', 'Node.js', 'SQLite'],
    repoUrl: 'https://github.com/mooserini/mac-inac-sendblue',
    featured: false,
    retroOutput: 'SENDBLUE.SYS: Listening on loopback port 8443...\nOutbound dispatch ACK #512 sent.\nReceipt verified via client signature.'
  },
  {
    id: 'cga-typography-suite',
    title: 'CGA 80x25 Oldschool PC Font Engine',
    codename: 'PC6300-TYPO-ENGINE',
    category: 'retro',
    year: '2024-2025',
    summary: 'Web-native vector and bitmap rendering library for vintage PC BIOS and terminal fonts.',
    description: 'Ported classic Olivetti / AT&T PC6300 and IBM CGA character roms into zero-aliasing, modern webfont packages with sub-pixel alignment and customizable CRT phosphor simulation.',
    metrics: '8x16 Pixel Aspect Exact • 0ms FOIT via Embedded Data URIs • 100% Glyph Coverage',
    tags: ['Retro Computing', 'WebFonts', 'CGA Graphics', 'CSS Houdini', 'Canvas'],
    repoUrl: 'https://github.com/mooserini',
    link: 'https://int10h.org/oldschool-pc-fonts/fontlist/font?att_pc6300',
    featured: false,
    retroOutput: 'CGA MATRIX LOADED: 256 Character Codes (0x00..0xFF)\nGlyph dimensions: 8x16 dots\nDisplay mode: Mode 06h (640x400 b&w / 80x25)'
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
