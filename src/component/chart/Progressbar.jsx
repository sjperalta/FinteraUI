import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import Toast from "../ui/Toast";
import { useLocale } from "../../contexts/LocaleContext";

function Progressbar({ className, user }) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const fields = ["full_name", "email", "identity", "rtn", "phone", "address"];

  const percent = useMemo(() => {

    if (!user || typeof user !== "object") return 0;

    const missing = [];
    const filled = fields.reduce((acc, key) => {
      const v = user[key];
      // consider field filled if it exists and has a meaningful value
      const hasValue = v !== null && v !== undefined && v !== "";
      const isFilled = hasValue && String(v).trim().length > 0;
      if (!isFilled) missing.push(key);
      return isFilled ? acc + 1 : acc;
    }, 0);

    const total = fields.length || 1;
    const raw = Math.round((filled / total) * 100);
    const clamped = Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 0;

    if (clamped < 100) {
      // minimal debug so you can inspect why it's not 100%
      console.debug("Progressbar missing fields:", missing, "filled count:", filled, "total fields:", total, "user object keys:", Object.keys(user));
    }

    return clamped;
  }, [user]);

  const strokeOffset = `calc(215 - 215 * (${percent} / 100))`;

  const handleVerifyIdentity = async () => {
    if (!user || !user.id) {
      setToast({ visible: true, message: t("progressbar.invalidUser"), type: "error" });
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_URL}/api/v1/users/${user.id}/resend_confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || t("progressbar.resendError"));
      }

      setToast({ visible: true, message: t("progressbar.verificationEmailSent"), type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ visible: true, message: `${t("common.error")}: ${err.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={
          className
            ? className
            : "bg-bgray-200 dark:bg-darkblack-600 p-7 rounded-xl"
        }
      >
        <div className="flex-row space-x-6 2xl:flex-row 2xl:space-x-6 flex md:flex-col md:space-x-0 items-center">
          <div className="progess-bar flex justify-center md:mb-[13px] xl:mb-0 mb-0">
            <div className="bonus-per relative">
              <div className="bonus-outer">
                <div className="bonus-inner">
                  <div className="number">
                    <span className="text-sm font-medium text-bgray-900">
                      {percent}%
                    </span>
                  </div>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="80px" height="80px">
                <circle
                  style={{
                    strokeDashoffset: strokeOffset,
                  }}
                  cx="40"
                  cy="40"
                  r="35"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col md:items-center xl:items-start items-start">
            <h4 className="text-bgray-900 dark:text-white text-base font-bold">
              {t("progressbar.completeInfo")}
            </h4>
            <span className="text-sm font-medium text-bgray-700 dark:text-darkblack-300">
              {t("progressbar.percentComplete", { percent, count: fields.length })}
            </span>
          </div>
        </div>
        <button
          aria-label="none"
          onClick={handleVerifyIdentity}
          disabled={loading}
          className="w-full mt-4 bg-success-300 hover:bg-success-400 text-white font-bold text-xs py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? t("progressbar.resending") : t("progressbar.verifyIdentity")}
        </button>
      </div>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((s) => ({ ...s, visible: false }))}
      />
    </>
  );
}

Progressbar.propTypes = {
  className: PropTypes.string,
  user: PropTypes.object,
};

export default Progressbar;
