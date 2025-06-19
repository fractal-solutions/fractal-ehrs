import React from "react"
import { useState } from "react"
import { format, setHours, setMinutes, addMinutes, isWithinInterval } from "date-fns"
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core"

import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const doctors = [
  { id: "dr-andrews", name: "Dr. Andrews" },
  { id: "dr-martinez", name: "Dr. Martinez" },
  { id: "dr-smith", name: "Dr. Smith" },
]

const START_HOUR = 8
const END_HOUR = 17
const SLOT_MINUTES = 15

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
    { time: "09:00", patient: "John Doe", status: "confirmed", date: format(new Date(), "yyyy-MM-dd"), duration: 30, description: "Checkup" },
    { time: "10:30", patient: "Jane Smith", status: "pending", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "Consultation" },
  ],
  "dr-martinez": [
    { time: "09:30", patient: "Sarah Wilson", status: "confirmed", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "Flu symptoms" },
  ],
  "dr-smith": [
    { time: "10:00", patient: "Emily Clark", status: "pending", date: format(new Date(), "yyyy-MM-dd"), duration: 15, description: "Follow-up" },
  ],
}

function statusColor(status) {
  switch (status) {
    case "confirmed":
      return "success"
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

export default function Appointments() {
  const [selected, setSelected] = useState(new Date())
  const [appointments, setAppointments] = useState(initialAppointments)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [removeDialog, setRemoveDialog] = useState({ open: false, booking: null, doctorId: null })
  const [bookingSlot, setBookingSlot] = useState(null)
  const [bookingDoctor, setBookingDoctor] = useState(null)
  const [patientName, setPatientName] = useState("")
  const [duration, setDuration] = useState(15)
  const [description, setDescription] = useState("")

  const slots = generateTimeSlots(START_HOUR, END_HOUR, SLOT_MINUTES)
  const selectedDateStr = format(selected, "yyyy-MM-dd")

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
  function isSlotRangeAvailable(doctorId, slot, duration) {
    const slotStart = slot
    const slotEnd = addMinutes(slot, duration)
    return !(appointments[doctorId] || []).some(appt => {
      if (appt.date !== selectedDateStr) return false
      const [h, m] = appt.time.split(":").map(Number)
      const apptStart = setMinutes(setHours(selected, h), m)
      const apptEnd = addMinutes(apptStart, appt.duration || 15)
      // Overlap check
      return (
        (slotStart < apptEnd && slotEnd > apptStart)
      )
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

  function handleRemoveBooking(doctorId, slot) {
    setAppointments((prev) => ({
      ...prev,
      [doctorId]: (prev[doctorId] || []).filter(
        (appt) => {
          const [h, m] = appt.time.split(":").map(Number)
          const apptStart = setMinutes(setHours(selected, h), m)
          return !(isWithinInterval(slot, { start: apptStart, end: addMinutes(apptStart, appt.duration || 15) }))
        }
      ),
    }))
    setRemoveDialog({ open: false, booking: null, doctorId: null })
  }

  // Drag-and-drop logic
  function handleDragEnd(event) {
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
      <div className="md:w-1/4 min-w-[260px]">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          className="rounded-lg border shadow-sm scale-100 m-2 w-full"
        />
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-x-auto">
        <Tabs value="timeline">
          <TabsList className="mb-4">
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline">
            <ScrollArea className="h-[calc(100vh-160px)] rounded-lg border bg-background shadow-inner">
              <DndContext onDragEnd={handleDragEnd}>
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
                    return (
                        <React.Fragment key={rowIdx}>
                        {/* Time column */}
                        <div className="text-right pr-2 py-1 text-xs bg-background sticky left-0 z-10 border-b border-r font-mono">
                            {format(slot, "hh:mm a")}
                        </div>
                        {doctors.map((doc, colIdx) => {
                            const booking = getBookingForSlot(doc.id, slot)
                            // Only render the booking at its start slot, skip rendering for covered slots
                            if (booking && !isBookingStart(doc.id, slot)) {
                            // Skip covered slots
                            return <div key={colIdx} style={{ height: 0 }} />
                            }
                            if (booking) {
                            // Calculate height
                            const slotCount = (booking.duration || 15) / SLOT_MINUTES
                            const height = slotCount * 48 // 48px per slot
                            return (
                                <DroppableSlot key={colIdx} id={`${doc.id}|${format(slot, "HH:mm")}`}>
                                <DraggableBooking
                                    id={`${doc.id}|${booking.time}`}
                                    booking={booking}
                                    onRemove={() => setRemoveDialog({ open: true, booking, doctorId: doc.id })}
                                    style={{ height }}
                                />
                                </DroppableSlot>
                            )
                            }
                            // Empty slot
                            return (
                            <DroppableSlot key={colIdx} id={`${doc.id}|${format(slot, "HH:mm")}`}>
                                <div className="flex items-center justify-center h-12 border-b border-r">
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => handleDialogOpen(doc.id, slot)}
                                    disabled={!isSlotRangeAvailable(doc.id, slot, duration)}
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
            <Input
              autoFocus
              placeholder="Patient name"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleAddBooking()
              }}
            />
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

      {/* Remove Confirmation Dialog */}
      <Dialog open={removeDialog.open} onOpenChange={open => setRemoveDialog({ ...removeDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Booking</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to remove this booking for <b>{removeDialog.booking?.patient}</b>?
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => handleRemoveBooking(removeDialog.doctorId, removeDialog.booking && setMinutes(setHours(selected, Number(removeDialog.booking.time.split(":")[0])), Number(removeDialog.booking.time.split(":")[1])))}
            >
              Remove
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Drag-and-drop wrappers
function DraggableBooking({ id, booking, onRemove, style }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`relative bg-primary/80 text-white rounded flex items-center justify-between px-2 py-1 cursor-move shadow-md transition-opacity ${isDragging ? "opacity-60" : ""}`}
      style={{ minHeight: 48, ...style, zIndex: 2 }}
    >
      <div>
        <span className="font-semibold">{booking.patient}</span>
        <Badge className="ml-2" variant={statusColor(booking.status)}>
          {booking.duration} min
        </Badge>
        <span className="ml-2 text-xs">{booking.description}</span>
      </div>
      <Button size="xs" variant="ghost" onClick={onRemove}>✕</Button>
    </div>
  )
}

function DroppableSlot({ id, children }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className="relative h-12">{children}</div>
  )
}
