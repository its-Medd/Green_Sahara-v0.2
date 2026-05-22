import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../layouts/AdminLayout";
import UploadBox from "../../components/UploadBox";
import { analyzeAdminImage } from "../../services/adminService";
import { fileToBase64 } from "../../utils/fileToBase64";
import { useToast } from "../../hooks/useToast";
import { useAuthStore } from "../../store/useAuthStore";
import apiClient from "../../services/apiClient";

function AdminAnalysisPage() {
  const { t } = useTranslation();
  const [sensors, setSensors] = useState({ temperature: 24, humidity: 66 });
  const [imageBase64, setImageBase64] = useState("");
  const [imageMimeType, setImageMimeType] = useState("image/jpeg");
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [arduinoData, setArduinoData] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await apiClient.get("/arduino/latest");
        const data = response.data?.data;
        if (data) {
          setArduinoData(data);
          // If fill_percent >= 80, automatically sync the sensors state
          if (data.fill_percent >= 80) {
            setSensors({ temperature: data.temperature, humidity: data.humidity });
          }
        }
      } catch (err) {
        // Silently ignore if Arduino is not connected
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 3000);
    return () => clearInterval(interval);
  }, []);

  const uploadFile = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setImageBase64(await fileToBase64(file));
    setImageMimeType(file.type || "image/jpeg");
  };

  const analyze = async () => {
    if (!imageBase64 || loading) return;
    setLoading(true);
    try {
      const response = await analyzeAdminImage({
        imageBase64,
        sensorData: { ...sensors, mimeType: imageMimeType }
      });
      console.log("AI Result Object:", response.data);
      setResult(response.data);

      if (response?.data?.accepted === false) {
        toast({
          title: "IA",
          message: response?.data?.rejectionMessage || t("analysisPage.invalidImage"),
          type: "warning"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isArduinoSynced = arduinoData && arduinoData.fill_percent >= 80;

  return (
    <AdminLayout title={t("analysisPage.title")} subtitle={t("analysisPage.subtitle")}>
      <div className="grid xl:grid-cols-[1fr_1fr] gap-3">
        <div className="card p-4 space-y-3">
          <UploadBox label={t("analysisPage.uploadLabel")} preview={preview} onFile={uploadFile} />
          <div className="grid grid-cols-2 gap-2">
            <input
              className={`input bg-slate-100 text-slate-500 cursor-not-allowed ${isArduinoSynced ? "border-emerald-200" : ""}`}
              type="number"
              value={sensors.temperature}
              readOnly
              disabled
              placeholder={t("analysisPage.tempPlaceholder")}
              title={isArduinoSynced ? "Valeur issue de l'Arduino" : "Saisie désactivée (< 80%)"}
            />
            <input
              className={`input bg-slate-100 text-slate-500 cursor-not-allowed ${isArduinoSynced ? "border-emerald-200" : ""}`}
              type="number"
              value={sensors.humidity}
              readOnly
              disabled
              placeholder={t("analysisPage.humPlaceholder")}
              title={isArduinoSynced ? "Valeur issue de l'Arduino" : "Saisie désactivée (< 80%)"}
            />
          </div>
          {isArduinoSynced ? (
            <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              ✓ {t("analysisPage.syncedMsg")} ({t("smartBin.fill")} : {arduinoData.fill_percent}%)
            </p>
          ) : (
            <p className="text-[11px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              ℹ️ {t("analysisPage.pendingSyncMsg")}
            </p>
          )}
          <button
            className="btn-primary text-sm w-full disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={analyze}
            disabled={loading || !imageBase64}
          >
            {loading ? t("analysisPage.btnAnalyzing") : t("analysisPage.btnStart")}
          </button>
        </div>

        <div className="card p-4">
          <h3 className="font-bold text-sm">{t("analysisPage.resultTitle")}</h3>
          {result ? (
            result.accepted === false ? (
              <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                {result.rejectionMessage || t("analysisPage.invalidImage")}
              </div>
            ) : (
              <div className="space-y-3 mt-3 text-sm">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                  <p><b>{t("analysisPage.type")}</b> {result.wasteType}</p>
                  <p><b>{t("analysisPage.hum")}</b> {result.estimatedHumidity}%</p>
                  <p><b>{t("analysisPage.contamination")}</b> {result.contaminationLevel}</p>
                  <p><b>{t("analysisPage.cnRatio")}</b> {result.cnRatio || "N/A"}</p>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {t("analysisPage.molComp")}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-blue-800">
                    <p>{t("analysisPage.carbon")} {result.molecularCarbon || "N/A"}</p>
                    <p>{t("analysisPage.nitrogen")} {result.molecularNitrogen || "N/A"}</p>
                    <p>{t("analysisPage.hydrogen")} {result.molecularHydrogen || "N/A"}</p>
                    <p>{t("analysisPage.oxygen")} {result.molecularOxygen || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p><b>{t("analysisPage.potential")}</b> {result.compostPotential}</p>
                  <p><b>{t("analysisPage.storage")}</b> {result.storageAdvice}</p>
                  <p><b>{t("analysisPage.recommendations")}</b> {result.recommendations}</p>
                </div>

                {result.recipeText && (
                  <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                    <h4 className="font-black text-green-900 mb-2 underline decoration-green-300">{t("analysisPage.recipe")}</h4>
                    <div className="text-xs text-green-800 whitespace-pre-wrap leading-relaxed">
                      {result.recipeText}
                    </div>
                  </div>
                )}

                {result.rawText && (
                  <div className="mt-6 border-t pt-4">
                    <details className="text-[10px] text-slate-400">
                      <summary className="cursor-pointer hover:text-slate-600 font-bold">{t("analysisPage.debugLogs")}</summary>
                      <pre className="mt-2 p-2 bg-slate-900 text-slate-300 rounded overflow-x-auto whitespace-pre-wrap">
                        {result.rawText}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )
          ) : (
            <p className="text-xs text-brand-muted mt-3">{t("analysisPage.noAnalysis")}</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAnalysisPage;
