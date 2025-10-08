import { useLocale } from "../../contexts/LocaleContext";

function LoginPromoText() {
  const { t } = useLocale();
  return (
    <div className="animate-fade-in-up">
      <div className="text-center max-w-lg px-1.5 m-auto">
        <h3 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
          {t('signin.promoTitle')}
        </h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
          {t('signin.promoDescription')}
        </p>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="flex items-center justify-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/50">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('signin.featureContracts')}</span>
          </div>

          <div className="flex items-center justify-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/50">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('signin.featureAutomated')}</span>
          </div>

          <div className="flex items-center justify-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/50">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('signin.featureSecurity')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPromoText;