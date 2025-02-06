import { useState } from "react";
import UserFilter from "../../component/forms/UserFilter";
import UsersList from "../../component/user/UsersList";
import RightSidebar from "../../component/user/RightSidebar";

function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // Add this state

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700">
      <div className="flex 2xl:flex-row 2xl:space-x-11 flex-col space-y-10">
        <div className="2xl:flex-1 w-full">
          <UserFilter
            searchTerm={searchTerm}
            role={role}
            onSearchChange={setSearchTerm}
            onRoleChange={setRole}
          />
          <UsersList 
            searchTerm={searchTerm} 
            role={role} 
            onUserSelect={setSelectedUser} // Add this prop
          />
        </div>
        {selectedUser && <RightSidebar user={selectedUser} />} {/* Conditionally render sidebar */}
      </div>
    </main>
  );
}

export default Users;