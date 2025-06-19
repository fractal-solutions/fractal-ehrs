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
  ArrowRight,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar"

// Sample data
const data = {
  user: {
    name: "Dr. Smith",
    email: "dr.smith@hospital.com",
    avatar: "/avatars/doctor.jpg",
  },
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

function PatientCard({
  patient,
  status,
}: {
  patient: any
  status: "waiting" | "consulting"
}) {
  return (
    <Card className="mb-2 last:mb-0 shadow-none border-muted bg-background/80 h-[90px] -mt-2 hover:bg-background/40 transition-colors">
      <CardHeader className="flex flex-row items-center gap-2 -mt-4 pb-1">
        <User className="h-6 w-6 text-muted-foreground" />
        <CardTitle className="flex-1 text-base font-semibold truncate">
          {patient.name}
        </CardTitle>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-1 text-muted-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            {status === "waiting" ? (
              <>
                <DropdownMenuItem>Start Consultation</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
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

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh w-[350px] border-l bg-sidebar/90 backdrop-blur-sm lg:flex"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b  sticky top-0 bg-background">
        <NavUser user={data.user} />
      </SidebarHeader>

      <ScrollArea className="flex-1 px-2 py-2">
        <SidebarContent className="flex flex-col gap-4 h-[80vh]">
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
              {data.waitingPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  status="waiting"
                />
              ))}
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

      <SidebarFooter className="border-t p-3 sticky bottom-0 bg-background">
        <Button className="w-full h-10 text-base" variant="default">
          <Plus className="mr-2 h-5 w-5" />
          Add New Patient
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
