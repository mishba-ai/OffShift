import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { LayoutDashboard, FileSpreadsheet, History, User, CheckSquare } from "lucide-react"

const employeeNav = [
  { title: "Dashboard", url: "/employee/dashboard", icon: LayoutDashboard },
  { title: "Apply Leave", url: "/employee/apply-leave", icon: FileSpreadsheet },
  { title: "Leave History", url: "/employee/leave-history", icon: History },
  { title: "Profile", url: "/employee/profile", icon: User },
]

const managerNav = [
  { title: "Dashboard", url: "/manager/dashboard", icon: LayoutDashboard },
  { title: "Pending Approvals", url: "/manager/pending-approvals", icon: CheckSquare },
]

export function AppSidebar() {
  const { user } = useAuth()

  const navItems = user?.role === "MANAGER" ? managerNav : employeeNav

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-xl"><img src="/favicon.png" alt="" className="w-8"/></span>
          <span>OffShift</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {user?.role === "MANAGER" ? "Manager Panel" : "Employee Panel"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton >
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border flex flex-col gap-1">
        <div className="text-sm font-medium truncate">
          {user?.name || "User Name"}
        </div>
        <div className="text-xs text-muted-foreground capitalize">
          {user?.role?.toLowerCase() || "guest"}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}