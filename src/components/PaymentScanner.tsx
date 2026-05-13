import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Scan, X, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card } from './UI';
import { cn } from '@/src/lib/utils';
import { Html5Qrcode } from 'html5-qrcode';

export function PaymentScanner({ userId, onScan }: { userId: string; onScan: (data: string) => void }) {
  const [mode, setMode] = useState<'scan' | 'receive'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-reader";

  useEffect(() => {
    if (mode === 'scan' && isScanning) {
      const html5QrCode = new Html5Qrcode(scannerId);
      qrRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        () => {
          // Silent errors as it logs every frame it doesn't find a QR
        }
      ).catch(err => {
        console.error("Unable to start scanning", err);
        setScanError("Unable to access camera. Please check permissions.");
        setIsScanning(false);
      });

      return () => {
        if (qrRef.current && qrRef.current.isScanning) {
          qrRef.current.stop().catch(err => console.error("Error stopping scanner", err));
        }
      };
    }
  }, [mode, isScanning, onScan]);

  const startScanning = () => {
    setScanError(null);
    setIsScanning(true);
  };

  const stopScanning = () => {
    if (qrRef.current && qrRef.current.isScanning) {
      qrRef.current.stop()
        .then(() => {
          setIsScanning(false);
          qrRef.current = null;
        })
        .catch(err => console.error("Error stopping scanner", err));
    } else {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex bg-slate-100 p-1.5 rounded-[24px]">
        <button
          onClick={() => { setMode('scan'); stopScanning(); }}
          className={cn(
            "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-[20px] transition-all",
            mode === 'scan' ? "bg-white shadow-sm text-primary-600" : "text-slate-400"
          )}
        >
          Scan QR
        </button>
        <button
          onClick={() => { setMode('receive'); stopScanning(); }}
          className={cn(
            "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-[20px] transition-all",
            mode === 'receive' ? "bg-white shadow-sm text-primary-600" : "text-slate-400"
          )}
        >
          Receive
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'scan' ? (
          <motion.div
            key="scan"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative w-full aspect-square max-w-[280px] bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center border-4 border-white shadow-xl cursor-pointer group">
              {!isScanning ? (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center gap-4 group"
                  onClick={startScanning}
                >
                  <div className="absolute inset-0 border-2 border-primary-500/50 m-8 rounded-2xl animate-pulse group-hover:border-primary-400" />
                  <Scan size={64} className="text-white/20 group-hover:text-white/40 transition-colors" />
                  <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Tap to Activate Camera</p>
                </div>
              ) : (
                <div id={scannerId} className="w-full h-full"></div>
              )}
              
              {isScanning && (
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); stopScanning(); }}
                    className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {scanError && (
                <div className="absolute inset-0 bg-rose-500/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center gap-2">
                  <p className="text-white text-xs font-black uppercase tracking-widest">{scanError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white text-rose-600 border-none rounded-xl"
                    onClick={startScanning}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
            <p className="text-center text-sm text-slate-500 px-8">
              {isScanning ? "Align the QR code within the frame" : "Point your camera at a ZenVault QR code to make a payment"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="receive"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-6"
          >
            <Card className="p-8 flex flex-col items-center gap-6 shadow-xl border-none bg-white">
              <div className="bg-white p-4 rounded-3xl shadow-md border border-slate-100">
                <QRCodeSVG 
                  value={`zenvault:user:${userId}`} 
                  size={200}
                  level="H"
                  includeMargin
                  imageSettings={{
                    src: "/favicon.ico",
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
              <div className="text-center">
                <p className="font-black text-xl tracking-tight">Vault Entry QR</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Accept deposits instantly via QR</p>
              </div>
              <Button variant="secondary" className="w-full gap-2 py-4 rounded-2xl bg-primary-50 text-primary-700 hover:bg-primary-100 border-none font-black text-xs uppercase tracking-widest" onClick={() => navigator.clipboard.writeText(userId)}>
                <Copy size={16} />
                Copy Vault ID
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
