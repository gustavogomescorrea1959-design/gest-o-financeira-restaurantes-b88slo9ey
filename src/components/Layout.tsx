import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  ReceiptText,
  Calculator,
  PieChart,
  LogOut,
  Settings,
  Bell,
  Layers,
} from 'lucide-react'

export default function Layout() {
  const { signOut, user } = useAuth()
  const location = useLocation()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 font-bold text-xl text-primary-foreground flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
            GR
          </div>
          <span>GestãoRest</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                <Link to="/">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/lancamentos'}>
                <Link to="/lancamentos">
                  <ReceiptText />
                  <span>Lançamentos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/orcamento'}>
                <Link to="/orcamento">
                  <Calculator />
                  <span>Orçamento</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/relatorios'}>
                <Link to="/relatorios">
                  <PieChart />
                  <span>Relatórios</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/categorias'}>
                <Link to="/categorias">
                  <Layers />
                  <span>Categorias</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/configuracoes'}>
                <Link to="/configuracoes">
                  <Settings />
                  <span>Equipe</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut}>
                <LogOut />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b px-4 lg:h-16 bg-card shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-foreground" />
            <h1 className="text-lg font-bold capitalize text-foreground">
              {location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1)}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors duration-150" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:inline-block">
                {user?.name || user?.email}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background p-4 md:p-8 space-y-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
