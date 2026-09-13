import { NavLink, Outlet, useNavigate } from "react-router-dom"

import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  Layers3,
  Link2,
  BarChart3,
  User,
  LogOut,
  GraduationCap,
} from "lucide-react"

import { clearAuth } from "../auth/auth"


function AdminLayout() {
  const navigate = useNavigate()


  function handleLogout() {
    clearAuth()

    navigate("/", {
      replace: true,
    })
  }


  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard size={19} />,
      end: true,
    },
    {
      label: "Students",
      path: "/admin/students",
      icon: <Users size={19} />,
    },
    {
      label: "Faculty",
      path: "/admin/faculty",
      icon: <UserCog size={19} />,
    },
    {
      label: "Courses",
      path: "/admin/courses",
      icon: <BookOpen size={19} />,
    },
    {
      label: "Semesters",
      path: "/admin/semesters",
      icon: <Layers3 size={19} />,
    },
    {
      label: "Course Mapping",
      path: "/admin/course-mapping",
      icon: <Link2 size={19} />,
    },
    {
      label: "Analytics",
      path: "/admin/analytics",
      icon: <BarChart3 size={19} />,
    },
    {
      label: "Profile",
      path: "/admin/profile",
      icon: <User size={19} />,
    },
  ]


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f6f7fb",
      }}
    >
      <aside
        style={{
          width: "245px",
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #151722 0%, #1d1a32 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            padding: "25px 22px",
            display: "flex",
            alignItems: "center",
            gap: "11px",
            borderBottom:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "11px",
              background:
                "rgba(255,255,255,0.10)",
            }}
          >
            <GraduationCap size={22} />
          </div>

          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
              }}
            >
              Acadence
            </div>

            <div
              style={{
                fontSize: "11px",
                color:
                  "rgba(255,255,255,0.55)",
              }}
            >
              Admin Portal
            </div>
          </div>
        </div>


        <nav
          style={{
            flex: 1,
            padding: "20px 14px",
          }}
        >
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                marginBottom: "6px",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,

                color: isActive
                  ? "#ffffff"
                  : "rgba(255,255,255,0.68)",

                background: isActive
                  ? "rgba(118,96,224,0.28)"
                  : "transparent",
              })}
            >
              {item.icon}

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>


        <div
          style={{
            padding: "18px 14px",
            borderTop:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "10px",
              padding: "12px 14px",
              background:
                "rgba(255,255,255,0.07)",
              color:
                "rgba(255,255,255,0.82)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "11px",
              fontSize: "14px",
              fontWeight: 650,
            }}
          >
            <LogOut size={18} />

            Logout
          </button>
        </div>
      </aside>


      <main
        style={{
          marginLeft: "245px",
          width: "calc(100% - 245px)",
          minHeight: "100vh",
          padding: "30px",
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}


export default AdminLayout