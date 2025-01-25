// src/components/payments/PaymentList.jsx

import { useState, useEffect } from "react";
import PaymentData from "./PaymentData";
import { API_URL } from '../../../config'; // Ensure the base URL is correctly set
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './PaymentList.css'; // Import the CSS for transitions
import WhiteBtn from "../button/WhiteBtn";

function PaymentList({ user, token }) {
  const [payments, setPayments] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.id || !token) {
      // If user or token is not available, do not attempt fetch.
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/v1/user/${user.id}/payments`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error fetching payments');
        }

        const data = await response.json();

        // Adjust based on API response structure
        if (data.payments) {
          setPayments(data.payments);
        } else if (Array.isArray(data)) {
          // If the API returns an array directly
          setPayments(data);
        } else {
          throw new Error('Invalid data format');
        }

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, token]); // Only re-run if user or token changes

  const handleToggleShow = () => {
    setShowAll(prevShowAll => !prevShowAll);
  };

  // Determine which payments to display
  const displayedPayments = showAll ? payments : payments.slice(0, 5);

  if (loading) {
    return <div>Loading payments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (payments.length === 0) {
    return <div>No tienes ningun contrato de financiamiento activo!</div>;
  }

  return (
    <div>
      <table className="w-full">
        <TransitionGroup component="tbody">
          {displayedPayments.map((payment, index) => (
            <CSSTransition key={payment.id} timeout={300} classNames="fade">
              <PaymentData paymentData={payment} user={user} index={index} />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </table>

      {payments.length > 5 && (
        <div className="flex justify-center mt-6">
          <WhiteBtn action={handleToggleShow} text={showAll ? 'Mostrar Menos' : 'Mostrar todo'} />
        </div>
      )}
    </div>
  );
}

export default PaymentList;