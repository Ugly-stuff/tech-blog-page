import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username") || "My Profile";
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("username");
        navigate("/login");
    };

    const deleteAccount = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone. All your blogs will be deleted."
        );

        if (!confirmDelete) return;

        setDeleting(true);
        try {
            const response = await fetch("http://localhost:5000/account", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                alert("Account deleted successfully");
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("email");
                localStorage.removeItem("username");
                navigate("/login");
            } else {
                alert("Failed to delete account");
            }
        } catch (error) {
            console.error("Delete account error:", error);
            alert("Error deleting account");
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-[#033452]"
                >📝 Tech Blog</Link>

                {!token ? (
                    <Link to="/login" className="px-4 py-2 bg-[#033452] text-white rounded-md text-sm hover:bg-opacity-90 transition"
                    > Login</Link>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/me" className="text-sm font-medium text-[#033452] hover:underline">
                            👤 {username}
                        </Link>
                        <button onClick={logout} className="text-sm text-red-500 hover:underline font-medium">
                            Logout
                        </button>
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-600 px-2 py-1 rounded hover:bg-red-50 transition"
                        >
                            🗑️ Delete Account
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
                        <h3 className="text-lg font-bold text-red-600 mb-4">Delete Account?</h3>
                        <p className="text-gray-600 mb-6">
                            This will permanently delete your account and all your blogs. This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteAccount}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
