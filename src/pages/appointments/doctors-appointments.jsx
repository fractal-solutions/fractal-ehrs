import React from "react"
import { useState, useEffect, useRef } from "react"
import { format, setHours, setMinutes, addMinutes, isWithinInterval } from "date-fns"
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core"

import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const APPOINTMENTS_STORAGE_KEY = "fractal-ehrs-appointments"
const PATIENTS_STORAGE_KEY = "fractal-ehrs-patients"
const doctors = [
  { id: "dr-andrews", name: "Dr. Andrews" },
  { id: "dr-martinez", name: "Dr. Martinez" },
  { id: "dr-smith", name: "Dr. Smith" },
]

const START_HOUR = 7
const END_HOUR = 19
const SLOT_MINUTES = 15

function getStoredPatients() {
  try {
    const stored = localStorage.getItem(PATIENTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function generateTimeSlots(startHour, endHour, slotMinutes) {
  const slots = []
  let current = setMinutes(setHours(new Date(), startHour), 0)
  const end = setMinutes(setHours(new Date(), endHour), 0)
  while (current < end) {
    slots.push(current)
    current = addMinutes(current, slotMinutes)
  }
  return slots
}

const initialAppointments = {
  "dr-andrews": [
    { time: "08:00", patient: "John Doe", status: "confirmed", date: format(new Date(), "yyyy-MM-dd"), duration: 30, description: "Checkup" },
    { time: "09:00", patient: "Jane Smith", status: "pending", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "Consultation" },
    { time: "10:30", patient: "Tom Brown", status: "cancelled", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "Dental exam" },
    { time: "11:45", patient: "Sarah Lee", status: "confirmed", date: format(new Date(), "yyyy-MM-dd"), duration: 30, description: "Surgery" },
    { time: "13:00", patient: "Michael Davis", status: "pending", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "General checkup" },
    { time: "14:15", patient: "Emily Johnson", status: "confirmed", date: format(new Date(), "yyyy-MM-dd"), duration: 30, description: "Obstetrics" },
    { time: "15:30", patient: "William Taylor", status: "pending", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "Cardiology" },
  ],
  "dr-martinez": [
    { time: "08:30", patient: "Sarah Wilson", status: "confirmed", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "Flu symptoms" },
    { time: "09:15", patient: "John Doe", status: "pending", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "General checkup" },
    { time: "10:00", patient: "Jane Smith", status: "confirmed", date: format(new Date(), "yyyy-MM-dd"), duration: 30, description: "Surgery" },
    { time: "11:15", patient: "Michael Davis", status: "pending", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "Obstetrics" },
    { time: "12:30", patient: "Emily Johnson", status: "confirmed", date: format(new Date(), "yyyy-MM-dd"), duration: 30, description: "Cardiology" },
    { time: "13:45", patient: "William Taylor", status: "pending", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "Dental exam" },
    { time: "15:00", patient: "Tom Brown", status: "cancelled", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "General checkup" },
  ],
  "dr-smith": [
    { time: "09:00", patient: "Emily Clark", status: "pending", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "Follow-up" },
    { time: "10:15", patient: "Sarah Lee", status: "confirmed", date: format(new Date(), "yyyy-MM-dd"), duration: 30, description: "Surgery" },
    { time: "11:30", patient: "John Doe", status: "pending", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "Obstetrics" },
    { time: "12:45", patient: "Michael Davis", status: "confirmed", date: format(new Date(), "yyyy-MM-dd"), duration: 30, description: "Cardiology" },
    { time: "14:00", patient: "William Taylor", status: "pending", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "Dental exam" },
    { time: "15:15", patient: "Jane Smith", status: "confirmed", date: format(new Date(), "yyyy-MM-dd"), duration: 30, description: "General checkup" },
  ],
}

function statusColor(status) {
  switch (status) {
    case "confirmed":
      return "default"
    case "pending":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "secondary"
  }
}

function getSlotEnd(slot, duration) {
  return addMinutes(slot, duration)
}

const bookingColors = [
  "bg-[#bfcad6]", // dull blue-gray
  "bg-[#d6cfc2]", // dull beige
  "bg-[#c2d6c3]", // dull green
  "bg-[#d6c2c2]", // dull pink
  "bg-[#d6d3c2]", // dull yellow
  "bg-[#c2d6d6]", // dull teal
  "bg-[#d6c2d3]", // dull purple
]

function getBookingColor(booking, doctorId) {
  // Use doctorId or patient name for color assignment
  // For more variety, you can hash patient name or combine doctorId+time
  const idx = doctorId
    ? doctors.findIndex(d => d.id === doctorId)
    : 0
  // Optionally, use patient name for more variety:
  // const idx = booking.patient ? booking.patient.charCodeAt(0) % bookingColors.length : 0
  return bookingColors[idx % bookingColors.length]
}

export default function Appointments() {
  const [selected, setSelected] = useState(new Date())
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialAppointments;
  });
  const [dialogOpen, setDialogOpen] = useState(false)
  const [removeDialog, setRemoveDialog] = useState({ open: false, booking: null, doctorId: null })
  const [bookingSlot, setBookingSlot] = useState(null)
  const [bookingDoctor, setBookingDoctor] = useState(null)
  const [patientName, setPatientName] = useState("")
  const [duration, setDuration] = useState(15)
  const [description, setDescription] = useState("")

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editBooking, setEditBooking] = useState(null)
  const [editDoctorId, setEditDoctorId] = useState(null)
  const [editPatientName, setEditPatientName] = useState("")
  const [editDuration, setEditDuration] = useState(15)
  const [editDescription, setEditDescription] = useState("")
  const [editStatus, setEditStatus] = useState("pending")

  const [selectedTab, setSelectedTab] = useState("timeline")

  const slots = generateTimeSlots(START_HOUR, END_HOUR, SLOT_MINUTES)
  const selectedDateStr = format(selected && selected instanceof Date && !isNaN(selected) ? selected : new Date(), "yyyy-MM-dd")
  const [scrollKey, setScrollKey] = useState(0)
  const [activeDrag, setActiveDrag] = useState(null)
  const [patients, setPatients] = useState(getStoredPatients())
  const [patientSearch, setPatientSearch] = useState("")

  // Find a booking that covers this slot (including multi-slot bookings)
  function getBookingForSlot(doctorId, slot) {
    return (appointments[doctorId] || []).find(
      (appt) => {
        if (appt.date !== selectedDateStr) return false
        const [h, m] = appt.time.split(":").map(Number)
        const bookingStart = setMinutes(setHours(selected, h), m)
        const bookingEnd = addMinutes(bookingStart, appt.duration || 15)
        return isWithinInterval(slot, { start: bookingStart, end: addMinutes(bookingEnd, -1) })
      }
    )
  }

  // Check if a slot is the start of a booking
  function isBookingStart(doctorId, slot) {
    const booking = getBookingForSlot(doctorId, slot)
    if (!booking) return false
    return booking.time === format(slot, "HH:mm")
  }

  // Check if the slot range is available (no overlap)
  function isSlotRangeAvailable(doctorId, slot, duration, excludeBooking = null) {
    const slotStart = slot
    const slotEnd = addMinutes(slot, duration)
    return !(appointments[doctorId] || []).some(appt => {
        if (appt.date !== selectedDateStr) return false
        if (excludeBooking && appt === excludeBooking) return false
        const [h, m] = appt.time.split(":").map(Number)
        const apptStart = setMinutes(setHours(selected, h), m)
        const apptEnd = addMinutes(apptStart, appt.duration || 15)
        return (slotStart < apptEnd && slotEnd > apptStart)
    })
  }

  function handleDialogOpen(doctorId, slot) {
    setBookingDoctor(doctorId)
    setBookingSlot(slot)
    setPatientName("")
    setDuration(15)
    setDescription("")
    setDialogOpen(true)
  }

  function handleDialogClose() {
    setDialogOpen(false)
    setBookingDoctor(null)
    setBookingSlot(null)
    setPatientName("")
    setDuration(15)
    setDescription("")
  }

  function handleAddBooking() {
    if (!patientName.trim() || !duration || !isSlotRangeAvailable(bookingDoctor, bookingSlot, duration)) return
    setAppointments((prev) => ({
      ...prev,
      [bookingDoctor]: [
        ...(prev[bookingDoctor] || []),
        {
          time: format(bookingSlot, "HH:mm"),
          patient: patientName.trim(),
          status: "pending",
          date: selectedDateStr,
          duration,
          description: description.trim(),
        },
      ],
    }))
    handleDialogClose()
  }

  function handleRemoveBooking(doctorId, booking) {
    console.log("Removing booking:", booking)
    setAppointments((prev) => ({
        ...prev,
        [doctorId]: (prev[doctorId] || []).filter(
        (appt) =>
            !(
            appt.time === booking.time &&
            appt.date === booking.date &&
            appt.patient === booking.patient
            )
        ),
    }))
    setRemoveDialog({ open: false, booking: null, doctorId: null })
    }

    function handleEditBookingOpen(doctorId, booking) {
        setEditDoctorId(doctorId)
        setEditBooking(booking)
        setEditPatientName(booking.patient)
        setEditDuration(booking.duration)
        setEditDescription(booking.description)
        setEditStatus(booking.status)
        setEditDialogOpen(true)
    }

    function handleEditBookingClose() {
        setEditDialogOpen(false)
        setEditBooking(null)
        setEditDoctorId(null)
        setEditPatientName("")
        setEditDuration(15)
        setEditDescription("")
        setEditStatus("pending")
    }

    function handleEditBookingSave() {
        if (!editPatientName.trim() || !editDuration || !editBooking) return
        // Check for overlap (excluding this booking)
        const slot = setMinutes(setHours(selected, Number(editBooking.time.split(":")[0])), Number(editBooking.time.split(":")[1]))
        if (!isSlotRangeAvailable(editDoctorId, slot, editDuration, editBooking)) return
        setAppointments((prev) => ({
        ...prev,
        [editDoctorId]: (prev[editDoctorId] || []).map(appt =>
            appt === editBooking
            ? {
                ...appt,
                patient: editPatientName.trim(),
                duration: editDuration,
                description: editDescription.trim(),
                status: editStatus,
                }
            : appt
        ),
        }))
        handleEditBookingClose()
    }

    // Find the slot closest to now (rounded down)
    function getCurrentSlot(slots) {
        const now = new Date()
        const nowMinutes = now.getHours() * 60 + now.getMinutes()
        let closest = slots[0]
        let closestDiff = Math.abs((closest.getHours() * 60 + closest.getMinutes()) - nowMinutes)
        for (const slot of slots) {
        const slotMinutes = slot.getHours() * 60 + slot.getMinutes()
        const diff = nowMinutes - slotMinutes
        if (diff >= 0 && diff < closestDiff) {
            closest = slot
            closestDiff = diff
        }
        }
        return closest
    }
    const currentSlot = getCurrentSlot(slots)
    const slotRefs = useRef({})

    // Scroll to current slot on mount or when selected date/tab changes
    useEffect(() => {
        setScrollKey(prev => prev + 1);
    }, [selected, selectedTab]);

    useEffect(() => {
        // Timeout ensures refs are set after DOM update
        setTimeout(() => {
            const ref = slotRefs.current[format(currentSlot, "HH:mm")];
            if (ref && ref.scrollIntoView) {
            ref.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 0);
        // eslint-disable-next-line
    }, [scrollKey]);

    // Save to localStorage whenever appointments change:
    useEffect(() => {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    }, [appointments]);

  // Drag-and-drop logic
  function handleDragEnd(event) {
    setActiveDrag(null)
    const { active, over } = event
    if (!active || !over) return
    const [fromDoctor, fromTime] = active.id.split("|")
    const [toDoctor, toTime] = over.id.split("|")
    if (fromDoctor === toDoctor && fromTime === toTime) return

    // Find the booking
    const booking = (appointments[fromDoctor] || []).find(b => b.time === fromTime && b.date === selectedDateStr)
    if (!booking) return

    // Check if new slot is available
    const slot = setMinutes(setHours(selected, Number(toTime.split(":")[0])), Number(toTime.split(":")[1]))
    if (!isSlotRangeAvailable(toDoctor, slot, booking.duration)) return

    // Remove from old doctor, add to new
    setAppointments(prev => {
      const updated = { ...prev }
      updated[fromDoctor] = (updated[fromDoctor] || []).filter(b => !(b.time === fromTime && b.date === selectedDateStr))
      updated[toDoctor] = [
        ...(updated[toDoctor] || []),
        { ...booking, time: toTime }
      ]
      return updated
    })
  }

  // Render
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Calendar Section */}
      <div className="md:w-1/4 min-w-[420px]">
        <h3 className="mx-2 scroll-m-20 text-2xl font-semibold tracking-tight">Appointments</h3>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          className="rounded-lg border shadow-sm scale-100 m-1 mt-7 w-full"
        />
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-x-auto">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            {doctors.map(doc => (
              <TabsTrigger key={doc.id} value={doc.id}>{doc.name}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="timeline">
            <ScrollArea key={scrollKey} className="h-[calc(100vh-160px)] rounded-lg border bg-background shadow-inner">
              <DndContext onDragStart={event => setActiveDrag(event.active.id)} onDragEnd={handleDragEnd}>
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `100px repeat(${doctors.length}, minmax(180px,1fr))`,
                    minWidth: 100 + doctors.length * 180,
                  }}
                >
                  {/* Header */}
                  <div />
                  {doctors.map(doc => (
                    <div key={doc.id} className="font-bold text-center py-2 bg-muted sticky top-0 z-10 border-b border-r">
                      {doc.name}
                    </div>
                  ))}
                  {/* Time slots and bookings */}
                  {slots.map((slot, rowIdx) => {
                    const slotKey = format(slot, "HH:mm")
                    return (
                        <React.Fragment key={rowIdx}>
                        {/* Time column */}
                        <div
                          ref={el => {
                            if (slotKey === format(currentSlot, "HH:mm")) {
                              slotRefs.current[slotKey] = el
                            }
                          }}
                          className="text-right pr-2 py-1 text-xs bg-background sticky left-0 z-10 border-b border-r font-mono"
                        >
                            {format(slot, "hh:mm a")}
                        </div>
                        {doctors.map((doc, colIdx) => {
                            const booking = getBookingForSlot(doc.id, slot)
                            if (booking && !isBookingStart(doc.id, slot)) {
                              return <div key={colIdx} style={{ height: 0 }} />
                            }
                            if (booking) {
                              const slotCount = (booking.duration || 15) / SLOT_MINUTES
                              const height = slotCount * 48
                              return (
                                <DroppableSlot key={colIdx} id={`${doc.id}|${format(slot, "HH:mm")}`}>
                                  <DraggableBooking
                                    id={`${doc.id}|${booking.time}`}
                                    booking={booking}
                                    onRemove={() => handleRemoveBooking(doc.id, booking)}
                                    onEdit={() => handleEditBookingOpen(doc.id, booking)}
                                    style={{ height }}
                                  />
                                </DroppableSlot>
                              )
                            }
                            return (
                              <DroppableSlot key={colIdx} id={`${doc.id}|${format(slot, "HH:mm")}`}>
                                <div className="flex items-center justify-center h-12 border-b border-r">
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => handleDialogOpen(doc.id, slot)}
                                    disabled={!isSlotRangeAvailable(doc.id, slot, duration)}
                                    className="w-2/3"
                                  >
                                    Book
                                  </Button>
                                </div>
                              </DroppableSlot>
                            )
                        })}
                        </React.Fragment>
                    )
                  })}
                </div>
              </DndContext>
            </ScrollArea>
          </TabsContent>
          {/* Individual Doctor Views */}
          {doctors.map(doc => (
            <TabsContent key={doc.id} value={doc.id}>
                <ScrollArea key={scrollKey} className="h-[calc(100vh-160px)] rounded-lg border bg-background shadow-inner">
                <DndContext onDragStart={event => setActiveDrag(event.active.id)} onDragEnd={handleDragEnd}>
                    <div
                    className="grid"
                    style={{
                        gridTemplateColumns: `100px minmax(180px,1fr)`,
                        minWidth: 280,
                    }}
                    >
                    {/* Header */}
                    <div />
                    <div className="font-bold text-center py-2 bg-muted sticky top-0 z-10 border-b border-r">
                        {doc.name}
                    </div>
                    {/* Time slots and bookings */}
                    {slots.map((slot, rowIdx) => {
                      const slotKey = format(slot, "HH:mm")
                      return (
                        <React.Fragment key={rowIdx}>
                        {/* Time column */}
                        <div
                          ref={el => {
                            if (slotKey === format(currentSlot, "HH:mm")) {
                              slotRefs.current[slotKey] = el
                            }
                          }}
                          className="text-right pr-2 py-1 text-xs bg-background sticky left-0 z-10 border-b border-r font-mono"
                        >
                            {format(slot, "hh:mm a")}
                        </div>
                        {/* Doctor's column */}
                        {(() => {
                            const booking = getBookingForSlot(doc.id, slot)
                            if (booking && !isBookingStart(doc.id, slot)) {
                              return <div style={{ height: 0 }} />
                            }
                            if (booking) {
                              const slotCount = (booking.duration || 15) / SLOT_MINUTES
                              const height = slotCount * 48
                              return (
                                <DroppableSlot id={`${doc.id}|${format(slot, "HH:mm")}`}>
                                  <DraggableBooking
                                    id={`${doc.id}|${booking.time}`}
                                    booking={booking}
                                    onRemove={() => handleRemoveBooking(doc.id, booking)}
                                    onEdit={() => handleEditBookingOpen(doc.id, booking)}
                                    style={{ height }}
                                  />
                                </DroppableSlot>
                              )
                            }
                            // Empty slot
                            return (
                              <DroppableSlot id={`${doc.id}|${format(slot, "HH:mm")}`}>
                                <div className="flex items-center justify-center h-12 border-b border-r">
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => handleDialogOpen(doc.id, slot)}
                                    disabled={!isSlotRangeAvailable(doc.id, slot, duration)}
                                    className="w-2/3"
                                  >
                                    Book
                                  </Button>
                                </div>
                              </DroppableSlot>
                            )
                        })()}
                        </React.Fragment>
                      )
                    })}
                    </div>
                </DndContext>
                </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Booking Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Book Appointment for {bookingDoctor && doctors.find(d => d.id === bookingDoctor)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div>
              <span className="font-semibold">Time: </span>
              {bookingSlot && format(bookingSlot, "hh:mm a")}
            </div>
            <div>
              <span className="font-semibold">Duration: </span>
              <select
                className="border rounded px-2 py-1 ml-2"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
              >
                {[15, 30, 45, 60].map(mins => (
                  <option key={mins} value={mins}>{mins} min</option>
                ))}
              </select>
            </div>
            {/* Patient name search */}
            <div>
              <Input
                placeholder="Search or enter patient name"
                value={patientSearch || patientName}
                onChange={e => {
                  setPatientSearch(e.target.value)
                  setPatientName(e.target.value)
                }}
                autoFocus
              />
              {patientSearch.length > 0 && (
                <div className="border rounded bg-background mt-1 max-h-32 overflow-y-auto shadow">
                  {patients
                    .filter(
                      p =>
                        p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
                        p.mobile?.includes(patientSearch)
                    )
                    .slice(0, 5)
                    .map(p => (
                      <div
                        key={p.id}
                        className="px-3 py-1 hover:bg-muted cursor-pointer text-sm"
                        onClick={() => {
                          setPatientName(p.name)
                          setPatientSearch("")
                        }}
                      >
                        {p.name} <span className="text-xs text-muted-foreground">({p.mobile})</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <Input
              placeholder="Reason for visit"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            {!isSlotRangeAvailable(bookingDoctor, bookingSlot, duration) && (
              <div className="text-sm text-destructive">
                Selected time range overlaps with another booking.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddBooking}
              disabled={
                !patientName.trim() ||
                !duration ||
                !isSlotRangeAvailable(bookingDoctor, bookingSlot, duration)
              }
            >
              Confirm Booking
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>
                Edit Booking for {editDoctorId && doctors.find(d => d.id === editDoctorId)?.name}
                </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
                <div>
                <span className="font-semibold">Time: </span>
                {editBooking && editBooking.time}
                </div>
                <div>
                <span className="font-semibold">Duration: </span>
                <select
                    className="border rounded px-2 py-1 ml-2"
                    value={editDuration}
                    onChange={e => setEditDuration(Number(e.target.value))}
                >
                    {[15, 30, 45, 60].map(mins => (
                    <option key={mins} value={mins}>{mins} min</option>
                    ))}
                </select>
                </div>
                <Input
                placeholder="Patient name"
                value={editPatientName}
                onChange={e => setEditPatientName(e.target.value)}
                onKeyDown={e => {
                    if (e.key === "Enter") handleEditBookingSave()
                }}
                />
                <Input
                placeholder="Reason for visit"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                />
                <div>
                <span className="font-semibold">Status: </span>
                <select
                    className="border rounded px-2 py-1 ml-2"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                </div>
                {!isSlotRangeAvailable(editDoctorId, editBooking && setMinutes(setHours(selected, Number(editBooking.time.split(":")[0])), Number(editBooking.time.split(":")[1])), editDuration, editBooking) && (
                <div className="text-sm text-destructive">
                    Selected time range overlaps with another booking.
                </div>
                )}
            </div>
            <DialogFooter>
                <Button
                onClick={handleEditBookingSave}
                disabled={
                    !editPatientName.trim() ||
                    !editDuration ||
                    !editBooking ||
                    !isSlotRangeAvailable(editDoctorId, editBooking && setMinutes(setHours(selected, Number(editBooking.time.split(":")[0])), Number(editBooking.time.split(":")[1])), editDuration, editBooking)
                }
                >
                Save Changes
                </Button>
                <DialogClose asChild>
                <Button variant="outline" type="button">
                    Cancel
                </Button>
                </DialogClose>
            </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  )
}

// Drag-and-drop wrappers
function DraggableBooking({ id, booking, onRemove, onEdit, style }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })
  // Extract doctorId from id (format: doctorId|time)
  const doctorId = id.split("|")[0]
  const colorClass = getBookingColor(booking, doctorId)
  return (
    <div
      ref={setNodeRef}
      className={`relative ${colorClass} text-black rounded flex items-center justify-between px-2 py-2 mr-[0.5px] cursor-move shadow-md transition-opacity ${isDragging ? "opacity-60" : ""}`}
      style={{ minHeight: 48, ...style, zIndex: 2 }}
      onClick={e => {
        if (e.target.closest("button")) return
        onEdit()
      }}
    >
      <div className="flex items-center gap-2">
        <span
          {...attributes}
          {...listeners}
          className="font-semibold cursor-move select-none"
        >
          {booking.patient}
        </span>
        <Badge className="ml-2" variant={statusColor(booking.status)}>
          {booking.duration} min
        </Badge>
        <span
          {...attributes}
          {...listeners}
          className="ml-2 text-xs"
        >
          {booking.description}
        </span>
      </div>
      <Button
        size="xs"
        variant="ghost"
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          onRemove();
        }}
        className="absolute top-1 right-1 p-1 h-4"
      >
        ✕
      </Button>
    </div>
  )
}

function DroppableSlot({ id, children }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className="relative h-12">{children}</div>
  )
}
