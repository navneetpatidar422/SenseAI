import React, { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language: string;
  fileName?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, language, fileName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = language === 'python' ? 'py' : language === 'cpp' || language === 'arduino' ? 'ino' : 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `senseai_code.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const lines = code.split('\n');

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border-subtle bg-[#0D0E11] font-mono text-[13.5px]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#16181D] border-b border-border-subtle">
        <span className="text-xs uppercase tracking-wider font-semibold text-accent-primary">
          {language || 'code'}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-xs text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded hover:bg-surface-raised"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-semantic-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 text-xs text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded hover:bg-surface-raised"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code body with line numbers */}
      <div className="p-4 overflow-x-auto leading-relaxed text-[#E1E4E8]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-surface-raised/30">
                <td className="w-8 select-none text-right pr-4 text-text-tertiary/50 text-xs">
                  {idx + 1}
                </td>
                <td className="whitespace-pre">{line}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CodeViewer;
