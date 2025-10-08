import React from 'react';
import PropTypes from 'prop-types';
import { formatStatus } from '../../utils/formatStatus';
import { useLocale } from '../../contexts/LocaleContext';

export default function ContractInfoCard({ currentContract }) {
  const { t } = useLocale();
  return (
    <div className="flex items-start space-x-3 mb-4">
      {/* Contract Avatar */}
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-darkblack-600 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Contract Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('contractInfo.contract')} #{currentContract?.id}
          </h4>
          <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-full shadow-sm">
            {formatStatus(currentContract?.status, t) || t('contractInfo.active')}
          </div>
        </div>
        <p className="text-base text-gray-700 dark:text-gray-200 font-medium mb-1">
          {currentContract?.applicant_name || t('contractInfo.client')}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1H3V9a2 2 0 012-2h3zM2 17a2 2 0 002 2h16a2 2 0 002-2v-7H2v7z" />
          </svg>
          {t('contractInfo.created')} {currentContract?.created_at ? new Date(currentContract.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : "N/A"}
        </p>
      </div>
    </div>
  );
}

ContractInfoCard.propTypes = {
  currentContract: PropTypes.object,
};