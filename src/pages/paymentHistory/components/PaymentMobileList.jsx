import PaymentCard from './PaymentCard';

function PaymentMobileList({ 
  payments, 
  formatCurrency, 
  formatDate, 
  getStatusBadge, 
  getPaymentTypeIcon,
  onViewDetails 
}) {
  return (
    <div className="lg:hidden divide-y divide-gray-200 dark:divide-darkblack-400">
      {payments.map((payment) => (
        <PaymentCard
          key={payment.id}
          payment={payment}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          getPaymentTypeIcon={getPaymentTypeIcon}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}

export default PaymentMobileList;
