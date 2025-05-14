'use client'

import {
  Box,
  Flex,
  Heading,
  Button,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  HStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
} from '@chakra-ui/react'
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import ptBR from 'date-fns/locale/pt-BR'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'

interface Appointment {
  id: string
  clientName: string
  service: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'cancelled'
  notes?: string
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

const statusColors = {
  confirmed: 'green',
  pending: 'yellow',
  cancelled: 'red'
}

const statusLabels = {
  confirmed: 'Confirmado',
  pending: 'Pendente',
  cancelled: 'Cancelado'
}

const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function AgendaPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedDate, setSelectedDate] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    date: '',
    time: '',
    notes: ''
  })
  const [filters, setFilters] = useState({
    dateRange: {
      start: '',
      end: ''
    },
    service: '',
    status: '',
    clientName: ''
  })
  const toast = useToast()

  // Carregar agendamentos
  const loadAppointments = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (filters.dateRange.start) queryParams.append('startDate', filters.dateRange.start)
      if (filters.dateRange.end) queryParams.append('endDate', filters.dateRange.end)
      if (filters.service) queryParams.append('service', filters.service)
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.clientName) queryParams.append('clientName', filters.clientName)
      
      const response = await fetch(`/api/appointments?${queryParams.toString()}`)
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar agendamentos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Carregar clientes
  const loadClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      setClients(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar clientes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Carregar serviços
  const loadServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar serviços',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  useEffect(() => {
    loadAppointments()
    loadClients()
    loadServices()
  }, [selectedDate])

  // Adicionar função para atualizar horário do agendamento
  const handleEventDrop = async (info: any) => {
    try {
      const appointmentId = info.event.id
      const newDate = info.event.start.toISOString().split('T')[0]
      const newTime = info.event.start.toTimeString().split(' ')[0].substring(0, 5)
      
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
        }),
      })
      
      if (!response.ok) {
        info.revert()
        throw new Error('Erro ao atualizar agendamento')
      }
      
      loadAppointments()
      toast({
        title: 'Agendamento atualizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      info.revert()
      toast({
        title: 'Erro ao atualizar agendamento',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Converter agendamentos para o formato do calendário
  const calendarEvents = appointments.map(appointment => ({
    id: appointment.id,
    title: `${appointment.clientName} - ${appointment.service}`,
    start: new Date(`${appointment.date}T${appointment.time}`),
    end: new Date(`${appointment.date}T${appointment.time}`),
    status: appointment.status,
    notes: appointment.notes
  }))

  // Renomear as funções para serem mais específicas
  const handleAppointmentDelete = async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      })
      loadAppointments()
      toast({
        title: 'Agendamento excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao excluir agendamento',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const selectedClient = clients.find(c => c.id === formData.clientId)
      const selectedService = services.find(s => s.id === formData.serviceId)
      
      if (!selectedClient || !selectedService) {
        throw new Error('Cliente ou serviço não encontrado')
      }
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: selectedClient.name,
          service: selectedService.name,
          date: formData.date,
          time: formData.time,
          notes: formData.notes,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }
      
      loadAppointments()
      onClose()
      setFormData({
        clientId: '',
        serviceId: '',
        date: '',
        time: '',
        notes: ''
      })
      
      toast({
        title: 'Agendamento criado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao criar agendamento',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading>Agenda</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={onOpen}
        >
          Novo Agendamento
        </Button>
      </Flex>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Calendário</Tab>
          <Tab>Lista</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box
              bg={useColorModeValue('white', 'gray.700')}
              p={6}
              rounded="lg"
              shadow="xl"
              height="600px"
            >
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale={ptBrLocale}
                events={appointments.map(app => ({
                  id: app.id,
                  title: `${app.clientName} - ${app.service}`,
                  start: `${app.date}T${app.time}`,
                  backgroundColor: app.status === 'confirmed' ? 'green.500' : 
                                  app.status === 'pending' ? 'yellow.500' : 'red.500',
                  borderColor: app.status === 'confirmed' ? 'green.500' : 
                              app.status === 'pending' ? 'yellow.500' : 'red.500',
                }))}
                editable={true}
                droppable={true}
                eventDrop={handleEventDrop}
                height="auto"
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                slotDuration="00:30:00"
                slotLabelInterval="01:00"
                expandRows={true}
                stickyHeaderDates={true}
                dayMaxEvents={true}
                nowIndicator={true}
                weekends={true}
                businessHours={{
                  daysOfWeek: [1, 2, 3, 4, 5, 6],
                  startTime: '08:00',
                  endTime: '20:00',
                }}
              />
            </Box>
          </TabPanel>

          <TabPanel>
            <Box
              bg={useColorModeValue('white', 'gray.700')}
              p={6}
              rounded="lg"
              shadow="xl"
              mb={8}
            >
              <VStack spacing={4} align="stretch" mb={4}>
                <Heading size="md">Filtros</Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Data Inicial</FormLabel>
                    <Input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters({
                        ...filters,
                        dateRange: { ...filters.dateRange, start: e.target.value }
                      })}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Data Final</FormLabel>
                    <Input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters({
                        ...filters,
                        dateRange: { ...filters.dateRange, end: e.target.value }
                      })}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Serviço</FormLabel>
                    <Select
                      value={filters.service}
                      onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                    >
                      <option value="">Todos</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.name}>
                          {service.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="">Todos</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="pending">Pendente</option>
                      <option value="cancelled">Cancelado</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <Input
                      value={filters.clientName}
                      onChange={(e) => setFilters({ ...filters, clientName: e.target.value })}
                      placeholder="Buscar por nome..."
                    />
                  </FormControl>
                </SimpleGrid>

                <HStack justify="flex-end">
                  <Button
                    onClick={() => {
                      setFilters({
                        dateRange: { start: '', end: '' },
                        service: '',
                        status: '',
                        clientName: ''
                      })
                    }}
                  >
                    Limpar Filtros
                  </Button>
                  <Button
                    colorScheme="brand"
                    onClick={loadAppointments}
                  >
                    Aplicar Filtros
                  </Button>
                </HStack>
              </VStack>

              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Horário</Th>
                    <Th>Cliente</Th>
                    <Th>Serviço</Th>
                    <Th>Status</Th>
                    <Th>Observações</Th>
                    <Th>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {appointments.map((appointment) => (
                    <Tr key={appointment.id}>
                      <Td>{appointment.time}</Td>
                      <Td>{appointment.clientName}</Td>
                      <Td>{appointment.service}</Td>
                      <Td>
                        <Badge colorScheme={statusColors[appointment.status]}>
                          {statusLabels[appointment.status]}
                        </Badge>
                      </Td>
                      <Td>{appointment.notes}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Editar agendamento"
                            icon={<FiEdit2 />}
                            size="sm"
                            colorScheme="blue"
                          />
                          <IconButton
                            aria-label="Excluir agendamento"
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleAppointmentDelete(appointment.id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modal de Novo Agendamento */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Novo Agendamento</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleAppointmentSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    placeholder="Selecione o cliente"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  >
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Serviço</FormLabel>
                  <Select
                    placeholder="Selecione o serviço"
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  >
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - R$ {service.price.toFixed(2)}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Data</FormLabel>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Horário</FormLabel>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Observações</FormLabel>
                  <Textarea
                    placeholder="Adicione observações sobre o agendamento"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </FormControl>

                <Button type="submit" colorScheme="brand" width="full">
                  Salvar Agendamento
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
} 