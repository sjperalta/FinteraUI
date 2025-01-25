import { useState } from "react";
import UserFilter from "../../component/forms/UserFilter";
import UsersList from "../../component/user/UsersList";
import RightSidebar from "../../component/user/RightSidebar";

function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700 ">
      {/* write your code here */}
      <div className="flex 2xl:flex-row 2xl:space-x-11 flex-col space-y-20">
        <div className="2xl:flex-1 w-full">
          <UserFilter
            searchTerm={searchTerm}
            role={role}
            onSearchChange={setSearchTerm}
            onRoleChange={setRole}
          />
          <UsersList searchTerm={searchTerm} role={role} />
        </div>
        <RightSidebar />
      </div>
    </main>
  );
}

export default Users;
