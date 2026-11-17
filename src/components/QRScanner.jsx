import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { ImageUp, Camera, CameraOff, ScanLine } from "lucide-react";
import { scanQRCodeImage } from "../services/qr.service";

export default function QRScanner({ onScan }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const mounted = useRef(true);
  const busy = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const stopCamera = () => {
    busy.current = false;
    controlsRef.current?.stop();
    controlsRef.current = null;
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    if (mounted.current) setScanning(false);
  };

  const startCamera = async () => {
    if (busy.current) return;
    try {
      setError("");
      busy.current = true;
      setScanning(true);
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, result => {
        if (!result || !busy.current) return;
        busy.current = false;
        controlsRef.current?.stop();
        controlsRef.current = null;
        if (mounted.current) {
          setScanning(false);
          setProcessing(true);
          Promise.resolve(onScan(result.getText()))
            .catch(e => mounted.current && setError(e.message || "Invalid QR code."))
            .finally(() => mounted.current && setProcessing(false));
        }
      });
      if (!mounted.current || !busy.current) { controls.stop(); return; }
      controlsRef.current = controls;
    } catch {
      busy.current = false;
      if (mounted.current) {
        setScanning(false);
        setError("Camera unavailable. Allow camera permission or upload a QR image instead.");
      }
    }
  };

  const upload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    stopCamera();
    try {
      setError("");
      setProcessing(true);
      await onScan(await scanQRCodeImage(file));
    } catch (e) { setError(e.message || "Unable to scan QR image."); }
    finally { if (mounted.current) setProcessing(false); event.target.value = ""; }
  };

  useEffect(() => () => {
    mounted.current = false;
    busy.current = false;
    controlsRef.current?.stop();
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
  }, []);

  return <div className="scanner-content">
    <div className="scanner-preview">
      <video ref={videoRef} muted playsInline className="scanner-video"/>
      {!scanning && <div className="scanner-placeholder"><ScanLine size={32}/><span>Position your QR code in the camera frame</span></div>}
      {scanning && <div className="scan-frame"><i/></div>}
    </div>
    <div className="scanner-actions">
      {!scanning
        ? <button className="primary-button" onClick={startCamera} disabled={processing}><Camera size={16}/> Open camera</button>
        : <button className="secondary-button" onClick={stopCamera}><CameraOff size={16}/> Stop camera</button>}
      <label className={`secondary-button upload-button ${processing ? "disabled" : ""}`}>
        <ImageUp size={16}/> Upload QR image
        <input type="file" accept="image/*" hidden disabled={processing} onChange={upload}/>
      </label>
    </div>
    {processing && <p className="processing">Reading QR code…</p>}
    {error && <p className="error-message">{error}</p>}
    <p className="scanner-note">QR images are decoded locally on this device. Only TOTP QR codes are supported.</p>
  </div>;
}