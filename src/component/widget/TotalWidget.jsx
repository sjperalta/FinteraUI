import totalEarn from "../../assets/images/icons/total-earn.svg";
import memberImg from "../../assets/images/avatar/members-2.png";
import TotalWidgetCard from "./TotalWidgetCard";

function TotalWidget({ statistics }) {

  return (
    <div className="mb-[24px] w-full">
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-3">
        <TotalWidgetCard
          totalEarnImg={totalEarn}
          memberImg={memberImg}
          title="Total Ingresos"
          amount={Number(statistics.total_income).toLocaleString()}
          groth={statistics.total_income_growth} // Placeholder, update as needed
          id="totalIncome"
          type="money"
          currency="L"
        />
        <TotalWidgetCard
          totalEarnImg={totalEarn}
          memberImg={memberImg}
          title="Interés"
          amount={Number(statistics.total_interest).toLocaleString()}
          groth={statistics.total_interest_growth} // Placeholder, update as needed
          id="totalInterest"
          type="money"
          currency="L"
        />
        <TotalWidgetCard
          totalEarnImg={totalEarn}
          memberImg={memberImg}
          title="Nuevos Clientes"
          amount={statistics.new_customers.toLocaleString()}
          groth={statistics.new_customers_growth} // Placeholder, update as needed
          id="newCustomers"
          type="number"
        />
      </div>
    </div>
  );
}

export default TotalWidget;