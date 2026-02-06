'use client'

import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Calendar as CalendarIcon, Clock, CreditCard, CheckCircle } from 'lucide-react'
import { format, isSameDay, addDays, setHours, setMinutes } from 'date-fns'

type ServiceType = 'MLO' | 'Shell' | 'Chain' | 'Tattoo' | 'Face' | 'Other'

interface TimeSlot {
  time: string
  available: boolean
}

interface Appointment {
  date: Date
  time: string
  service: ServiceType
  name: string
  email: string
}

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [step, setStep] = useState<'service' | 'date' | 'time' | 'details' | 'payment' | 'confirmed'>('service')
  const [appointmentDetails, setAppointmentDetails] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const services: ServiceType[] = ['MLO', 'Shell', 'Chain', 'Tattoo', 'Face', 'Other']

  // Generate available time slots (9 AM to 6 PM, hourly)
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const startHour = 9
    const endHour = 18

    for (let hour = startHour; hour < endHour; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`
      // Simulate availability - in real app, this would check against booked appointments
      const available = Math.random() > 0.3 // 70% availability
      slots.push({ time: timeString, available })
    }

    return slots
  }

  const [timeSlots] = useState<TimeSlot[]>(generateTimeSlots(selectedDate))

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service)
    setStep('date')
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setStep('time')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep('details')
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('payment')
  }

  const handlePayment = () => {
    // In a real app, this would integrate with a payment processor
    setStep('confirmed')
  }

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    return date < new Date(new Date().setHours(0, 0, 0, 0))
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Schedule a 1-on-1 Class</h2>
          <p className="text-gray-400">Book your appointment and pay securely</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Service', 'Date', 'Time', 'Details', 'Payment'].map((label, index) => {
              const stepIndex = ['service', 'date', 'time', 'details', 'payment'].indexOf(step)
              const isActive = index <= stepIndex
              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-semibold
                        ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-700 text-gray-400'
                        }
                      `}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {index < 4 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        isActive ? 'bg-primary-600' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {step === 'service' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Select Service Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {services.map((service) => (
                <button
                  key={service}
                  onClick={() => handleServiceSelect(service)}
                  className="p-6 bg-gray-700/30 border border-gray-600 rounded-lg hover:border-primary-500 hover:bg-gray-700/50 transition-all text-white font-medium"
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date Selection */}
        {step === 'date' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Select Date</h3>
            <div className="flex justify-center">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <Calendar
                  onChange={(value) => handleDateSelect(value as Date)}
                  value={selectedDate}
                  minDate={new Date()}
                  tileDisabled={({ date }) => isDateDisabled(date)}
                  className="bg-transparent text-white border-0"
                />
              </div>
            </div>
            {selectedService && (
              <div className="mt-4 p-4 bg-primary-600/10 rounded-lg border border-primary-500/30">
                <p className="text-white">
                  Selected Service: <span className="font-semibold">{selectedService}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Time Selection */}
        {step === 'time' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Select Time for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && handleTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className={`
                    p-3 rounded-lg border transition-all text-sm font-medium
                    ${
                      slot.available
                        ? selectedTime === slot.time
                          ? 'bg-primary-600 border-primary-500 text-white'
                          : 'bg-gray-700/30 border-gray-600 text-gray-300 hover:border-primary-500 hover:bg-gray-700/50'
                        : 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'
                    }
                  `}
                >
                  <Clock className="w-4 h-4 mx-auto mb-1" />
                  {slot.time}
                </button>
              ))}
            </div>
            {selectedService && selectedDate && (
              <div className="mt-4 p-4 bg-primary-600/10 rounded-lg border border-primary-500/30">
                <p className="text-white text-sm">
                  <span className="font-semibold">{selectedService}</span> on{' '}
                  {format(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Details Form */}
        {step === 'details' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Your Information</h3>
            <form onSubmit={handleDetailsSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={appointmentDetails.name}
                  onChange={(e) =>
                    setAppointmentDetails({ ...appointmentDetails, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={appointmentDetails.email}
                  onChange={(e) =>
                    setAppointmentDetails({ ...appointmentDetails, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={appointmentDetails.phone}
                  onChange={(e) =>
                    setAppointmentDetails({ ...appointmentDetails, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-semibold"
              >
                Continue to Payment
              </button>
            </form>
          </div>
        )}

        {/* Step 5: Payment */}
        {step === 'payment' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Payment</h3>
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600 max-w-md">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Service:</span>
                  <span className="font-semibold text-white">{selectedService}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Date:</span>
                  <span className="font-semibold text-white">
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Time:</span>
                  <span className="font-semibold text-white">{selectedTime}</span>
                </div>
                <div className="border-t border-gray-600 pt-4 flex justify-between">
                  <span className="text-lg font-semibold text-white">Total:</span>
                  <span className="text-2xl font-bold text-primary-400">$150.00</span>
                </div>
              </div>
              <button
                onClick={handlePayment}
                className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Pay Now
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Confirmation */}
        {step === 'confirmed' && (
          <div className="text-center py-12">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Appointment Confirmed!</h3>
            <p className="text-gray-400 mb-6">
              Your appointment has been scheduled and payment received.
            </p>
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600 max-w-md mx-auto text-left">
              <div className="space-y-2 text-gray-300">
                <p>
                  <span className="font-semibold text-white">Service:</span> {selectedService}
                </p>
                <p>
                  <span className="font-semibold text-white">Date:</span>{' '}
                  {format(selectedDate, 'MMMM d, yyyy')}
                </p>
                <p>
                  <span className="font-semibold text-white">Time:</span> {selectedTime}
                </p>
                <p>
                  <span className="font-semibold text-white">Name:</span>{' '}
                  {appointmentDetails.name}
                </p>
                <p>
                  <span className="font-semibold text-white">Email:</span>{' '}
                  {appointmentDetails.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setStep('service')
                setSelectedService(null)
                setSelectedDate(new Date())
                setSelectedTime(null)
                setAppointmentDetails({ name: '', email: '', phone: '' })
              }}
              className="mt-6 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Book Another Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

