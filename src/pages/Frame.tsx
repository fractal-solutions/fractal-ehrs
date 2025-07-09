import { SidebarLeft } from "@/components/sidebar-left"
import { SidebarRight } from "@/components/sidebar-right"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom'
import Appointments from "@/pages/appointments/doctors-appointments"
import PatientManagement from "@/pages/patients/patient-management"
import ProcedureManagement from "@/pages/procedures/procedure-management"
import StockControl from "@/pages/inventory/stock-control"
import SupplierManagement from "@/pages/inventory/supplier-management"
import DeliveryNotes from "@/pages/inventory/delivery-notes"
import PurchaseOrders from "@/pages/inventory/purchase-orders"


export default function Page({ onShowRegister }: { onShowRegister?: () => void }) {
  return (
    <BrowserRouter>
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger className="w-8 h-8 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"/>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    <div className="text-lg font-semibold">
                      Fractal EHRS
                    </div>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className=" items-center gap-2 px-3">
          {/* <div className="bg-muted/50 mx-auto h-24 w-full max-w-3xl rounded-xl" />
          <div className="bg-muted/50 mx-auto h-[100vh] w-full max-w-3xl rounded-xl" /> */}
          <Routes>
            <Route path="/" element={<div className="text-center text-2xl">Welcome to Fractal EHRS</div>} />
            <Route path="/patients" element={<PatientManagement />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/procedures" element={<ProcedureManagement />} />
            <Route path="/billing" element={<div className="text-center text-2xl">Billing and Insurance</div>} />
            <Route path="/reports" element={<div className="text-center text-2xl">Reports and Analytics</div>} />
            <Route path="/inventory" element={<StockControl />} />
            <Route path="/inventory/suppliers" element={<SupplierManagement />} />
            <Route path="/inventory/delivery-notes" element={<DeliveryNotes />} />
            <Route path="/inventory/purchase-orders" element={<PurchaseOrders />} />
          </Routes>
        </div>
      </SidebarInset>
      <SidebarRight onShowRegister={onShowRegister} />
    </SidebarProvider>
    </BrowserRouter>
  )
}
