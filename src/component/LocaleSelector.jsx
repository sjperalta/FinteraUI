import React from 'react';
import { useLocale } from '../contexts/LocaleContext';

const LocaleSelector = () => {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-bgray-600 dark:text-bgray-50">
        {t('personalInfo.language')}:
      </span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-2 rounded-lg border-0 focus:border focus:border-success-300 focus:ring-0 text-sm"
      >
        <option value="es">{t('personalInfo.spanish')}</option>
        <option value="en">{t('personalInfo.english')}</option>
      </select>
    </div>
  );
};

export default LocaleSelector;