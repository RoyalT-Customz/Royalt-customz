'use client'

import { useEffect, useState, useCallback } from 'react'
import { Calendar, Clock, Plus, X, AlertCircle, CheckCircle, Loader2, Settings, ChevronRight, ChevronLeft, User, MapPin } from 'lucide-react'
import Link from 'next/link'
import CalendarComponent from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

interface Appointment {
  id: string
  service: string
  date: string
  time: string
  status: string
  notes?: string
  duration: number
}

interface Service {
  id: string
  name: string
  description?: string
  category: string
  icon?: string
  duration_minutes: number
  price?: number
}

type Step = 1 | 2 | 3 | 4 | 5

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [user, setUser] = useState<any>(null)
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    service_type: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: '60',
    notes: '',
    location: '',
  })
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchUser()
    fetchAppointments()
    fetchServices()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/account/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch available times for selected date
  useEffect(() => {
    if (currentStep === 3 && formData.appointment_date) {
      fetchAvailableTimes()
    }
  }, [formData.appointment_date, currentStep])

  const fetchAvailableTimes = async () => {
    try {
      // Get all appointments for the selected date
      const response = await fetch('/api/account/appointments')
      if (response.ok) {
        const data = await response.json()
        const dateStr = formData.appointment_date
        const bookedTimes = data.appointments
          .filter((apt: Appointment) => apt.date === dateStr && apt.status !== 'cancelled')
          .map((apt: Appointment) => apt.time)

        // Generate time slots (9 AM to 6 PM, 30-minute intervals)
        const slots: string[] = []
        for (let hour = 9; hour < 18; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            if (!bookedTimes.includes(time)) {
              slots.push(time)
            }
          }
        }
        setAvailableTimes(slots)
      }
    } catch (error) {
      console.error('Error fetching available times:', error)
    }
  }

  const handleNext = () => {
    if (currentStep < 5) {
      // Validation
      if (currentStep === 1 && !formData.service_type) {
        setError('Please select a service')
        return
      }
      if (currentStep === 2 && !formData.appointment_date) {
        setError('Please select a date')
        return
      }
      if (currentStep === 3 && !formData.appointment_time) {
        setError('Please select a time')
        return
      }
      setError('')
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
      setError('')
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`).toISOString()

      const response = await fetch('/api/account/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_type: formData.service_type,
          appointment_date: appointmentDateTime,
          duration_minutes: parseInt(formData.duration_minutes),
          notes: formData.notes,
          location: formData.location,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create appointment')
        if (false) {
          // placeholder
        }
        return
      }

      setSuccess('Appointment created successfully!')
      setTimeout(() => {
        fetchAppointments()
        setShowWizard(false)
        setCurrentStep(1)
        setFormData({
          service_type: '',
          appointment_date: '',
          appointment_time: '',
          duration_minutes: '60',
          notes: '',
          location: '',
        })
        setSuccess('')
      }, 2000)
    } catch (error) {
      console.error('Error creating appointment:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canBookAppointments = true

  const selectedService = services.find(s => (s.category || s.name) === formData.service_type)

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">My Appointments</h1>
          <button
            onClick={() => {
              if (false) {
                // appointments are available to all authenticated users
                return
              }
              setShowWizard(true)
              setCurrentStep(1)
            }}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canBookAppointments}
          >
            <Plus size={20} />
            Book New Appointment
          </button>
        </div>

        {!canBookAppointments && (
          <div className="hidden">
            {/* Appointment booking is available to all authenticated users */}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
            <div className="text-gray-400">Loading appointments...</div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No appointments yet</h3>
            <p className="text-gray-400 mb-6">Book your first appointment to get started.</p>
            {canBookAppointments ? (
              <button
                onClick={() => {
                  setShowWizard(true)
                  setCurrentStep(1)
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all"
              >
                <Plus size={20} />
                Book Appointment
              </button>
            ) : (
              <Link
                href="/account/settings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all"
              >
                <Settings size={20} />
                Go to Settings
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-primary-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{appointment.service}</h3>
                    <div className="space-y-2 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{appointment.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs font-medium">
                    {appointment.status}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all">
                    Reschedule
                  </button>
                  <button className="flex-1 px-4 py-2 bg-bulls-600/20 hover:bg-bulls-600/30 text-bulls-400 border border-bulls-600/50 rounded-lg font-medium transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step-by-Step Wizard */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Book New Appointment</h2>
                <p className="text-gray-400 text-sm">Step {currentStep} of 5</p>
              </div>
              <button
                onClick={() => {
                  setShowWizard(false)
                  setCurrentStep(1)
                  setError('')
                  setSuccess('')
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex-1 h-2 rounded-full ${step <= currentStep ? 'bg-primary-600' : 'bg-gray-700'}`} />
                    {step < 5 && <div className={`w-2 h-2 rounded-full mx-1 ${step < currentStep ? 'bg-primary-600' : 'bg-gray-700'}`} />}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Service</span>
                <span>Date</span>
                <span>Time</span>
                <span>Details</span>
                <span>Confirm</span>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6">
              {/* Step 1: Choose Service */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Step 1: Choose Your Service</h3>
                    <p className="text-gray-400">Select the type of service you'd like to book</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.length > 0 ? (
                      services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, service_type: service.category || service.name, duration_minutes: service.duration_minutes.toString() })}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            formData.service_type === (service.category || service.name)
                              ? 'border-primary-500 bg-primary-600/20'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          }`}
                        >
                          <h4 className="font-semibold text-white mb-1">{service.name}</h4>
                          <p className="text-sm text-gray-400 mb-2">{service.description || service.category}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={14} />
                            <span>{service.duration_minutes} minutes</span>
                            {service.price && <span>• ${service.price}</span>}
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-400">No services available</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Calendar */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Step 2: Choose Your Date</h3>
                    <p className="text-gray-400">Select which day you would like to book</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <CalendarComponent
                      onChange={(value: any) => {
                        if (value instanceof Date) {
                          setSelectedDate(value)
                          setFormData({ ...formData, appointment_date: value.toISOString().split('T')[0] })
                        } else if (Array.isArray(value) && value[0] instanceof Date) {
                          setSelectedDate(value[0])
                          setFormData({ ...formData, appointment_date: value[0].toISOString().split('T')[0] })
                        }
                      }}
                      value={selectedDate}
                      minDate={new Date()}
                      className="w-full"
                    />
                  </div>
                  {formData.appointment_date && (
                    <div className="p-4 bg-primary-600/20 border border-primary-600/30 rounded-lg">
                      <p className="text-white font-medium">Selected Date:</p>
                      <p className="text-primary-400">{new Date(formData.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Choose Time */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Step 3: Choose the Time</h3>
                    <p className="text-gray-400">Select an available time slot</p>
                  </div>
                  {availableTimes.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData({ ...formData, appointment_time: time })}
                          className={`px-4 py-3 rounded-lg font-medium transition-all ${
                            formData.appointment_time === time
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No available times for this date. Please select another date.</p>
                    </div>
                  )}
                  {formData.appointment_time && (
                    <div className="p-4 bg-primary-600/20 border border-primary-600/30 rounded-lg">
                      <p className="text-white font-medium">Selected Time:</p>
                      <p className="text-primary-400">{formData.appointment_time}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Request & Info */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Step 4: Your Request & Information</h3>
                    <p className="text-gray-400">Provide details about your appointment request</p>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location Preference</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Studio A, Online, Your Location"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">This will be synced with the admin's location settings</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Additional Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Any special requirements, preferences, or additional information..."
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Confirm */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Step 5: Confirm & Submit</h3>
                    <p className="text-gray-400">Review your appointment details and confirm</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <h4 className="font-semibold text-white mb-3">Appointment Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Service:</span>
                          <span className="text-white font-medium">{selectedService?.name || formData.service_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date:</span>
                          <span className="text-white font-medium">
                            {formData.appointment_date ? new Date(formData.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time:</span>
                          <span className="text-white font-medium">{formData.appointment_time || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white font-medium">{formData.duration_minutes} minutes</span>
                        </div>
                        {formData.location && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Location:</span>
                            <span className="text-white font-medium">{formData.location}</span>
                          </div>
                        )}
                        {formData.notes && (
                          <div className="pt-2 border-t border-gray-700">
                            <span className="text-gray-400 block mb-1">Notes:</span>
                            <span className="text-white">{formData.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={18} className="text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-yellow-400 font-medium text-sm mb-1">Waiting for Staff Confirmation</p>
                          <p className="text-yellow-300 text-xs">Your appointment request has been submitted. A staff member will review and confirm your appointment. You'll be notified once it's confirmed.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error/Success Messages */}
              {error && (
                <div className="mt-6 p-4 bg-bulls-900/20 border border-bulls-800 rounded-lg text-bulls-400 text-sm flex items-center gap-2">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mt-6 p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span>{success}</span>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-700 mt-6">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2"
                  >
                    <ChevronLeft size={20} />
                    Previous
                  </button>
                )}
                <div className="flex-1" />
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2"
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                    <CheckCircle size={20} />
                    Confirm & Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
