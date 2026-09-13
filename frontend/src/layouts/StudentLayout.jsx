import { NavLink, Outlet, useNavigate } from "react-router-dom"

import {
  LayoutDashboard,
  ClipboardList,
  CalendarCheck,
  BookOpen,
  BarChart3,
  User,
  LogOut,
  GraduationCap,
} from "lucide-react"

import { clearAuth } from "../auth/auth"


function StudentLayout() {
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
      path: "/student",
      icon: <LayoutDashboard size={19} />,
      end: true,
    },
    {
      label: "Marks",
      path: "/student/marks",
      icon: <ClipboardList size={19} />,
    },
    {
      label: "Attendance",
      path: "/student/attendance",
      icon: <CalendarCheck size={19} />,
    },
    {
      label: "Courses",
      path: "/student/courses",
      icon: <BookOpen size={19} />,
    },
    {
      label: "Performance",
      path: "/student/performance",
      icon: <BarChart3 size={19} />,
    },
    {
      label: "Profile",
      path: "/student/profile",
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
              Student Portal
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


export default StudentLayout