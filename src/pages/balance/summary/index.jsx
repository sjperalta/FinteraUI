import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../../../../config";
import PaymentList from "../../../component/balance/PaymentList";
import AuthContext from "../../../context/AuthContext";
import SummaryWidgetCard from "../../../component/widget/SummaryWidgetCard";

// Images
import totalEarn from "../../../assets/images/icons/total-earn.svg";
import memberImg from "../../../assets/images/avatar/members-2.png";

function Summary() {
  const { user, token } = useContext(AuthContext);
  const { userId } = useParams();

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
      <div className="mb-[24px] w-full text-center">
        <p>Cargando resumen...</p>
        {/* You could also include a spinner or skeleton here */}
      </div>
    );
  }

  // Render Error State
  if (fetchError) {
    return (
      <div className="mb-[24px] w-full text-center text-red-500">
        <p>Ocurrió un error: {fetchError}</p>
      </div>
    );
  }

  // Render UI When Data is Successfully Fetched
  return (
    <div className="mb-[24px] w-full">
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
        {/* Saldo (Balance) Card */}
        <SummaryWidgetCard
          totalEarnImg={totalEarn}
          memberImg={memberImg}
          title="Finaciamiento"
          amount={formatCurrency(summaryData?.balance, summaryData?.currency)}
          id="totalBalance"
          type="money"
        />

        {/* Valor Adeudado (Due Payment) Card */}
        <SummaryWidgetCard
          totalEarnImg={totalEarn}
          memberImg={memberImg}
          title="Saldo Pendiente"
          amount={formatCurrency(summaryData?.totalDue, summaryData?.currency)}
          fee={formatCurrency(summaryData?.totalFees, summaryData?.currency)} // If total fees are always in USD
          id="totalDuePayment"
          type="money"
        />
      </div>

      <div className="pt-6">
        {user ? (
          <PaymentList user={user} token={token} />
        ) : (
          <div className="text-center">Cargando Pagos...</div>
        )}
      </div>
    </div>
  );
}

export default Summary;