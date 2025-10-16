import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchFilterBar from "../../component/ui/SearchFilterBar";
import GenericList from "../../component/ui/GenericList";
import UserData from "../../component/user/UserData";
import RightSidebar from "../../component/user/RightSidebar";
import AuthContext from "../../context/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { getToken } from "../../../auth";

function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLocale();
  const token = getToken();

  // Get available role options based on current user's role
  const getRoleFilterOptions = () => {
    const allRoles = [
      { value: "", label: t('userFilter.all') },
      { value: "User", label: t('userFilter.user') },
      { value: "Seller", label: t('userFilter.seller') },
      { value: "Admin", label: t('userFilter.admin') }
    ];
    
    if (user?.role === 'admin') {
      return allRoles; // Admin can see all roles
    } else if (user?.role === 'seller') {
      return [allRoles[0], allRoles[1]]; // Seller can only see "All" and "User"
    }
    
    return [allRoles[0]]; // Default fallback
  };

  const roleOptions = getRoleFilterOptions();

  // Define columns for the desktop table view
  const columns = [
    { label: t('users.user'), align: "left" },
    { label: t('common.status'), align: "center" },
    { label: t('common.actions'), align: "left" }
  ];

  // Render function for individual user items
  const renderUserItem = (user, index, isMobileCard, handleClick) => {
    return (
      <UserData
        userInfo={user}
        index={index}
        token={token}
        onClick={() => handleClick(user)}
        isMobileCard={isMobileCard}
      />
    );
  };

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
      <div className="flex 2xl:flex-row 2xl:space-x-11 flex-col space-y-10">
        <div className="2xl:flex-1 w-full">
          <SearchFilterBar
            searchTerm={searchTerm}
            filterValue={role}
            filterOptions={roleOptions}
            onSearchChange={setSearchTerm}
            onFilterChange={setRole}
            searchPlaceholder={t('userFilter.searchPlaceholder')}
            filterPlaceholder={t('userFilter.selectType')}
            minSearchLength={3}
            showFilter={true}
            actions={[
              {
                label: t('userFilter.addUser'),
                onClick: () => navigate("/users/create"),
                className: "py-3 px-10 bg-success-300 text-white font-bold rounded-lg hover:bg-success-400 transition-all"
              }
            ]}
          />
          <GenericList
            endpoint="/api/v1/users"
            renderItem={renderUserItem}
            filters={{ search_term: searchTerm, role: role }}
            onItemSelect={setSelectedUser}
            columns={columns}
            sortBy="created_at-desc"
            itemsPerPage={10}
            emptyMessage={t('users.noUsersFound')}
            loadingMessage={t('users.loadingUsers')}
            entityName="users"
          />
        </div>
        {selectedUser && <RightSidebar user={selectedUser} onClose={onClose} />}
      </div>
    </main>
  );
}

export default Users;
