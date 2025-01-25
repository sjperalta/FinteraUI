import Progressbar from "../../component/chart/Progressbar";
import Note from "../../component/support/Note";
import PresentAddress from "../../component/support/PresentAddress";
import ShippingAddress from "../../component/support/ShippingAddress";
import ContactInfo from "../../component/support/ContactInfo";
import CustomerInfo from "../../component/support/CustomerInfo";
import RecentSupport from "../../component/support/RecentSupport";
import SupportTicket from "../../component/forms/SupportTicket";
import SupportHeader from "../../component/support/Header";

function Support() {
  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700">
      {/* write your code here */}
      <div className="lg:grid grid-cols-12 gap-10 flex flex-col-reverse">
        {/* Left Column */}
        <div className="2xl:col-span-9 col-span-8">
          <SupportHeader />
          <div className="rounded-lg bg-white dark:bg-darkblack-600 px-6 py-8">
            <div className="2xl:flex justify-between gap-12">
              {/* Form  */}
              <SupportTicket />
              {/* Tabs  */}
              <RecentSupport />
            </div>
          </div>
        </div>
        {/* right Column */}
        <div className="w-full 2xl:col-span-3 col-span-4 space-y-10">
          <div className="bg-white dark:bg-darkblack-600 dark:border-darkblack-400 p-8 divide-y divide-bgray-300 dark:divide-darkblack-400 rounded-lg">
            {/* Customer  */}
            <CustomerInfo />
            {/* Contact Info  */}
            <ContactInfo />
            {/* Shipping Address */}
            <ShippingAddress />
            {/* Present Address  */}
            <PresentAddress />
          </div>
          {/* Note  */}
          <Note />
          {/* Progressbar  */}
          <Progressbar />
        </div>
      </div>
      {/* write your code here */}
    </main>
  );
}

export default Support;
