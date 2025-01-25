import visa from "../../assets/images/payments/visa.svg";
import master from "../../assets/images/payments/master.svg";
import ae from "../../assets/images/payments/ae.svg";
import paypal from "../../assets/images/payments/paypal.svg";
import ael from "../../assets/images/payments/ae-l.svg";
import amazon from "../../assets/images/payments/amazon.svg";
import amazonWhite from "../../assets/images/payments/amazon-white.svg";
import payoner from "../../assets/images/payments/payoner.svg";
import payonerWhite from "../../assets/images/payments/payoneer-white.svg";
import PBCard from "./PBCard";
import AddWallet from "./AddWallet";

function PaymentAndBilling() {
  return (
    <div>
      <h3 className="text-2xl font-bold pb-5 text-bgray-900 dark:text-white">
        Payment and Billing
      </h3>
      <div className="grid 2xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 2xl:gap-10 gap-5 pb-14">
        <PBCard
          name="Credit or Debit Card"
          desc="Offers payment processing software for e-commerce websites and
            mobile applications."
        >
          <img src={visa} alt="" />
          <img src={master} alt="" />
          <img src={ae} alt="" />
        </PBCard>
        <PBCard
          name="PayPal"
          desc="Offers payment processing software for e-commerce websites and
            mobile applications."
        >
          <img src={paypal} alt="" />
        </PBCard>
        <PBCard
          name="American Express"
          desc="Offers payment processing software for e-commerce websites and
            mobile applications."
        >
          <img src={ael} alt="" />
        </PBCard>
        <PBCard
          name="Amazon"
          desc="Offers payment processing software for e-commerce websites and
            mobile applications."
        >
          <img src={amazon} className="block dark:hidden" alt="" />
          <img src={amazonWhite} className="hidden dark:block" alt="" />
        </PBCard>
        <PBCard
          name="payoner"
          desc="Offers payment processing software for e-commerce websites and
            mobile applications."
        >
          <img src={payoner} className="block dark:hidden" alt="" />
          <img src={payonerWhite} className="hidden dark:block" alt="" />
        </PBCard>

        <AddWallet />
      </div>
    </div>
  );
}

export default PaymentAndBilling;
