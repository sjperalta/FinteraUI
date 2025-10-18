import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../../../../config";
import PaymentList from "../../../component/balance/PaymentList";
import AuthContext from "../../../context/AuthContext";
import SummaryWidgetCard from "../../../component/widget/SummaryWidgetCard";
import { useLocale } from "../../../contexts/LocaleContext";

// Images
import totalEarn from "../../../assets/images/icons/total-earn.svg";
import memberImg from "../../../assets/images/avatar/members-2.png";

function Summary() {
  const { user, token } = useContext(AuthContext);
  const { userId } = useParams();
  const { t } = useLocale();

  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const formatCurrency = (value, currency) => {
    if (typeof value !== "number") return "—";
    return value.toLocaleString("en-US", { style: "currency", currency });
  };

  useEffect(() => {
    // If we’re missing user info or token, don’t attempt to fetch
    if (!user?.id || !token) {
      setIsLoading(false);
      return;
    }

    const fetchSummary = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        // Use userId or user.id as appropriate
        const response = await fetch(
          `${API_URL}/api/v1/users/${userId || user.id}/summary`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error fetching summary data");
        }

        const data = await response.json();
        setSummaryData(data);
      } catch (error) {
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [userId, user, token]);

  // Render Loading State
  if (isLoading) {
    return (
      <div className="mb-[24px] w-full">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success-300 border-opacity-25 border-t-success-400 mx-auto mb-4"></div>
            <p className="text-lg text-bgray-600 dark:text-bgray-50">{t('payments.loadingBalance')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render Error State
  if (fetchError) {
    return (
      <div className="mb-[24px] w-full">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">{t('payments.connectionError')}</h3>
            <p className="text-red-600 dark:text-red-400">{t('common.error')}: {fetchError}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render UI When Data is Successfully Fetched
  return (
    <div className="mb-[24px] w-full">
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-success-300 to-success-400 gradient-animate rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{t('payments.balanceDashboard')}</h1>
              <p className="text-success-50">
                {t('payments.welcomeMessage', { name: user?.name || t('dashboard.user') })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2 mb-8">
        {/* Saldo (Balance) Card */}
        <div className="transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-lg">
          <SummaryWidgetCard
            totalEarnImg={totalEarn}
            memberImg={memberImg}
            title={t('payments.balance')}
            amount={formatCurrency(summaryData?.balance, summaryData?.currency)}
            id="totalBalance"
            type="financing"
          />
        </div>

        {/* Valor Adeudado (Due Payment) Card */}
        <div className="transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-lg">
          <SummaryWidgetCard
            totalEarnImg={totalEarn}
            memberImg={memberImg}
            title={t('payments.overdueAmount')}
            amount={formatCurrency(summaryData?.totalDue, summaryData?.currency)}
            fee={formatCurrency(summaryData?.totalFees, summaryData?.currency)}
            id="totalDuePayment"
            type="due"
          />
        </div>
      </div>

      {/* Payments Section */}
      <div className="w-full">
        <div className="rounded-xl bg-white dark:bg-darkblack-600 shadow-lg border border-gray-100 dark:border-darkblack-500 overflow-hidden">
          <div className="bg-gradient-to-r from-bgray-50 to-gray-100 dark:from-darkblack-700 dark:to-darkblack-600 px-6 py-4 border-b border-gray-200 dark:border-darkblack-500">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-lg">
                <svg className="w-5 h-5 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 01-2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-bgray-900 dark:text-white">
                  {t('payments.paymentSchedule')}
                </h3>
                <p className="text-sm text-bgray-500 dark:text-bgray-300">
                  {t('payments.managePayments')}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {user ? (
              <PaymentList user={user} token={token} />
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success-300 mx-auto mb-4"></div>
                <p className="text-bgray-600 dark:text-bgray-50">{t('payments.loadingPayments')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Summary;