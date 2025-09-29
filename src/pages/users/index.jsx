import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import UserFilter from "../../component/forms/UserFilter";
import UsersList from "../../component/user/UsersList";
import RightSidebar from "../../component/user/RightSidebar";

function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // Add this state
  const location = useLocation();

  // Check if we received user data from navigation state
  useEffect(() => {
    if (location.state?.selectedUserId || location.state?.selectedUserName) {
      // Create a user object from the navigation state
      const userFromState = {
        id: location.state.selectedUserId,
        identity: location.state.selectedUserId,
        full_name: location.state.selectedUserName,
        phone: location.state.selectedUserPhone,
        // Add other default values for the sidebar
        email: "", // We don't have this from contract data
        role: "", // We don't have this from contract data
        status: "", // We don't have this from contract data
      };
      
      // Set the search term to the user's name to help find them in the list
      if (location.state.selectedUserName) {
        setSearchTerm(location.state.selectedUserName);
      }
      
      // Set the selected user to show the sidebar
      setSelectedUser(userFromState);
      
      // Clear the navigation state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ✅ Define onClose function to clear selectedUser
  const onClose = () => {
    setSelectedUser(null);
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700">
      {/* When a user is selected show a small banner with who created that user (supports different shapes) */}
      {selectedUser && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-darkblack-600 px-4 py-2 rounded-md shadow-sm">
            <span className="text-xs font-medium text-bgray-600 dark:text-bgray-300">Creado por</span>
            <span className="text-sm text-bgray-800 dark:text-white">
              {
                // Resolve several possible shapes for created_by: string id/name, nested object, or creator id
                (function resolveCreator(u) {
                  if (!u) return "—";
                  const c = u.created_by || u.createdBy || u.creator || u.created_by_name || u.created_by_id || u.created_by_id;
                  if (!c) return "—";
                  if (typeof c === "string") return c;
                  if (typeof c === "number") return String(c);
                  if (c.full_name) return c.full_name;
                  if (c.name) return c.name;
                  if (c.id) return String(c.id);
                  if (c.email) return c.email;
                  return JSON.stringify(c);
                })(selectedUser)
              }
            </span>
          </div>
        </div>
      )}
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
        {selectedUser && <RightSidebar user={selectedUser} onClose={onClose}/>} {/* Conditionally render sidebar */}
      </div>
    </main>
  );
}

export default Users;