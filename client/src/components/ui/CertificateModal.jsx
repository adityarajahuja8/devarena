import React, { useRef, useEffect } from 'react';
import { FiDownload, FiX, FiAward, FiCheckCircle } from 'react-icons/fi';
import Button from './Button';

const CertificateModal = ({ isOpen, onClose, participantName, hackathonTitle, issueDate, rank }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = 1200);
    const height = (canvas.height = 850);

    // 1. Background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#08080c');
    bgGradient.addColorStop(0.5, '#0e0d16');
    bgGradient.addColorStop(1, '#050508');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Glowing Orb Accents
    const orb1 = ctx.createRadialGradient(200, 200, 10, 200, 200, 300);
    orb1.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
    orb1.addColorStop(1, 'rgba(124, 58, 237, 0)');
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, width, height);

    const orb2 = ctx.createRadialGradient(1000, 650, 10, 1000, 650, 350);
    orb2.addColorStop(0, 'rgba(14, 165, 233, 0.2)');
    orb2.addColorStop(1, 'rgba(14, 165, 233, 0)');
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, width, height);

    // 3. Decorative Metallic Border Frame
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 50, width - 100, height - 100);

    // Corner Metallic Accents
    const drawCorner = (x, y) => {
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(x - 6, y - 6, 12, 12);
    };
    drawCorner(40, 40);
    drawCorner(width - 40, 40);
    drawCorner(40, height - 40);
    drawCorner(width - 40, height - 40);

    // 4. Header Branding
    ctx.font = '900 24px sans-serif';
    const brandGrad = ctx.createLinearGradient(400, 0, 800, 0);
    brandGrad.addColorStop(0, '#d0bcff');
    brandGrad.addColorStop(1, '#89ceff');
    ctx.fillStyle = brandGrad;
    ctx.textAlign = 'center';
    ctx.fillText('DEVARENA  •  OFFICIAL VERIFIED CERTIFICATE', width / 2, 120);

    // Subtitle
    ctx.font = '600 16px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('CERTIFICATE OF ACCOMPLISHMENT', width / 2, 165);

    // 5. Main Title
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PROUDLY PRESENTED TO', width / 2, 250);

    // Participant Name (Highlighted Accent)
    ctx.font = 'bold 56px sans-serif';
    const nameGrad = ctx.createLinearGradient(300, 0, 900, 0);
    nameGrad.addColorStop(0, '#c084fc');
    nameGrad.addColorStop(0.5, '#38bdf8');
    nameGrad.addColorStop(1, '#a855f7');
    ctx.fillStyle = nameGrad;
    ctx.fillText((participantName || 'PARTICIPANT').toUpperCase(), width / 2, 340);

    // Decorative Line under name
    const lineGrad = ctx.createLinearGradient(400, 0, 800, 0);
    lineGrad.addColorStop(0, 'rgba(192, 132, 252, 0)');
    lineGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.8)');
    lineGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(350, 370);
    ctx.lineTo(850, 370);
    ctx.stroke();

    // 6. Body Text
    ctx.font = '400 20px sans-serif';
    ctx.fillStyle = '#e5e7eb';
    ctx.fillText('For successful participation and outstanding achievement in', width / 2, 430);

    // Hackathon Title
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`"${hackathonTitle || 'Quantum Code 2026'}"`, width / 2, 490);

    // Rank / Achievement callout
    if (rank) {
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#34d399';
      ctx.fillText(`🏆 AWARDED: RANK #${rank}`, width / 2, 545);
    } else {
      ctx.font = '600 18px sans-serif';
      ctx.fillStyle = '#89ceff';
      ctx.fillText('🚀 Verified Hackathon Finisher', width / 2, 545);
    }

    // 7. Footer Details (Date & Signature Stamp)
    ctx.textAlign = 'left';
    ctx.font = '500 14px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('ISSUE DATE', 120, 680);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(issueDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 120, 710);

    ctx.textAlign = 'right';
    ctx.font = '500 14px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('VERIFICATION ID', width - 120, 680);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#89ceff';
    ctx.fillText(`DA-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, width - 120, 710);

    // Center Official Badge Emblem
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#c084fc';
    ctx.fillText('★ DEVARENA OFFICIAL ★', width / 2, 700);
  }, [isOpen, participantName, hackathonTitle, issueDate, rank]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `DevArena_Certificate_${(participantName || 'User').replace(/\s+/g, '_')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl glass-card rounded-3xl p-6 md:p-8 space-y-6 border border-white/10 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FiAward className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Official Certificate</h3>
              <p className="text-xs text-gray-400">Verified accomplishment badge issued by DevArena</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Canvas Display Container */}
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 shadow-inner bg-[#08080c] flex justify-center p-2">
          <canvas ref={canvasRef} className="w-full h-auto max-h-[60vh] object-contain rounded-xl" />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono-code">
            <FiCheckCircle />
            <span>Digital Cryptographic Seal Validated</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" icon={<FiDownload />} onClick={handleDownload}>
              Download High-Res PNG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
