import { useEffect, useState } from "react";

interface TwoFactorResponse {
  success: boolean;
  secret: string;
  qr_code: string;
}

export default function TwoFactorSetupPage() {

  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");

  useEffect(() => {
    loadQrCode();
  }, []);

  const loadQrCode = async () => {

    try {

      const response = await fetch("http://127.0.0.1:8081/api/auth/2fa/setup");

      const data: TwoFactorResponse = await response.json();

      if (data.success) {
        setQrCode(data.qr_code);
        setSecret(data.secret);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center">

      <div className="bg-white rounded-xl shadow-xl p-8 w-[500px]">

        <h1 className="text-2xl font-bold text-center mb-2">
          Activez votre double authentification
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Scannez ce QR Code avec Google Authenticator
        </p>

        <div className="flex justify-center mb-6">

          <img
            src={qrCode}
            alt="QR Code"
            className="border rounded-lg"
          />

        </div>

        <div className="bg-gray-100 rounded-lg p-4">

          <p className="text-sm text-gray-500 mb-2">
            Si vous ne pouvez pas scanner le QR Code,
            utilisez ce code :
          </p>

          <p className="font-mono text-center text-lg break-all">
            {secret}
          </p>

        </div>

      </div>

    </div>
  );

}