import React from 'react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { retroAudio } from '../utils/audio';

/** The same public identity cards appear in the dossier and footer. */
export const ProfileCredentialCards: React.FC<{ onOpenGpg: () => void }> = ({ onOpenGpg }) => {
  const links = [
    { label: 'GITHUB', value: `@${PERSONAL_INFO.githubHandle}`, href: PERSONAL_INFO.githubUrl },
    { label: 'HUGGING FACE', value: `@${PERSONAL_INFO.huggingFaceHandle}`, href: PERSONAL_INFO.huggingFaceUrl },
    { label: 'ORCID ID', value: PERSONAL_INFO.orcid, href: PERSONAL_INFO.orcidUrl },
    { label: 'EMAIL', value: PERSONAL_INFO.email, href: `mailto:${PERSONAL_INFO.email}` },
  ];
  const cardStyle = 'min-w-0 p-2 border border-[var(--border-color)] bg-[var(--bg-primary)] text-left';
  return (
    <div className="grid grid-cols-1 min-[400px]:grid-cols-2 xl:grid-cols-5 gap-2 pt-1 text-[11px] font-mono">
      {links.map(({ label, value, href }) => (
        <a key={label} href={href} target={href.startsWith('https:') ? '_blank' : undefined}
          rel={href.startsWith('https:') ? 'noopener noreferrer' : undefined}
          onClick={() => retroAudio.playKeyclick()}
          className={`${cardStyle} hover:border-[var(--rm-accent-bright)] group`}>
          <span className="text-[var(--text-muted)] block text-[10px]">{label}</span>
          <span className="text-[var(--rm-accent-bright)] block break-words group-hover:underline">{value}</span>
        </a>
      ))}
      <button onClick={() => { retroAudio.playKeyclick(); onOpenGpg(); }}
        className={`${cardStyle} hover:border-[var(--rm-accent-bright)] cursor-pointer group`}
        title={`Inspect public key. Fingerprint: ${PERSONAL_INFO.gpgFingerprint}`}>
        <span className="text-[var(--text-muted)] block text-[10px]">GPG PUBLIC KEY</span>
        <span className="text-[var(--rm-accent-bright)] block group-hover:underline">{PERSONAL_INFO.gpgKeyId}</span>
      </button>
    </div>
  );
};
