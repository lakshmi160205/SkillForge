import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
// import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
const dashboardPathByRole = {
  STUDENT: "/student/dashboard",
  INSTRUCTOR: "/instructor/dashboard",
  ADMIN: "/admin/dashboard",
};

const profilePathByRole = {
  STUDENT: "/student/profile",
};

export function Layout({ children }) {
  const location = useLocation();
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-emerald-100/80 bg-white/95 backdrop-blur sf-animate-enter">
        <div className="border-b border-slate-200/70 bg-emerald-50/45">
          <div className="sf-container flex flex-wrap items-center justify-between gap-2 py-2 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-emerald-800">Marketplace</span>
              <span>Learn from expert instructors across domains</span>
            </div>
            <Link to="/teach" className="font-semibold text-emerald-800 hover:text-emerald-900">
              Teach on SkillForge
            </Link>
          </div>
        </div>

        <div className="sf-container flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 text-xl font-bold text-emerald-800">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-linear-to-br from-emerald-700 via-emerald-600 to-amber-400 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/20">
              SF
              </span>
              <span>SkillForge</span>
            </Link>

            <Link
              to="/categories"
              className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-800 lg:inline-flex"
            >
              Categories
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 md:flex">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-emerald-800"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-emerald-800"
                  }`
                }
              >
                Browse
              </NavLink>
              {isAuthenticated && (
                <button
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-emerald-800"
                  type="button"
                  onClick={goToDashboard}
                >
                  Dashboard
                </button>
              )}
            </nav>

            <Link
              to="/cart"
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-800"
            >
              Cart ({cart.length})
            </Link>

            {isAuthenticated ? (
              <>
                {profilePathByRole[role] ? (
                  <Link
                    to={profilePathByRole[role]}
                    className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 md:inline-flex"
                    aria-label="Open profile"
                    title="Open profile"
                  >
                    {user?.firstName || role}
                  </Link>
                ) : (
                  <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 md:inline-flex">
                    {user?.firstName || role}
                  </span>
                )}
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  className="sf-btn-secondary rounded-full px-4 py-2 text-sm font-semibold transition"
                  to="/login"
                >
                  Login
                </Link>
                <Link
                  className="sf-btn-primary rounded-full px-4 py-2 text-sm font-semibold transition"
                  to="/register"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="sf-container flex-1 py-6">
        <div key={location.pathname} className="sf-page-transition">
          {children}
        </div>
      </main>

      <footer className="mt-6 border-t border-emerald-100 bg-white/75 sf-animate-enter-delay-2">
        <div className="sf-container py-8">
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-lg font-bold text-slate-900">SkillForge</p>
              <p className="text-sm text-slate-500">Online learning platform for students, instructors, and admins.</p>
            </div>

            <div className="grid gap-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Explore</p>
              <Link to="/" className="hover:text-emerald-800">Home</Link>
              <Link to="/categories" className="hover:text-emerald-800">Categories</Link>
              <Link to="/teach" className="hover:text-emerald-800">Teach on SkillForge</Link>
            </div>

            <div className="grid gap-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Account</p>
              <Link to="/login" className="hover:text-emerald-800">Login</Link>
              <Link to="/register" className="hover:text-emerald-800">Create Account</Link>
              <Link to="/cart" className="hover:text-emerald-800">Cart</Link>
            </div>

            <div className="grid gap-1 text-sm text-slate-500">
              <p>Discover courses. Build skills. Track progress.</p>
              <p>Designed for a cleaner, faster student experience.</p>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500">
            © {currentYear} SkillForge.
          </div>
        </div>
      </footer>
    </div>
  );
}
