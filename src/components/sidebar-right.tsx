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
import PatientStepperDialog from "@/pages/patients/patient-stepper-dialog"
import { fetchPatients, addPatient, fetchPatientById, addDoctorNote, addProcedure } from "@/lib/api"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { DentalFormula } from "@/components/dental-formula"

const PATIENTS_STORAGE_KEY = "fractal-ehrs-patients"
const QUEUE_STORAGE_KEY = "fractal-ehrs-queue"

const PROCEDURE_ROOMS = ["Room 1", "Room 2", "Room 3", "Room 4"];

const getStoredProcedures = () => {
  try {
    const stored = localStorage.getItem('fractal-ehrs-procedures');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

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
    return stored ? JSON.parse(stored) : { waitingPatients: [], inConsultation: [] }
  } catch {
    return { waitingPatients: [], inConsultation: [] }
  }
}
function saveQueue(data: any) {
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(data))
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
  onShowInfo,
  onStartProcedure,
  renderExtra,
  onFinishProcedure,
}: {
  patient: any
  status: "waiting" | "consulting" | "procedure"
  onRemoveFromQueue?: () => void
  onStartConsultation?: () => void
  dragHandle?: React.ReactNode
  onShowInfo?: () => void
  onStartProcedure?: () => void
  renderExtra?: () => React.ReactNode
  onFinishProcedure?: (patient: any) => void
}) {
  const { user } = useAuth();
  return (
    <Card className="mb-2 last:mb-0 shadow-none border-muted bg-background/80 h-[90px] -mt-2 hover:bg-background/40 transition-colors">
      <CardHeader className="flex flex-row items-center gap-2 -mt-4 pb-1">
        
        <User className="h-6 w-6 text-muted-foreground" />
        <CardTitle className="flex-1 text-base font-semibold truncate">
          {patient.name}
        </CardTitle>
        {dragHandle}
        {status === "waiting" ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 ml-1 text-muted-foreground">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onShowInfo}>View Details</DropdownMenuItem>
                {(user && (user.role === "admin" || user.role === "doctor" || user.role === "assistant")) && (
                  <DropdownMenuItem onClick={onStartConsultation}>Start Consultation</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onRemoveFromQueue} variant="destructive">Remove from Queue</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          </>
        ) : status === "consulting" ? (
          <>
            {user && (user.role === "admin" || user.role === "doctor") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 ml-1 text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onShowInfo}>Consultation Details</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStartProcedure(patient)}>Start Procedure</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Badge variant="outline" className="ml-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              In Consultation
            </Badge>
          </>
        ) : status === "procedure" ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 ml-1 text-muted-foreground">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onShowInfo}>
                  Add Notes
                </DropdownMenuItem>
                {onFinishProcedure && (
                  <DropdownMenuItem onClick={() => onFinishProcedure(patient)}>
                    Finish Procedure
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onRemoveFromQueue} variant="destructive">Remove from Procedure Queue</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-3 -mt-6">
        {status === "procedure" ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Dr. {patient.doctor}</span>
            <span>•</span>
            <span>{patient.procedureRoom}</span>
            <span>•</span>
            <span>{patient.procedureType}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {status === "waiting" ? (
                <>
                  <span>Arrived: {patient.arrivedAt}</span>
                  <span>•</span>
                  <span>Wait: {patient.waitTime}</span>
                </>
              ) : status === "consulting" ? (
                <>
                  <span>Started: {patient.startedAt}</span>
                  <span>•</span>
                  <span>{patient.estimatedDuration} left</span>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {status === "waiting" ? (
                <>
                  <span>Age: {patient.age}</span>
                  <span>•</span>
                  <span>{patient.condition}</span>
                </>
              ) : status === "consulting" ? (
                <>
                  <span>{patient.doctor}</span>
                  <span>•</span>
                  <span>{patient.room}</span>
                  <span>•</span>
                  <span>{patient.condition}</span>
                </>
              ) : null}
            </div>
            {renderExtra && renderExtra()}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function SidebarRight({
  onShowRegister,
  ...props
}: React.ComponentProps<typeof Sidebar> & { onShowRegister?: () => void }) {
  const { user } = useAuth();
  const [data, setData] = React.useState<any>(getStoredQueue())
  const [patients, setPatients] = React.useState<any[]>([])
  const [queueDialogOpen, setQueueDialogOpen] = React.useState(false)
  const [queueSearch, setQueueSearch] = React.useState("")
  const [queueConditions, setQueueConditions] = React.useState<{ [id: string]: string }>({})

  // --- Consultation dialog state (move here from PatientCard) ---
  const [consultDialogOpen, setConsultDialogOpen] = React.useState(false);
  const [consultPatient, setConsultPatient] = React.useState<any>(null);
  const [consultLoading, setConsultLoading] = React.useState(false);
  const [consultAnamnesis, setConsultAnamnesis] = React.useState("");
  const [consultBilling, setConsultBilling] = React.useState<any[]>([]);
  const [consultTab, setConsultTab] = React.useState("info");
  const consultTimelineRef = React.useRef(null);

  const [procedureDialogOpen, setProcedureDialogOpen] = React.useState(false);
  const [procedureDialogPatient, setProcedureDialogPatient] = React.useState<any>(null);
  const [procedureRoom, setProcedureRoom] = React.useState("");
  const [procedureType, setProcedureType] = React.useState("");

  const [finishProcedureDialogOpen, setFinishProcedureDialogOpen] = React.useState(false);
  const [finishProcedurePatient, setFinishProcedurePatient] = React.useState<any>(null);
  const [finishProcedureData, setFinishProcedureData] = React.useState({
    date: new Date().toISOString().slice(0, 10),
    procedure: "",
    charges: "",
    paid: "",
    discount: "",
  });

  const [procedureQueue, setProcedureQueue] = React.useState<any[]>([]);
  const [procedureOptions, setProcedureOptions] = React.useState([]);

  React.useEffect(() => {
    setProcedureOptions(getStoredProcedures());
  }, []);

  // Add state for previous balance
  const [finishProcedurePreviousBalance, setFinishProcedurePreviousBalance] = React.useState(0);

  const charge = parseFloat(finishProcedureData.charges) || 0;
  const discount = parseFloat(finishProcedureData.discount) || 0;
  const paid = parseFloat(finishProcedureData.paid) || 0;
  const newBalance = finishProcedurePreviousBalance + (charge - discount) - paid;

  // Add state for info dialog edit notes
  const [infoDialogEditNotes, setInfoDialogEditNotes] = React.useState(false);

  async function openConsultDialog(patientId: string) {
    setConsultLoading(true);
    try {
      const fullPatient = await fetchPatientById(patientId);
      setConsultPatient(fullPatient);
      setConsultAnamnesis((fullPatient.doctorsNotes && fullPatient.doctorsNotes[0] && fullPatient.doctorsNotes[0].length > 0)
        ? fullPatient.doctorsNotes[0][fullPatient.doctorsNotes[0].length - 1].note
        : "");
      setConsultBilling(fullPatient.procedures && fullPatient.procedures[0] ? fullPatient.procedures[0] : []);
      setConsultDialogOpen(true);
    } finally {
      setConsultLoading(false);
    }
  }

  async function handleConsultSaveAnamnesis() {
    if (!consultPatient) return;
    setConsultLoading(true);
    try {
      await addDoctorNote(consultPatient.id, {
        date: new Date().toISOString().slice(0, 10),
        note: consultAnamnesis
      });
      const fullPatient = await fetchPatientById(consultPatient.id);
      setConsultPatient(fullPatient);
      setConsultAnamnesis(""); // Clear the input after saving
    } finally {
      setConsultLoading(false);
    }
  }

  React.useEffect(() => {
    saveQueue(data)
  }, [data])

  React.useEffect(() => {
    fetchPatients().then(setPatients);
  }, []);

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

  async function handlePatientAdded(newPatient) {
    // Map 'mobile' to 'phone' for API compatibility
    const patientForApi = { ...newPatient, phone: newPatient.mobile || newPatient.phone };
    await addPatient(patientForApi);
    const updated = await fetchPatients();
    setPatients(updated);
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

  // Add state for patient info dialog
  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);
  const [infoPatient, setInfoPatient] = React.useState<any>(null);
  const [infoLoading, setInfoLoading] = React.useState(false);
  const [infoAnamnesis, setInfoAnamnesis] = React.useState("");
  const [infoBilling, setInfoBilling] = React.useState<any[]>([]);
  const [infoTab, setInfoTab] = React.useState("info");
  const infoTimelineRef = React.useRef(null);

  async function openInfoDialog(patientId: string, edit: boolean) {
    setInfoLoading(true);
    try {
      const fullPatient = await fetchPatientById(patientId);
      setInfoPatient(fullPatient);
      setInfoAnamnesis((fullPatient.doctorsNotes && fullPatient.doctorsNotes[0] && fullPatient.doctorsNotes[0].length > 0)
        ? fullPatient.doctorsNotes[0][fullPatient.doctorsNotes[0].length - 1].note
        : "");
      setInfoBilling(fullPatient.procedures && fullPatient.procedures[0] ? fullPatient.procedures[0] : []);
      setInfoDialogOpen(true);
    } finally {
      setInfoLoading(false);
    }
  }

  async function handleInfoSaveAnamnesis() {
    if (!infoPatient) return;
    setInfoLoading(true);
    try {
      await addDoctorNote(infoPatient.id, {
        date: new Date().toISOString().slice(0, 10),
        note: infoAnamnesis
      });
      const fullPatient = await fetchPatientById(infoPatient.id);
      setInfoPatient(fullPatient);
      setInfoAnamnesis(""); // Clear the input after saving
    } finally {
      setInfoLoading(false);
    }
  }

  function handleStartProcedure(patient: any) {
    openProcedureDialog(patient);
  }

  function openProcedureDialog(patient: any) {
    setProcedureOptions(getStoredProcedures());
    setProcedureDialogPatient(patient);
    setProcedureRoom("");
    setProcedureType("");
    setProcedureDialogOpen(true);
  }

  async function handleConfirmProcedure() {
    if (!procedureDialogPatient || !procedureRoom || !procedureType) return;
    setProcedureQueue(prev => [
      ...prev,
      {
        ...procedureDialogPatient,
        procedureRoom,
        procedureType,
        doctor: user?.name || "Unknown",
      },
    ]);
    // Remove from inConsultation
    setData(prev => ({
      ...prev,
      inConsultation: prev.inConsultation.filter((p: any) => p.id !== procedureDialogPatient.id),
    }));
    // Add doctor note for procedure start
    await addDoctorNote(procedureDialogPatient.id, {
      date: new Date().toISOString().slice(0, 10),
      note: `Started procedure: ${procedureType} with Dr ${user?.name || "Unknown"}`,
    });
    setProcedureDialogOpen(false);
    setConsultDialogOpen(false);
  }

  async function handleOpenFinishProcedure(patient) {
    const fullPatient = await fetchPatientById(patient.id);
    const billing = fullPatient.procedures && fullPatient.procedures[0] ? fullPatient.procedures[0] : [];
    const prevBalance = billing.length > 0 ? parseFloat(billing[billing.length - 1].balance) || 0 : 0;
    setFinishProcedurePreviousBalance(prevBalance);
    setFinishProcedurePatient(patient);
    setFinishProcedureData({
      date: new Date().toISOString().slice(0, 10),
      procedure: patient.procedureType || "",
      charges: patient.procedureType ? (procedureOptions.find(opt => opt.value === patient.procedureType)?.cost || "") : "",
      paid: "",
      discount: "",
    });
    setFinishProcedureDialogOpen(true);
  }

  function handleFinishProcedureChange(field, value) {
    if (field === "procedure") {
      const selected = procedureOptions.find(opt => opt.value === value);
      setFinishProcedureData(d => ({
        ...d,
        procedure: value,
        charges: selected ? selected.cost : "",
        discount: "",
        paid: "",
      }));
    } else {
      setFinishProcedureData(d => ({ ...d, [field]: value }));
    }
  }

  async function handleSaveFinishProcedure() {
    if (!finishProcedurePatient) return;
    await addProcedure(finishProcedurePatient.id, {
      ...finishProcedureData,
      balance: (Number(finishProcedureData.charges) - Number(finishProcedureData.paid || 0) - Number(finishProcedureData.discount || 0)).toString(),
    });
    setProcedureQueue(prev => prev.filter(p => p.id !== finishProcedurePatient.id));
    setFinishProcedureDialogOpen(false);
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
                  onShowInfo={() => openConsultDialog(patient.id)}
                  onStartProcedure={handleStartProcedure}
                />
              ))}
            </div>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4" />
              <span className="font-semibold">Procedure Queue</span>
              <Badge variant="secondary">{procedureQueue.length}</Badge>
            </SidebarGroupLabel>
            <div>
              {procedureQueue.length === 0 && (
                <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                  No patients in procedure queue.
                </div>
              )}
              {procedureQueue.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  status="procedure"
                  onRemoveFromQueue={() => setProcedureQueue(prev => prev.filter(p => p.id !== patient.id))}
                  onFinishProcedure={handleOpenFinishProcedure}
                  onShowInfo={() => openInfoDialog(patient.id, true)}
                />
              ))}
            </div>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>

      <SidebarFooter className="border-t p-3 sticky bottom-0 bg-background flex flex-col gap-2">
        <Button className="w-full h-10 text-base" variant="default" onClick={() => setQueueDialogOpen(true)}>
          <Plus className="mr-2 h-5 w-5" />
          Add Patient to Queue
        </Button>
      </SidebarFooter>

      {/* Multi-step Patient Registration Dialog */}
      {/* <PatientStepperDialog
        open={queueDialogOpen}
        onOpenChange={setQueueDialogOpen}
        onPatientAdded={handlePatientAdded}
      /> */}

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
                        }));
                        setQueueDialogOpen(false);
                        setQueueConditions(qc => {
                          const copy = { ...qc };
                          delete copy[p.id];
                          return copy;
                        });
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

      {/* Consultation Dialog */}
      <Dialog open={consultDialogOpen} onOpenChange={setConsultDialogOpen}>
        <DialogContent className="w-[98vw] max-w-screen-2xl max-h-[90vh] p-0 overflow-x-auto overflow-y-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Consultation Session</DialogTitle>
          </DialogHeader>
          {consultPatient && (
            <Tabs value={consultTab} onValueChange={setConsultTab} className="w-full px-6 pb-2">
              <TabsList className="mb-4">
                <TabsTrigger value="info">Info & Doctor Notes</TabsTrigger>
                <TabsTrigger value="billing">Billing History</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Add Start Procedure button at the top right for admin/doctor */}
                  {user && (user.role === "admin" || user.role === "doctor") && (
                    <div className="absolute right-8 top-8 z-10">
                      <Button className="mb-2" onClick={() => openProcedureDialog(consultPatient)}>
                        Start Procedure
                      </Button>
                    </div>
                  )}
{/* (removed erroneous import statements here) */}

                  {/* Patient Details */}
                  <div className="flex-1 min-w-[280px] max-w-md">
                    <Card className="bg-muted/60 border border-muted-foreground/10 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg tracking-tight">Patient Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                          <dt className="font-semibold text-muted-foreground">Name:</dt>
                          <dd>{consultPatient.name}</dd>
                          <dt className="font-semibold text-muted-foreground">Age:</dt>
                          <dd>{consultPatient.age}</dd>
                          <dt className="font-semibold text-muted-foreground">Sex:</dt>
                          <dd>{consultPatient.sex || consultPatient.gender}</dd>
                          <dt className="font-semibold text-muted-foreground">Mobile:</dt>
                          <dd>{consultPatient.phone || consultPatient.mobile}</dd>
                          <dt className="font-semibold text-muted-foreground">Condition:</dt>
                          <dd>{consultPatient.condition}</dd>
                          <dt className="font-semibold text-muted-foreground">Status:</dt>
                          <dd>{consultPatient.status}</dd>
                          <dt className="font-semibold text-muted-foreground">Last Visit:</dt>
                          <dd>{consultPatient.lastVisit || consultPatient.date}</dd>
                        </dl>
                      </CardContent>
                    </Card>
                    <DentalFormula
                      initialFormula={consultPatient.dentalFormula}
                      onFormulaChange={(newFormula) => {
                        const updatedPatient = { ...consultPatient, dentalFormula: newFormula };
                        setConsultPatient(updatedPatient);
                        updatePatient(consultPatient.id, { dentalFormula: newFormula });
                      }}
                    />
                  </div>
                  {/* Doctor Notes Timeline */}
                  <Card className="flex-[2] min-w-[340px] flex flex-col bg-background border border-primary/10 shadow-md relative p-2">
                    <CardHeader>
                      <CardTitle className="text-lg tracking-tight">Doctor Notes Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-2 p-0">
                      {/* Add Note Input */}
                      <div className="border-b pb-3 mb-3 bg-card sticky top-0 z-20">
                        <div className="flex gap-2 items-end">
                          <Textarea
                            className="flex-1"
                            value={consultAnamnesis}
                            rows={2}
                            onChange={e => setConsultAnamnesis(e.target.value)}
                            placeholder="Add a new doctor note..."
                          />
                          <Button size="sm" onClick={handleConsultSaveAnamnesis} disabled={consultLoading || !consultAnamnesis.trim()}>
                            Add Note
                          </Button>
                        </div>
                      </div>
                      <ScrollArea className="max-h-[50vh] pr-2" viewportRef={consultTimelineRef}>
                        <div className="relative flex flex-col gap-6 pl-6 pb-6">
                          {/* Vertical timeline line */}
                          <div className="absolute left-2 top-0 bottom-0 w-1 bg-primary/10 rounded-full" style={{zIndex:0}} />
                          {user && (user.role === "admin" || user.role === "doctor") && (
                            <div className="relative flex gap-4 items-start z-10 pt-4">
                              {/* Timeline dot */}
                              <div className="flex flex-col items-center">
                                <Avatar className="ring-2 ring-primary bg-primary/10">
                                  <AvatarFallback>
                                    <span>+</span>
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-1 flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="default">{new Date().toLocaleDateString()}</Badge>
                                  <span className="text-xs text-muted-foreground">Action</span>
                                </div>
                                <Button
                                  size="sm"
                                  className="w-fit"
                                  onClick={() => openProcedureDialog(consultPatient)}
                                >
                                  Start Procedure
                                </Button>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Start a new procedure for this patient at this point in the consultation.
                                </div>
                              </div>
                            </div>
                          )}
                          {(consultPatient.doctorsNotes && consultPatient.doctorsNotes[0] && consultPatient.doctorsNotes[0].length > 0) ? (
                            Object.entries(consultPatient.doctorsNotes[0].reduce((acc, note) => {
                              const date = note.date;
                              if (!acc[date]) {
                                acc[date] = [];
                              }
                              acc[date].push(note);
                              return acc;
                            }, {})).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                              .map(([date, notesForDay]) => (
                                <div key={date} className="relative flex flex-col gap-3 pl-6 pb-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="default">{date}</Badge>
                                  </div>
                                  {notesForDay.sort((a, b) => {
                                    const timestampA = new Date(a.timestamp).getTime();
                                    const timestampB = new Date(b.timestamp).getTime();
                                    return timestampB - timestampA;
                                  }).map((note, idx, arr) => (
                                    <div
                                      key={note.timestamp || idx}
                                      className="relative flex gap-2 items-start z-10"
                                    >
                                      {/* Timeline dot */}
                                      <div className="flex flex-col items-center">
                                        <Avatar className={idx === 0 ? 'ring-2 ring-primary' : ''}>
                                          <AvatarFallback>{(consultPatient.name || 'D')[0]}</AvatarFallback>
                                        </Avatar>
                                        {idx < arr.length - 1 && <span className="w-1 h-8 bg-primary/20 mt-1 mb-1 rounded-full" />}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">{new Date(note.timestamp).toLocaleTimeString()}</span>
                                          <span className="text-xs text-muted-foreground">Doctor</span>
                                        </div>
                                        <div className={"whitespace-pre-line text-base leading-relaxed " + (idx === 0 ? 'font-semibold' : '')}>{note.note}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ))
                          ) : (
                            <div className="text-muted-foreground text-sm">No notes yet.</div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Billing History</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto p-2">
                    <ScrollArea className="max-h-[320px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Procedure</TableHead>
                            <TableHead>Charges</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {consultBilling.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No billing records.
                              </TableCell>
                            </TableRow>
                          ) : (
                            [...consultBilling].reverse().map((b, i) => (
                              <TableRow key={i}>
                                <TableCell>{b.date}</TableCell>
                                <TableCell>{b.procedure}</TableCell>
                                <TableCell>{b.charges}</TableCell>
                                <TableCell>{b.paid}</TableCell>
                                <TableCell>{b.balance}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter className="px-6 pb-6 pt-2">
            <Button variant="outline" onClick={() => setConsultDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="w-[98vw] max-w-screen-2xl max-h-[90vh] p-0 overflow-x-auto overflow-y-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Patient Information</DialogTitle>
          </DialogHeader>
          {infoPatient && (
            <Tabs value={infoTab} onValueChange={setInfoTab} className="w-full px-6 pb-2">
              <TabsList className="mb-4">
                <TabsTrigger value="info">Info & Doctor Notes</TabsTrigger>
                <TabsTrigger value="billing">Billing History</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Patient Details */}
                  <Card className="flex-1 min-w-[280px] max-w-md bg-muted/60 border border-muted-foreground/10 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg tracking-tight">Patient Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        <dt className="font-semibold text-muted-foreground">Name:</dt>
                        <dd>{infoPatient.name}</dd>
                        <dt className="font-semibold text-muted-foreground">Age:</dt>
                        <dd>{infoPatient.age}</dd>
                        <dt className="font-semibold text-muted-foreground">Sex:</dt>
                        <dd>{infoPatient.sex || infoPatient.gender}</dd>
                        <dt className="font-semibold text-muted-foreground">Mobile:</dt>
                        <dd>{infoPatient.phone || infoPatient.mobile}</dd>
                        <dt className="font-semibold text-muted-foreground">Place of Work:</dt>
                        <dd>{infoPatient.placeOfWork}</dd>
                        <dt className="font-semibold text-muted-foreground">Occupation:</dt>
                        <dd>{infoPatient.occupation}</dd>
                        <dt className="font-semibold text-muted-foreground">Condition:</dt>
                        <dd>{infoPatient.condition}</dd>
                        <dt className="font-semibold text-muted-foreground">Status:</dt>
                        <dd>{infoPatient.status}</dd>
                        <dt className="font-semibold text-muted-foreground">Last Visit:</dt>
                        <dd>{infoPatient.lastVisit || infoPatient.date}</dd>
                      </dl>
                    </CardContent>
                  </Card>
                  {/* Doctor Notes Timeline */}
                  <Card className="flex-[2] min-w-[340px] flex flex-col bg-background border border-primary/10 shadow-md relative p-2">
                    <CardHeader>
                      <CardTitle className="text-lg tracking-tight">Doctor Notes Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-2 p-0">
                      {/* Add Note Input */}
                      <div className="border-b pb-3 mb-3 bg-card sticky top-0 z-20">
                        <div className="flex gap-2 items-end">
                          <Textarea
                            className="flex-1"
                            value={infoAnamnesis}
                            rows={8}
                            onChange={e => setInfoAnamnesis(e.target.value)}
                            placeholder="Procedure Notes:\n\nRX:"
                          />
                          <Button size="sm" onClick={handleInfoSaveAnamnesis} disabled={infoLoading || !infoAnamnesis.trim()}>
                            Add Note
                          </Button>
                        </div>
                      </div>
                      <ScrollArea className="max-h-[50vh] pr-2" viewportRef={infoTimelineRef}>
                        <div className="relative flex flex-col gap-6 pl-6 pb-6">
                          {/* Vertical timeline line */}
                          <div className="absolute left-2 top-0 bottom-0 w-1 bg-primary/10 rounded-full" style={{zIndex:0}} />
                          {(infoPatient.doctorsNotes && infoPatient.doctorsNotes[0] && infoPatient.doctorsNotes[0].length > 0) ? (
                            Object.entries(infoPatient.doctorsNotes[0].reduce((acc, note) => {
                              const date = note.date;
                              if (!acc[date]) {
                                acc[date] = [];
                              }
                              acc[date].push(note);
                              return acc;
                            }, {})).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                              .map(([date, notesForDay]) => (
                                <div key={date} className="relative flex flex-col gap-3 pl-6 pb-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="default">{date}</Badge>
                                  </div>
                                  {notesForDay.sort((a, b) => {
                                    const timestampA = new Date(a.timestamp).getTime();
                                    const timestampB = new Date(b.timestamp).getTime();
                                    return timestampB - timestampA;
                                  }).map((note, idx, arr) => (
                                    <div
                                      key={note.timestamp || idx}
                                      className="relative flex gap-2 items-start z-10"
                                    >
                                      {/* Timeline dot */}
                                      <div className="flex flex-col items-center">
                                        <Avatar className={idx === 0 ? 'ring-2 ring-primary' : ''}>
                                          <AvatarFallback>{(infoPatient.name || 'D')[0]}</AvatarFallback>
                                        </Avatar>
                                        {idx < arr.length - 1 && <span className="w-1 h-8 bg-primary/20 mt-1 mb-1 rounded-full" />}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">{new Date(note.timestamp).toLocaleTimeString()}</span>
                                          <span className="text-xs text-muted-foreground">Doctor</span>
                                        </div>
                                        <div className={"whitespace-pre-line text-base leading-relaxed " + (idx === 0 ? 'font-semibold' : '')}>{note.note}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ))
                          ) : (
                            <div className="text-muted-foreground text-sm">No notes yet.</div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
                {infoDialogEditNotes && infoPatient && (
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setInfoDialogOpen(false);
                        handleOpenFinishProcedure(infoPatient);
                      }}
                    >
                      Finish Procedure
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Billing History</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto p-2">
                    <ScrollArea className="max-h-[320px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Procedure</TableHead>
                            <TableHead>Charges</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {infoBilling.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No billing records.
                              </TableCell>
                            </TableRow>
                          ) : (
                            [...infoBilling].reverse().map((b, i) => (
                              <TableRow key={i}>
                                <TableCell>{b.date}</TableCell>
                                <TableCell>{b.procedure}</TableCell>
                                <TableCell>{b.charges}</TableCell>
                                <TableCell>{b.paid}</TableCell>
                                <TableCell>{b.balance}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter className="px-6 pb-6 pt-2">
            <Button variant="outline" onClick={() => setInfoDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Procedure Dialog */}
      <Dialog open={procedureDialogOpen} onOpenChange={setProcedureDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start Procedure</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div>
              <label className="text-xs font-medium mb-1">Procedure Room/Unit</label>
              <select
                className="w-full border rounded-md px-2 py-2 h-10 text-sm"
                value={procedureRoom}
                onChange={e => setProcedureRoom(e.target.value)}
              >
                <option value="">Select Room</option>
                {PROCEDURE_ROOMS.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1">Procedure</label>
              <select
                className="w-full border rounded-md px-2 py-2 h-10 text-sm"
                value={procedureType}
                onChange={e => setProcedureType(e.target.value)}
              >
                <option value="">Select Procedure</option>
                {procedureOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmProcedure} disabled={!procedureRoom || !procedureType}>
              Confirm
            </Button>
            <Button variant="outline" onClick={() => setProcedureDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Procedure Dialog */}
      <Dialog open={finishProcedureDialogOpen} onOpenChange={setFinishProcedureDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finish Procedure</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <Input
              type="date"
              value={finishProcedureData.date}
              onChange={e => handleFinishProcedureChange("date", e.target.value)}
              placeholder="Date"
            />
            <div>
              <label className="text-xs font-medium mb-1">Procedure</label>
              <select
                className="w-full border rounded-md px-2 py-2 h-10 text-sm"
                value={finishProcedureData.procedure}
                onChange={e => handleFinishProcedureChange("procedure", e.target.value)}
              >
                <option value="">Select Procedure</option>
                {procedureOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <Input
              type="number"
              value={finishProcedureData.charges}
              readOnly
              placeholder="Charges"
            />
            <Input
              type="number"
              value={finishProcedureData.discount}
              onChange={e => handleFinishProcedureChange("discount", e.target.value)}
              placeholder="Discount"
              min="0"
              max={finishProcedureData.charges}
            />
            <Input
              type="number"
              value={finishProcedureData.paid}
              onChange={e => handleFinishProcedureChange("paid", e.target.value)}
              placeholder="Paid"
              min="0"
            />
            <div className="text-xs text-muted-foreground">
              Previous Balance: {finishProcedurePreviousBalance}
            </div>
            <div className="text-xs text-muted-foreground">
              New Balance: {isNaN(newBalance) ? "" : newBalance}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveFinishProcedure} disabled={!finishProcedureData.charges || !finishProcedureData.procedure}>
              Save
            </Button>
            <Button variant="outline" onClick={() => setFinishProcedureDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}
