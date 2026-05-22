import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
// import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
const dashboardPathByRole = {
  STUDENT: "/student/dashboard",
  INSTRUCTOR: "/instructor/dashboard",
  ADMIN: "/admin/dashboard",
};

export function Layout({ children }) {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { isAuthenticated, role, user, logout } = useAuth();
  const currentYear = new Date().getFullYear();

  const goToDashboard = () => {
    const path = dashboardPathByRole[role];
    if (path) {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 md:px-6">
      <header className="sticky top-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-emerald-100/80 bg-white/90 px-5 py-4 shadow-[0_24px_60px_rgba(6,95,70,0.08)] backdrop-blur">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-emerald-800">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-linear-to-br from-emerald-700 via-emerald-600 to-amber-400 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/20">
              SF
            </span>
            <span>
              SkillForge
            </span>
          </Link>
          
        </div>
         <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1 rounded-full bg-slate-50/90 p-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-emerald-800"
              }`
            }
          >
            Courses
          </NavLink>
          {isAuthenticated && (
            <button
              className=  "rounded-full px-4 py-2 text-sm font-semibold ` text-slate-600 transition hover:bg-white hover:text-emerald-800"
              type="button"
              onClick={goToDashboard}
            >
              Dashboard
            </button>
          )}
        </nav>

          <Link to="/cart">🛒 {cart.length}</Link>
          {isAuthenticated ? (
            <>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                {user?.firstName || role}
              </span>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                className="rounded-full border border-slate-200 bg-emerald-700 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                to="/login"
              >
                Login
              </Link>
              <Link
                className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                to="/register"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 py-6">{children}</main>

      <footer className="mt-6 rounded-[1.75rem] border border-emerald-100 bg-white/80 px-5 py-6 shadow-[0_24px_60px_rgba(6,95,70,0.06)] backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-bold text-slate-900">SkillForge</p>
            <p className="text-sm text-slate-500">
              Online learning platform for students, instructors, and admins.
            </p>
          </div>

          <div className="grid gap-1 text-sm text-slate-500 md:text-right">
            <p>Discover courses. Build skills. Track progress.</p>
            <p>Designed for a cleaner, faster student experience.</p>
          </div>

          
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500">
          © {currentYear} SkillForge. 
        </div>
      </footer>
    </div>
  );
}
