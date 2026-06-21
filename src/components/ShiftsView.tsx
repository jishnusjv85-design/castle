import React, { useState, useMemo } from "react";
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Plus, 
  CheckCircle2, 
  UserSquare2, 
  ShieldAlert, 
  Calendar,
  Layers,
  MapPin
} from "lucide-react";
import { Employee, Shift } from "../types";

interface ShiftsViewProps {
  branchId: string;
  employees: Employee[];
  shifts: Shift[];
  onAddShift: (shift: Shift) => Promise<void>;
  onUpdateShiftStatus: (shiftId: string, status: 'Scheduled' | 'Completed' | 'Absent') => Promise<void>;
  onAddEmployee: (employee: Employee) => Promise<void>;
}

export default function ShiftsView({
  branchId,
  employees,
  shifts,
  onAddShift,
  onUpdateShiftStatus,
  onAddEmployee
}: ShiftsViewProps) {
  // New employee state
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState<'Cashier' | 'Chef' | 'Waiter' | 'Manager'>('Cashier');
  const [empPhone, setEmpPhone] = useState("");
  const [empEmail, setEmpEmail] = useState("");

  // New shift states
  const [showAddShift, setShowAddShift] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split("T")[0]);
  const [shiftStart, setShiftStart] = useState("09:00");
  const [shiftEnd, setShiftEnd] = useState("17:00");
  const [shiftRole, setShiftRole] = useState("Cashier");

  // Filter shifts
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);

  // Active employees on shift today or at filter date
  const activeShiftsForSelectedDate = useMemo(() => {
    return shifts.filter(s => s.date === filterDate);
  }, [shifts, filterDate]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName) return;

    const employee: Employee = {
      id: "emp-" + Math.floor(1000 + Math.random() * 9000),
      name: empName,
      role: empRole,
      phone: empPhone,
      email: empEmail,
      isActive: true
    };

    try {
      await onAddEmployee(employee);
      setEmpName("");
      setEmpPhone("");
      setEmpEmail("");
      setShowAddEmp(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    const empObj = employees.find(e => e.id === selectedEmpId);
    if (!empObj) return;

    const shift: Shift = {
      id: "sh-" + Math.floor(100000 + Math.random() * 900000),
      employeeId: selectedEmpId,
      employeeName: empObj.name,
      branchId,
      date: shiftDate,
      startTime: shiftStart,
      endTime: shiftEnd,
      role: shiftRole,
      status: "Scheduled"
    };

    try {
      await onAddShift(shift);
      setSelectedEmpId("");
      setShowAddShift(false);
    } catch (e) {
      console.error(e);
    }
  };

  const promoteShiftStatus = async (shiftId: string, currentStatus: string) => {
    // Cycles Scheduled -> Completed -> Absent -> Scheduled
    let nextStatus: 'Scheduled' | 'Completed' | 'Absent';
    if (currentStatus === "Scheduled") {
      nextStatus = "Completed";
    } else if (currentStatus === "Completed") {
      nextStatus = "Absent";
    } else {
      nextStatus = "Scheduled";
    }

    try {
      await onUpdateShiftStatus(shiftId, nextStatus);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      
      {/* LEFT ASPECT PANEL: ADD SHIFTS & ADD EMPLOYEES */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        
        {/* ADD SHIFT EXPANDABLE CONTAINER */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3.5 mb-4">
            <h3 className="text-xs font-black uppercase text-stone-605 tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-orange-600" /> Schedule Shift
            </h3>
            <button 
              onClick={() => setShowAddShift(!showAddShift)}
              className="rounded bg-stone-100 font-bold text-[10px] px-2 py-1 text-stone-600 hover:bg-stone-200"
            >
              Toggle Form
            </button>
          </div>

          {(showAddShift || shifts.length === 0) && (
            <form onSubmit={handleCreateShift} className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-stone-500">Associate Employee</label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => {
                    setSelectedEmpId(e.target.value);
                    const selected = employees.find(emp => emp.id === e.target.value);
                    if (selected) setShiftRole(selected.role);
                  }}
                  className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 font-semibold text-stone-750 focus:bg-white"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-stone-505">Shift Date</label>
                  <input
                    type="date"
                    required
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                    className="rounded-lg border border-stone-200 bg-stone-50/50 p-2 font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-stone-505">Roster Role</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Chef, Cashier"
                    value={shiftRole}
                    onChange={(e) => setShiftRole(e.target.value)}
                    className="rounded-lg border border-stone-200 bg-stone-50/50 p-2 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-stone-505">Start Time</label>
                  <input
                    type="time"
                    required
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="rounded-lg border border-stone-200 bg-stone-50/50 p-2 font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-stone-550">End Time</label>
                  <input
                    type="time"
                    required
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="rounded-lg border border-stone-200 bg-stone-50/50 p-2 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-orange-600/90 py-2.5 text-center font-bold text-white hover:bg-orange-700 shadow-sm transition-all"
              >
                Assemble Roster Entry
              </button>
            </form>
          )}

          {!showAddShift && shifts.length > 0 && (
            <p className="text-[11px] text-stone-450 leading-relaxed text-center py-2.5">
              Form collapsed. Use the Toggle Form button above to scheduled new roster timelines.
            </p>
          )}
        </div>

        {/* REGISTER NEW EMPLOYEE CONTAINER */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3.5 mb-4">
            <h3 className="text-xs font-black uppercase text-stone-605 tracking-wider flex items-center gap-1.5">
              <Users className="h-4 w-4 text-stone-500" /> Employee Registry
            </h3>
            <button 
              onClick={() => setShowAddEmp(!showAddEmp)}
              className="rounded bg-stone-100 font-bold text-[10px] px-2 py-1 text-stone-600 hover:bg-stone-200"
            >
              {showAddEmp ? "Hide" : "Add Staff"}
            </button>
          </div>

          {showAddEmp ? (
            <form onSubmit={handleCreateEmployee} className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-stone-500 font-sans">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Michael Scott"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-stone-500">Corporate Role</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as any)}
                    className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 font-bold"
                  >
                    <option value="Cashier">Cashier</option>
                    <option value="Chef">Chef</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-stone-500 font-sans">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="555-0392"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-stone-500 font-sans">Corporate Email</label>
                <input
                  type="email"
                  placeholder="contact@bistro.com"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-stone-900 py-2.5 text-center font-bold text-white hover:bg-stone-850"
              >
                Register Employee
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto">
              {employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 text-[11px] font-medium border border-stone-150">
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-900">{emp.name}</span>
                    <span className="text-[10px] text-stone-400 capitalize">{emp.role}</span>
                  </div>
                  <span className="rounded bg-white px-2 py-0.5 text-[9px] font-bold text-stone-500 border">
                    {emp.phone ? emp.phone : "No Phone"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* RIGHT ASPECT PANEL: DAILY ROSTER GRID & CALENDAR SCHEDULES */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        
        {/* Day Selector Ribbon */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-black text-stone-900">Shift Roster Timeline</h3>
            <p className="text-xs text-stone-500 mt-0.5">Filter the daily shift calendars to monitor attendance on-site.</p>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-stone-500">Selected Date:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-bold text-stone-850"
            />
          </div>
        </div>

        {/* Attendance Dashboard List */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3.5 mb-4">
            <Layers className="h-4.5 w-4.5 text-stone-450" />
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-605">
              Attendance Roster for {new Date(filterDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeShiftsForSelectedDate.map(shift => {
              const worksToday = shift.status === "Completed";
              const isAbsent = shift.status === "Absent";
              
              return (
                <div 
                  key={shift.id} 
                  className={`relative overflow-hidden rounded-xl border p-4.5 flex items-start justify-between bg-white transition-all ${
                    worksToday 
                      ? "border-emerald-250 bg-emerald-50/15" 
                      : isAbsent 
                        ? "border-red-200 bg-red-50/10" 
                        : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      worksToday 
                        ? "bg-emerald-100/60 text-emerald-700 border-emerald-200" 
                        : isAbsent 
                          ? "bg-red-100/50 text-red-600 border-red-150" 
                          : "bg-stone-50 text-stone-600 border-stone-200"
                    }`}>
                      <UserSquare2 className="h-5 w-5" />
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-stone-900">{shift.employeeName}</span>
                      <span className="text-[10px] uppercase font-bold text-orange-650 tracking-wider font-mono">{shift.role}</span>
                      
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-stone-500 font-medium">
                        <Clock className="h-3 w-3 text-stone-350" />
                        <span>Hours: {shift.startTime} - {shift.endTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shift Progress Cycling Controls */}
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      onClick={() => promoteShiftStatus(shift.id, shift.status)}
                      className={`rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider shadow-xs border transition-colors ${
                        worksToday
                          ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                          : isAbsent
                            ? "bg-red-650 border-red-650 text-white hover:bg-red-700"
                            : "bg-white border-stone-250 text-stone-705 hover:bg-stone-50"
                      }`}
                      title="Click to toggle status (Scheduled -> Completed -> Absent)"
                    >
                      {shift.status}
                    </button>
                    <span className="text-[8px] text-stone-400">Click to change</span>
                  </div>
                </div>
              );
            })}

            {activeShiftsForSelectedDate.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-stone-200 rounded-xl py-12 px-4 text-center text-stone-400 font-medium">
                <CalendarDays className="h-9 w-9 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-500">No shifts scheduled for this day</p>
                <p className="text-[10px] text-stone-400 mt-1 max-w-sm mx-auto leading-normal">
                  Staffing ensures seamless workflow levels. Scheduled some corporate slots for employees using the left panel.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
