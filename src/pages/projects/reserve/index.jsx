import { useContext, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from './../../../../config'; 
import SupportTicketEditor from "../../../component/editor/SupportTicketEditor";
import AuthContext from "../../../context/AuthContext";
import debounce from 'lodash.debounce';

function Reserve() {
    const { id, lot_id } = useParams();
    const [paymentTerm, setPaymentTerm] = useState(12);
    const [financingType, setFinancingType] = useState("direct");
    const [reserveAmount, setReserveAmount] = useState(1000);
    const [downPayment, setDownPayment] = useState(5000);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [identity, setIdentity] = useState("");
    const [rtn, setRtn] = useState("");
    const [email, setEmail] = useState("");
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);
    const [formSubmitting, setFormSubmitting] = useState(false);

    // User search states
    const [userQuery, setUserQuery] = useState("");
    const [userResults, setUserResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    // Lot details states
    const [lotName, setLotName] = useState("");
    const [lotPrice, setLotPrice] = useState(null);
    const [lotLoading, setLotLoading] = useState(true);
    const [lotError, setLotError] = useState(null);

    // Fetch lot details
    useEffect(() => {
        const fetchLotDetails = async () => {
            setLotLoading(true);
            setLotError(null);
            try {
                const response = await fetch(`${API_URL}/api/v1/projects/${id}/lots/${lot_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error fetching lot details');
                }

                const data = await response.json();
                // Assuming the lot JSON has { name: string, price: number, ... }
                setLotName(data.name);
                setLotPrice(data.price);
            } catch (error) {
                setLotError(error.message);
            } finally {
                setLotLoading(false);
            }
        };

        if (id && lot_id && token) {
            fetchLotDetails();
        }
    }, [id, lot_id, token]);

    // Debounce the search function to limit API calls
    const debouncedSearch = useCallback(
        debounce((query) => {
            setCurrentPage(1); // Reset to first page on new search
            handleUserSearch(query, 1);
        }, 500), // 500ms delay
        []
    );

    const handleQueryChange = (query) => {
        setUserQuery(query);
        if (query.length > 2) {
            debouncedSearch(query);
        } else {
            setUserResults([]);
            setTotalPages(1);
            setCurrentPage(1);
        }
    };

    const handleUserSearch = async (query, page = 1) => {
        if (query.length > 2) {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/v1/users?search_term=${encodeURIComponent(query)}&role=user&page=${page}&per_page=10`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 401) {
                    throw new Error("Unauthorized. Please log in again.");
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Error searching users.");
                }

                const data = await response.json();
                const fetchedUsers = data.users || [];
                const pagination = data.pagination || {};

                if (page === 1) {
                    setUserResults(fetchedUsers);
                } else {
                    setUserResults((prevUsers) => [...prevUsers, ...fetchedUsers]);
                }

                setTotalPages(pagination.pages || 1);
                setCurrentPage(page);
            } catch (error) {
                console.error("Error searching users:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        } else {
            setUserResults([]);
            setTotalPages(1);
            setCurrentPage(1);
        }
    };

    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        if (nextPage <= totalPages) {
            handleUserSearch(userQuery, nextPage);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append("contract[payment_term]", paymentTerm);
        formData.append("contract[financing_type]", financingType);
        formData.append("contract[reserve_amount]", reserveAmount);
        formData.append("contract[down_payment]", downPayment);
        formData.append("contract[applicant_user_id]", selectedUser?.id || 0); // Use 0 if creating a new user
        formData.append("user[full_name]", fullName);
        formData.append("user[phone]", phone);
        formData.append("user[identity]", identity);
        formData.append("user[rtn]", rtn);
        formData.append("user[email]", email);

        documents.forEach((doc, index) => {
            formData.append(`documents[${index}]`, doc);
        });

        try {
            const response = await fetch(`${API_URL}/api/v1/projects/${id}/lots/${lot_id}/contracts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error + ', Error creando el contrato ');
            }

            alert('Contrato creado exitosamente');
            navigate(`/projects/${id}/lots`);
        } catch (error) {
            setError(error.message);
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        setDocuments([...e.target.files]);
    };

    const handleUserSelect = (user) => {
        setFullName(user.full_name);
        setPhone(user.phone);
        setIdentity(user.identity);
        setRtn(user.rtn);
        setEmail(user.email);
        setSelectedUser(user);
        setUserResults([]);
        setCurrentPage(1);
        setTotalPages(1);
    };

    return (
        <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
            <div className="max-w-5xl mx-auto bg-white p-8 shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold pb-5 text-bgray-900 dark:text-white dark:border-darkblack-400 border-b border-bgray-200">
                    Solicitud de Reserva para Lote {lot_id}
                </h2>

                {/* Display Lot Details */}
                {lotLoading && <p>Cargando detalles del lote...</p>}
                {lotError && <p className="text-red-500">Error: {lotError}</p>}
                {!lotLoading && !lotError && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold">Lote: {lotName}</h3>
                        <p>Precio: {lotPrice ? `${lotPrice} HNL` : 'N/A'}</p>
                    </div>
                )}

                <div className="mt-0">
                    <form onSubmit={handleSubmit}>
                        <div className="grid 2xl:grid-cols-2 grid-cols-1 gap-6">
                            <h4 className="pt-8 pb-6 text-xl font-bold text-bgray-900 dark:text-white">Tipo de Financiamiento</h4>
                            <br />
                            <div className="flex flex-col gap-2">
                                <label className="text-base text-bgray-600 dark:text-bgray-50 font-medium">Tipo de Financiamiento</label>
                                <select
                                    value={financingType}
                                    onChange={(e) => setFinancingType(e.target.value)}
                                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
                                >
                                    <option value="direct">Directo</option>
                                    <option value="bank">Bancario</option>
                                    <option value="cash">Contado</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-base text-bgray-600 dark:text-bgray-50">Término de Pago (meses)</label>
                                <input
                                    type="number"
                                    value={paymentTerm}
                                    onChange={(e) => setPaymentTerm(e.target.value)}
                                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-base text-bgray-600 dark:text-bgray-50  font-medium">Monto de la Reserva (HNL)</label>
                                <input
                                    type="number"
                                    value={reserveAmount}
                                    onChange={(e) => setReserveAmount(e.target.value)}
                                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-base text-bgray-600 dark:text-bgray-50  font-medium">Monto del Prima (HNL)</label>
                                <input
                                    type="number"
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(e.target.value)}
                                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-base text-bgray-600 dark:text-bgray-50 font-medium">Notas</label>
                                <SupportTicketEditor />
                            </div>

                            <br />

                            <h4 className="pt-8 pb-6 text-xl font-bold text-bgray-900 dark:text-white">Información del Cliente</h4>
                            <br />

                            <div className="flex flex-col gap-2">
                                <label className="text-base text-bgray-600 dark:text-bgray-50 font-medium">Buscar Usuario</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={userQuery}
                                        onChange={(e) => {
                                            handleQueryChange(e.target.value);
                                        }}
                                        className="bg-bgray-200 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
                                        placeholder="Nombre, teléfono o email"
                                    />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="absolute left-3 top-3.5 h-7 w-7 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="green"
                                        strokeWidth="2"
                                    >
                                        <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-4.35-4.35M16.65 9.9a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
                                        />
                                    </svg>
                                </div>
                                {/* Dropdown con resultados de búsqueda */}
                                {userResults.length > 0 && (
                                    <div className="bg-white dark:bg-darkblack-500 border border-bgray-300 rounded-lg mt-2 max-h-40 overflow-y-auto">
                                        {userResults.map((user) => (
                                            <div
                                                key={user.id}
                                                className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-darkblack-600"
                                                onClick={() => handleUserSelect(user)}
                                            >
                                                {user.full_name} - {user.phone} - {user.email}
                                            </div>
                                        ))}
                                        {/* Load More Button */}
                                        {currentPage < totalPages && (
                                            <button
                                                type="button"
                                                onClick={handleLoadMore}
                                                className="w-full text-center p-2 bg-gray-100 dark:bg-darkblack-600 hover:bg-gray-200 dark:hover:bg-darkblack-700"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Cargando...' : 'Cargar más'}
                                            </button>
                                        )}
                                    </div>
                                )}
                                {/* Loading Indicator */}
                                {isLoading && userResults.length === 0 && <p>Cargando usuarios...</p>}
                            </div>

                            <br />

                            <div className="flex flex-col gap-2">
                                <label htmlFor="fname" className="text-base text-bgray-600 dark:text-bgray-50 font-medium">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
                                    required
                                    disabled={selectedUser !== null} // Disable if a user is selected
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="phone" className="text-base text-bgray-600 dark:text-bgray-50 font-medium">Teléfono</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
                                    required
                                    disabled={selectedUser !== null} // Disable if a user is selected
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-base text-bgray-600 dark:text-bgray-50 font-medium">Identidad</label>
                                <input
                                    type="text"
                                    value={identity}
                                    onChange={(e) => setIdentity(e.target.value)}
                                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-base text-bgray-600 dark:text-bgray-50 font-medium">RTN</label>
                                <input
                                    type="text"
                                    value={rtn}
                                    onChange={(e) => setRtn(e.target.value)}
                                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-base text-bgray-600 dark:text-bgray-50 font-medium">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-base text-bgray-600 dark:text-bgray-50 font-medium">Documentos</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    multiple
                                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
                                />
                            </div>

                            {error && <p className="text-red-500">{error}</p>}

                        </div>

                        <div className="flex justify-between">
                            <button
                                aria-label="none"
                                type="button"
                                onClick={() => navigate(-1)}
                                className="bg-gray-500 hover:bg-gray-600 text-white mt-10 py-3.5 px-4 rounded-lg"
                            >
                                Volver
                            </button>
                            <button
                                type="submit"
                                className={`bg-success-300 hover:bg-green-600 text-white mt-10 py-3.5 px-4 rounded-lg ${formSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={formSubmitting}
                            >
                                {formSubmitting ? 'Creando...' : 'Crear Solicitud'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );

}

export default Reserve;