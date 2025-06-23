import * as React from "react"
import {
  Clock,
  Plus,
  Users,
  UserCheck,
  AlertCircle,
  MoreVertical,
  User,
  CheckCircle2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { NavUser } from "@/components/nav-user"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarSeparator } from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "../context/AuthContext.jsx"

const PATIENTS_STORAGE_KEY = "fractal-ehrs-patients"
const QUEUE_STORAGE_KEY = "fractal-ehrs-queue"

function getStoredPatients() {
  try {
    const stored = localStorage.getItem(PATIENTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function savePatients(patients: any[]) {
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients))
}

function getStoredQueue() {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : initialData
  } catch {
    return initialData
  }
}
function saveQueue(data: any) {
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(data))
}

const initialData = {
  waitingPatients: [
    {
      id: "P001",
      name: "John Doe",
      waitTime: "15 min",
      priority: "urgent",
      condition: "Chest Pain",
      age: "45",
      arrivedAt: "10:30 AM",
    },
    {
      id: "P002",
      name: "Jane Smith",
      waitTime: "25 min",
      priority: "normal",
      condition: "Headache",
      age: "32",
      arrivedAt: "10:45 AM",
    },
    {
      id: "P003",
      name: "Mike Johnson",
      waitTime: "35 min",
      priority: "normal",
      condition: "Fever",
      age: "28",
      arrivedAt: "11:00 AM",
    },
  ],
  inConsultation: [
    {
      id: "P004",
      name: "Sarah Wilson",
      doctor: "Dr. Andrews",
      room: "Room 1",
      startedAt: "11:00 AM",
      estimatedDuration: "20 min",
      condition: "Back Pain",
    },
    {
      id: "P005",
      name: "Tom Brown",
      doctor: "Dr. Martinez",
      room: "Room 3",
      startedAt: "11:10 AM",
      estimatedDuration: "10 min",
      condition: "Sprained Ankle",
    },
  ],
}

function SortablePatientCard({ patient, status, ...props }: { patient: any; status: "waiting" | "consulting"; onRemoveFromQueue?: () => void; onStartConsultation?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: patient.id })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="py-1"
    >
      <PatientCard
        patient={patient}
        status={status}
        dragHandle={
          <span
            {...attributes}
            {...listeners}
            className="cursor-grab -pr-2 select-none scale-75"
            title="Drag to reorder"
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            <svg width="16" height="16" fill="currentColor"><circle cx="4" cy="5" r="1.5"/><circle cx="4" cy="11" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="11" r="1.5"/></svg>
          </span>
        }
        {...props}
      />
    </div>
  )
}

function PatientCard({
  patient,
  status,
  onRemoveFromQueue,
  onStartConsultation,
  dragHandle,
}: {
  patient: any
  status: "waiting" | "consulting"
  onRemoveFromQueue?: () => void
  onStartConsultation?: () => void
  dragHandle?: React.ReactNode
}) {
  return (
    <Card className="mb-2 last:mb-0 shadow-none border-muted bg-background/80 h-[90px] -mt-2 hover:bg-background/40 transition-colors">
      <CardHeader className="flex flex-row items-center gap-2 -mt-4 pb-1">
        
        <User className="h-6 w-6 text-muted-foreground" />
        <CardTitle className="flex-1 text-base font-semibold truncate">
          {patient.name}
        </CardTitle>
        {dragHandle}
        {status === "waiting" && (
          <Badge
            variant={patient.priority === "urgent" ? "destructive" : "secondary"}
            className="ml-2"
          >
            {patient.priority === "urgent" ? (
              <>
                <AlertCircle className="mr-1 h-3 w-3" />
                Urgent
              </>
            ) : (
              "Waiting"
            )}
          </Badge>
        )}
        {status === "consulting" && (
          <Badge variant="outline" className="ml-2 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            In Consultation
          </Badge>
        )}
        {/* Dropdown menu for actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-1 text-muted-foreground"
              // Prevent drag and row click when opening menu
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              tabIndex={0}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                // ...view details logic...
              }}
            >
              View Details
            </DropdownMenuItem>
            {status === "waiting" ? (
              <>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    if (onStartConsultation) onStartConsultation();
                  }}
                >
                  Start Consultation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={e => {
                    e.stopPropagation();
                    if (onRemoveFromQueue) onRemoveFromQueue();
                  }}
                >
                  Remove from Queue
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>End Consultation</DropdownMenuItem>
                <DropdownMenuItem>Transfer Patient</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-3 -mt-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {status === "waiting" ? (
            <>
              <span>Arrived: {patient.arrivedAt}</span>
              <span>•</span>
              <span>Wait: {patient.waitTime}</span>
            </>
          ) : (
            <>
              <span>Started: {patient.startedAt}</span>
              <span>•</span>
              <span>{patient.estimatedDuration} left</span>
            </>
          )}
          
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          {status === "waiting" ? (
            <>
              <span>Age: {patient.age}</span>
              <span>•</span>
              <span>{patient.condition}</span>
            </>
          ) : (
            <>
              <span>{patient.doctor}</span>
              <span>•</span>
              <span>{patient.room}</span>
              <span>•</span>
              <span>{patient.condition}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

import  PatientStepperDialog  from "@/pages/patients/patient-stepper-dialog"

export function SidebarRight({
  onShowRegister,
  ...props
}: React.ComponentProps<typeof Sidebar> & { onShowRegister?: () => void }) {
  const { user } = useAuth();
  const [data, setData] = React.useState(getStoredQueue())
  const [patientDialogOpen, setPatientDialogOpen] = React.useState(false)
  const [patients, setPatients] = React.useState(getStoredPatients())
  const [queueDialogOpen, setQueueDialogOpen] = React.useState(false)
  const [queueSearch, setQueueSearch] = React.useState("")
  const [queueConditions, setQueueConditions] = React.useState<{ [id: string]: string }>({})

  React.useEffect(() => {
    saveQueue(data)
  }, [data])

  // Drag-and-drop reorder handler
  function handleDragEnd(event: any) {
    const { active, over } = event
    if (active?.id !== over?.id) {
      setData((prev) => {
        const oldIndex = prev.waitingPatients.findIndex((p) => p.id === active.id)
        const newIndex = prev.waitingPatients.findIndex((p) => p.id === over.id)
        return {
          ...prev,
          waitingPatients: arrayMove(prev.waitingPatients, oldIndex, newIndex),
        }
      })
    }
  }

  function handlePatientAdded(newPatient: any) {
    setPatients(prev => {
      const updated = [...prev, newPatient]
      savePatients(updated)
      return updated
    })
  }

  function handleRemoveFromQueue(patientId: string) {
    setData(prev => ({
      ...prev,
      waitingPatients: prev.waitingPatients.filter(p => p.id !== patientId),
    }))
  }

  function handleStartConsultation(patient: any) {
    setData(prev => ({
      ...prev,
      waitingPatients: prev.waitingPatients.filter(p => p.id !== patient.id),
      inConsultation: [
        ...prev.inConsultation,
        {
          id: patient.id,
          name: patient.name,
          doctor: user?.name || "Unknown",
          room: "Room 1",
          startedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          estimatedDuration: "20 min",
          condition: patient.condition,
        },
      ],
    }))
  }

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh w-[360px] border-l bg-sidebar/90 backdrop-blur-sm lg:flex"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b  sticky top-0 bg-background">
        <NavUser user={{
          name: user?.name || "Unknown",
          email: user?.username || "",
          avatar: user?.avatar || "/avatars/doctor.jpg",
          role: user?.role
        }} onShowRegister={onShowRegister} />
      </SidebarHeader>

      <ScrollArea className="flex-1 px-2 py-2">
        <SidebarContent className="flex flex-col gap-4 h-[75vh] overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-semibold">Waiting Room</span>
              <Badge variant="secondary">{data.waitingPatients.length}</Badge>
            </SidebarGroupLabel>
            <div>
              {data.waitingPatients.length === 0 && (
                <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                  No patients waiting.
                </div>
              )}
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={data.waitingPatients.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {data.waitingPatients.map((patient) => (
                    <SortablePatientCard
                      key={patient.id}
                      patient={patient}
                      status="waiting"
                      onRemoveFromQueue={() => handleRemoveFromQueue(patient.id)}
                      onStartConsultation={() => handleStartConsultation(patient)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </SidebarGroup>

          <SidebarSeparator className="my-3" />

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4" />
              <span className="font-semibold">In Consultation</span>
              <Badge variant="secondary">{data.inConsultation.length}</Badge>
            </SidebarGroupLabel>
            <div>
              {data.inConsultation.length === 0 && (
                <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                  No patients in consultation.
                </div>
              )}
              {data.inConsultation.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  status="consulting"
                />
              ))}
            </div>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>

      <SidebarFooter className="border-t p-3 sticky bottom-0 bg-background flex flex-col gap-2">
        <Button className="w-full h-10 text-base" variant="default" onClick={() => setPatientDialogOpen(true)}>
          <Plus className="mr-2 h-5 w-5" />
          Add New Patient
        </Button>
        <Button
          className="w-full h-10 text-base"
          variant="default"
          onClick={() => setQueueDialogOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Patient to Queue
        </Button>
      </SidebarFooter>

      {/* Multi-step Patient Registration Dialog */}
      <PatientStepperDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
        onPatientAdded={handlePatientAdded}
      />

      {/* Add to Queue Dialog */}
      <Dialog open={queueDialogOpen} onOpenChange={setQueueDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Patient to Waiting Room</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search patients by name, mobile, or condition..."
            value={queueSearch}
            onChange={e => setQueueSearch(e.target.value)}
            className="mb-2"
          />
          <ScrollArea className="max-h-72">
            <div className="flex flex-col gap-2">
              {patients
                .filter(
                  p =>
                    (p.name?.toLowerCase().includes(queueSearch.toLowerCase()) ||
                      p.mobile?.includes(queueSearch) ||
                      p.condition?.toLowerCase().includes(queueSearch.toLowerCase())) &&
                    !data.waitingPatients.some(wp => wp.id === p.id)
                )
                .map(p => (
                  <Card
                    key={p.id}
                    className="flex flex-col md:flex-row items-center justify-between px-4 py-2 gap-2 md:gap-0 cursor-pointer hover:bg-muted"
                    // Remove onClick from Card to avoid accidental add
                  >
                    <div className="flex-1 w-full">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Age: {p.age} &bull; {p.condition}
                      </div>
                      <Input
                        className="mt-1 w-2/3"
                        placeholder="Condition for this visit"
                        value={queueConditions[p.id] ?? p.condition ?? ""}
                        onChange={e =>
                          setQueueConditions(qc => ({
                            ...qc,
                            [p.id]: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 md:mt-0"
                      onClick={() => {
                        setData(prev => ({
                          ...prev,
                          waitingPatients: [
                            ...prev.waitingPatients,
                            {
                              id: p.id,
                              name: p.name,
                              age: p.age,
                              condition: queueConditions[p.id] ?? p.condition ?? "",
                              priority: "normal",
                              waitTime: "0 min",
                              arrivedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            },
                          ],
                        }))
                        setQueueDialogOpen(false)
                        setQueueConditions(qc => {
                          const copy = { ...qc }
                          delete copy[p.id]
                          return copy
                        })
                      }}
                    >
                      Add
                    </Button>
                  </Card>
                ))}
              {patients.filter(
                p =>
                  (p.name?.toLowerCase().includes(queueSearch.toLowerCase()) ||
                    p.mobile?.includes(queueSearch) ||
                    p.condition?.toLowerCase().includes(queueSearch.toLowerCase())) &&
                  !data.waitingPatients.some(wp => wp.id === p.id)
              ).length === 0 && (
                <div className="text-center text-muted-foreground py-4">No patients found.</div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQueueDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}
