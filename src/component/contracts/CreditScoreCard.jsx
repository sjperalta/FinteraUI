import React from 'react';
import PropTypes from 'prop-types';

export default function CreditScoreCard({ creditScore }) {
  const score = creditScore || 0;
  const scorePercentage = Math.round(score);
  
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300";
    return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300";
  };
  
  const getScoreLabel = (percentage) => {
    if (percentage >= 80) return "★★★ EXCELENTE";
    if (percentage >= 60) return "★★ BUENO";
    return "★ NECESITA MEJORA";
  };
  
  return (
    <div className="h-full flex flex-col justify-between bg-white/80 dark:bg-darkblack-600/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-darkblack-300/20 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
          <svg className="w-3 h-3 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-900 dark:text-white">Calificación Crediticia</h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">basada en el comportamiento de pago</p>
        </div>
      </div>

      <div className="flex items-center justify-center mb-2">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-gray-700" />
            <circle cx="50" cy="50" r="40" stroke="url(#scoreGradient)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={`${(scorePercentage / 100) * 251.2} 251.2`} className="transition-all duration-1000 ease-out" />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{scorePercentage}%</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">de 100%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getScoreColor(scorePercentage)}`}>
          {getScoreLabel(scorePercentage)}
        </span>
      </div>
    </div>
  );
}

CreditScoreCard.propTypes = {
  creditScore: PropTypes.number,
};
