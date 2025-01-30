import { useEffect, useState } from "react";
import { API_URL } from "./../../../config"; // Update the path as needed
import { getToken } from "./../../../auth"; // Update the path as needed
import PropTypes from "prop-types";

function PersonalInfoForm({ userId }) {
  const [user, setUser] = useState({
    full_name: "",
    phone: "",
    email: "",
    identity: "",
    rtn: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getToken(); // Retrieve token from auth helper

  useEffect(() => {
    if (!userId) {
      setError("User ID is not provided or invalid.");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include token for authentication
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser({
          full_name: data.full_name || "",
          phone: data.phone || "",
          email: data.email || "",
          identity: data.identity || "",
          rtn: data.rtn || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("Cannot update user without a valid User ID.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      alert("Profile updated successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!userId) {
    return <p className="text-red-500">User ID is required to load data.</p>;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="2xl:col-span-8 xl:col-span-7">
      <h3 className="text-2xl font-bold pb-5 text-bgray-900 dark:text-white dark:border-darkblack-400 border-b border-bgray-200">
        Información Personal
      </h3>
      <div className="mt-8">
        <form onSubmit={handleSubmit}>
          <div className="grid 2xl:grid-cols-2 grid-cols-1 gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="full_name"
                className="text-base text-bgray-600 dark:text-bgray-50 font-medium"
              >
                Nombre Completo
              </label>
              <input
                type="text"
                name="full_name"
                value={user.full_name}
                onChange={handleInputChange}
                className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone"
                className="text-base text-bgray-600 dark:text-bgray-50 font-medium"
              >
                Phone Number (Optional)
              </label>
              <input
                type="text"
                name="phone"
                value={user.phone}
                onChange={handleInputChange}
                className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-base text-bgray-600 dark:text-bgray-50 font-medium"
              >
                Email
              </label>
              <input
                type="text"
                name="email"
                value={user.email}
                onChange={handleInputChange}
                className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
              />
            </div>
          </div>
          <h4 className="pt-8 pb-6 text-xl font-bold text-bgray-900 dark:text-white">
            Información General
          </h4>
          <div className="grid 2xl:grid-cols-2 grid-cols-1 gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="identity"
                className="text-base text-bgray-600 dark:text-bgray-50 font-medium"
              >
                Cedula
              </label>
              <input
                type="text"
                name="identity"
                value={user.identity}
                onChange={handleInputChange}
                className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="rtn"
                className="text-base text-bgray-600 dark:text-bgray-50 font-medium"
              >
                RTN
              </label>
              <input
                type="text"
                name="rtn"
                value={user.rtn}
                onChange={handleInputChange}
                className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              aria-label="none"
              className="rounded-lg bg-success-300 text-white font-semibold mt-10 py-3.5 px-4"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

PersonalInfoForm.propTypes = {
  userId: PropTypes.string, // Updated to allow null values
};

export default PersonalInfoForm;