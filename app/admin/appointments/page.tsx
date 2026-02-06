'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  Calendar,
  User,
  Clock,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Loader2,
  Save,
  MapPin,
  Settings,
  Filter,
} from 'lucide-react'
import { getUserDisplayName, getUserDisplayEmail } from '@/lib/user-display'
import CalendarComponent from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

interface Appointment {
  id: string
  user_id: string
  user: {
    username: string
    email: string
    first_name?: string
    last_name?: string
    full_name?: string
    phone?: string
  }
  service_type: string
  appointment_date: string
  duration_minutes: number
  status: string
  notes?: string
  location?: string
  created_at: string
  updated_at: string
}

interface Service {
  id: string
  name: string
  description?: string
  category: string
  duration_minutes: number
}

export default function AdminAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterServiceType, setFilterServiceType] = useState<string>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    service_type: '',
    status: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: '60',
    notes: '',
    location: '',
  })
  const [availabilityCheck, setAvailabilityCheck] = useState<{
    isChecking: boolean
    isAvailable: boolean | null
    conflictMessage: string
  }>({
    isChecking: false,
    isAvailable: null,
    conflictMessage: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }, [])

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterServiceType !== 'all') params.append('service_type', filterServiceType)

      const response = await fetch(`/api/admin/appointments?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      } else {
        setError('Failed to fetch appointments')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setError('Error loading appointments')
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus, filterServiceType])

  useEffect(() => {
    fetchServices()
    fetchAppointments()
  }, [fetchServices, fetchAppointments])

  const checkAvailability = useCallback(async (date: string, time: string, duration: number, excludeAppointmentId?: string) => {
    setAvailabilityCheck({ isChecking: true, isAvailable: null, conflictMessage: '' })
    try {
      const appointmentDateTime = new Date(`${date}T${time}`).toISOString()
      const endTime = new Date(new Date(appointmentDateTime).getTime() + duration * 60000).toISOString()

      const response = await fetch('/api/admin/appointments')
      if (response.ok) {
        const data = await response.json()
        const conflicts = (data.appointments || []).filter((apt: Appointment) => {
          if (apt.id === excludeAppointmentId || apt.status === 'cancelled') return false
          const aptStart = new Date(apt.appointment_date)
          const aptEnd = new Date(aptStart.getTime() + apt.duration_minutes * 60000)
          const checkStart = new Date(appointmentDateTime)
          const checkEnd = new Date(endTime)

          return (checkStart < aptEnd && checkEnd > aptStart)
        })

        if (conflicts.length > 0) {
          setAvailabilityCheck({
            isChecking: false,
            isAvailable: false,
            conflictMessage: `Conflict with ${conflicts.length} existing appointment(s)`,
          })
        } else {
          setAvailabilityCheck({
            isChecking: false,
            isAvailable: true,
            conflictMessage: '',
          })
        }
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailabilityCheck({
        isChecking: false,
        isAvailable: null,
        conflictMessage: 'Error checking availability',
      })
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'edit' && formData.appointment_date && formData.appointment_time && formData.duration_minutes) {
      const duration = parseInt(formData.duration_minutes)
      checkAvailability(formData.appointment_date, formData.appointment_time, duration, selectedAppointment?.id)
    } else {
      setAvailabilityCheck({ isChecking: false, isAvailable: null, conflictMessage: '' })
    }
  }, [formData.appointment_date, formData.appointment_time, formData.duration_minutes, activeTab, selectedAppointment?.id, checkAvailability])

  const handleOpenEdit = async (appointment: Appointment) => {
    try {
      setError('')
      setSuccess('')
      setIsLoading(true)
      
      const response = await fetch(`/api/admin/appointments/${appointment.id}`)
      const data = await response.json()
      
      if (response.ok) {
        const apt = data.appointment
        if (!apt) {
          setError('Appointment data not found')
          setIsLoading(false)
          return
        }
        
        const appointmentDate = new Date(apt.appointment_date)
        
        setSelectedAppointment(apt)
        setFormData({
          service_type: apt.service_type || '',
          status: apt.status || 'pending',
          appointment_date: appointmentDate.toISOString().split('T')[0],
          appointment_time: appointmentDate.toTimeString().slice(0, 5),
          duration_minutes: apt.duration_minutes?.toString() || '60',
          notes: apt.notes || '',
          location: apt.location || '',
        })
        
        setActiveTab('edit')
        setSuccess('Appointment loaded successfully')
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError(data.error || 'Failed to load appointment details')
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error)
      setError('Error loading appointment details. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const appointmentDateTime = formData.appointment_date && formData.appointment_time
        ? new Date(`${formData.appointment_date}T${formData.appointment_time}`).toISOString()
        : selectedAppointment.appointment_date

      const response = await fetch(`/api/admin/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_type: formData.service_type,
          status: formData.status,
          appointment_date: appointmentDateTime,
          duration_minutes: parseInt(formData.duration_minutes),
          notes: formData.notes,
          location: formData.location,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update appointment')
        return
      }

      setSuccess('Appointment updated successfully!')
      setTimeout(() => {
        fetchAppointments()
        setActiveTab('view')
        setSelectedAppointment(null)
      }, 1500)
    } catch (error) {
      console.error('Error updating appointment:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('Appointment deleted successfully!')
        setTimeout(() => {
          fetchAppointments()
          setSuccess('')
        }, 1500)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete appointment')
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      setError('An error occurred. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'confirmed':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
      case 'cancelled':
        return 'bg-red-600/20 text-red-400 border-red-600/30'
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30'
    }
  }

  const generateTimeSlots = useCallback(() => {
    const slots: string[] = []
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }, [])

  useEffect(() => {
    if (activeTab === 'edit' && formData.appointment_date) {
      const dateStr = formData.appointment_date
      const bookedTimes = appointments
        .filter(apt => {
          const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0]
          return aptDate === dateStr && apt.status !== 'cancelled' && apt.id !== selectedAppointment?.id
        })
        .map(apt => {
          const aptDate = new Date(apt.appointment_date)
          return aptDate.toTimeString().slice(0, 5)
        })

      const allSlots = generateTimeSlots()
      setAvailableTimes(allSlots.filter(slot => !bookedTimes.includes(slot)))
    }
  }, [formData.appointment_date, appointments, selectedAppointment, activeTab, generateTimeSlots])

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.service_type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus
    const matchesServiceType = filterServiceType === 'all' || appointment.service_type === filterServiceType
    return matchesSearch && matchesStatus && matchesServiceType
  })

  if (isLoading && appointments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Header */}
        <section className="mb-8 lg:mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Appointments <span className="text-primary-500">Management</span>
              </h1>
              <p className="text-gray-400 text-base lg:text-lg">View and manage all customer appointments</p>
            </div>
            <div className="text-right p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              <p className="text-gray-400 text-sm mb-1 font-medium">Total Appointments</p>
              <p className="text-3xl lg:text-4xl font-bold text-primary-500">{appointments.length}</p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 flex items-center gap-3 backdrop-blur-sm">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')} className="hover:text-red-300 transition-colors">
                <X size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-800/50 rounded-xl text-green-400 flex items-center gap-3 backdrop-blur-sm">
              <CheckCircle size={20} className="flex-shrink-0" />
              <span className="flex-1">{success}</span>
              <button onClick={() => setSuccess('')} className="hover:text-green-300 transition-colors">
                <X size={18} />
              </button>
            </div>
          )}
        </section>

        {/* Tabs */}
        <div className="mb-6 lg:mb-8 border-b border-gray-700/50">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('view')
                setSelectedAppointment(null)
                setError('')
                setSuccess('')
              }}
              className={`px-6 py-3 font-semibold transition-all border-b-2 rounded-t-lg ${
                activeTab === 'view'
                  ? 'text-primary-400 border-primary-400 bg-primary-600/10'
                  : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-800/30'
              }`}
            >
              View Appointments
            </button>
            <button
              type="button"
              onClick={() => {
                if (!selectedAppointment) {
                  setError('Please click the Edit button on an appointment from the list first')
                  setTimeout(() => setError(''), 4000)
                  return
                }
                setActiveTab('edit')
              }}
              className={`px-6 py-3 font-semibold transition-all border-b-2 rounded-t-lg ${
                activeTab === 'edit'
                  ? 'text-primary-400 border-primary-400 bg-primary-600/10'
                  : selectedAppointment
                  ? 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-800/30'
                  : 'text-gray-500 border-transparent cursor-not-allowed'
              }`}
            >
              Edit Appointment
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'view' ? (
          <div>
            {/* Filters */}
            <section className="mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search appointments by ID, customer, or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="relative">
                  <Settings className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={filterServiceType}
                    onChange={(e) => setFilterServiceType(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">All Services</option>
                    {services.length > 0 ? (
                      Array.from(new Set(services.map((s) => s.category || s.name))).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="MLO">MLO</option>
                        <option value="Shell">Shell</option>
                        <option value="Chain">Chain</option>
                        <option value="Tattoo">Tattoo</option>
                        <option value="Face">Face</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </section>

            {/* Appointments Table */}
            {filteredAppointments.length > 0 ? (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden shadow-xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/70 border-b border-gray-700/70 backdrop-blur-sm">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Appointment</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                      {filteredAppointments.map((appointment) => {
                        const appointmentDate = new Date(appointment.appointment_date)
                        const displayName = getUserDisplayName(appointment.user)

                        return (
                          <tr key={appointment.id} className="hover:bg-gray-800/40 transition-all duration-200">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                                  <Calendar size={20} className="text-primary-400" />
                                </div>
                                <div>
                                  <p className="text-white font-semibold">#{appointment.id.slice(0, 8)}</p>
                                  <p className="text-gray-400 text-xs">{appointmentDate.toLocaleDateString()}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-white font-medium">{displayName}</p>
                                <p className="text-gray-400 text-sm">@{appointment.user.username}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg text-xs font-semibold">
                                {appointment.service_type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-300">
                                <Clock size={14} />
                                <span className="text-sm">{appointmentDate.toLocaleString()}</span>
                              </div>
                              <p className="text-gray-500 text-xs mt-1">{appointment.duration_minutes} minutes</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                                {appointment.status === 'completed' && <CheckCircle size={14} />}
                                {appointment.status === 'cancelled' && <XCircle size={14} />}
                                {appointment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenEdit(appointment)}
                                  className="p-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all border border-blue-600/30 hover:border-blue-600/50"
                                  title="Edit Appointment"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                  className="p-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all border border-red-600/30 hover:border-red-600/50"
                                  title="Delete Appointment"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-400 mb-2">No appointments found</p>
                <p className="text-gray-500">
                  {searchQuery || filterStatus !== 'all' || filterServiceType !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No appointments have been scheduled yet'}
                </p>
              </div>
            )}

            {/* Results Count */}
            {filteredAppointments.length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Showing <span className="text-primary-500 font-semibold">{filteredAppointments.length}</span>{' '}
                  {filteredAppointments.length === 1 ? 'appointment' : 'appointments'}
                </p>
              </div>
            )}
          </div>
        ) : selectedAppointment ? (
          <div>
            {/* Edit Appointment Form */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-6 lg:p-8 backdrop-blur-sm shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Edit Appointment</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateAppointment(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Service Type</label>
                    <select
                      value={formData.service_type}
                      onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                      required
                    >
                      <option value="">Select Service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.category || service.name}>
                          {service.name} ({service.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.appointment_date}
                      onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                    <select
                      value={formData.appointment_time}
                      onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                      required
                    >
                      <option value="">Select Time</option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                      min="15"
                      step="15"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Admin location"
                      className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all resize-none"
                    placeholder="Additional notes..."
                  />
                </div>

                {availabilityCheck.isChecking && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Checking availability...</span>
                  </div>
                )}

                {availabilityCheck.isAvailable === false && (
                  <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 text-sm">
                    {availabilityCheck.conflictMessage}
                  </div>
                )}

                {availabilityCheck.isAvailable === true && (
                  <div className="p-4 bg-green-900/20 border border-green-800/50 rounded-xl text-green-400 text-sm">
                    Time slot is available
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('view')
                      setSelectedAppointment(null)
                    }}
                    className="flex-1 px-6 py-3 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white rounded-xl font-semibold transition-all border border-gray-700/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || availabilityCheck.isAvailable === false}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
                  >
                    {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                    <Save size={20} />
                    Update Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
            <Edit className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">No appointment selected</p>
            <p className="text-gray-500">Please select an appointment from the "View Appointments" tab to edit</p>
          </div>
        )}
      </div>
    </div>
  )
}
