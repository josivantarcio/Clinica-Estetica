'use client'

import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Select,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface ReportData {
  totalRevenue: number
  totalAppointments: number
  revenueGrowth: number
  appointmentsGrowth: number
  revenueByService: {
    service: string
    revenue: number
  }[]
  appointmentsByStatus: {
    status: string
    count: number
  }[]
  revenueByMonth: {
    month: string
    revenue: number
  }[]
}

export default function RelatoriosPage() {
  const [period, setPeriod] = useState('month')
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalAppointments: 0,
    revenueGrowth: 0,
    appointmentsGrowth: 0,
    revenueByService: [],
    appointmentsByStatus: [],
    revenueByMonth: [],
  })

  // Carregar dados do relatório
  const loadReportData = async () => {
    try {
      const response = await fetch(`/api/reports?period=${period}`)
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error)
    }
  }

  useEffect(() => {
    loadReportData()
  }, [period])

  // Configuração do gráfico de receita por serviço
  const revenueByServiceData = {
    labels: reportData.revenueByService.map(item => item.service),
    datasets: [
      {
        label: 'Receita por Serviço',
        data: reportData.revenueByService.map(item => item.revenue),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  // Configuração do gráfico de agendamentos por status
  const appointmentsByStatusData = {
    labels: reportData.appointmentsByStatus.map(item => item.status),
    datasets: [
      {
        label: 'Agendamentos por Status',
        data: reportData.appointmentsByStatus.map(item => item.count),
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  // Configuração do gráfico de receita por mês
  const revenueByMonthData = {
    labels: reportData.revenueByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Receita por Mês',
        data: reportData.revenueByMonth.map(item => item.revenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  }

  return (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading>Relatórios</Heading>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          maxW="200px"
        >
          <option value="week">Última Semana</option>
          <option value="month">Último Mês</option>
          <option value="year">Último Ano</option>
        </Select>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={8}>
        <Stat
          px={4}
          py={5}
          bg={useColorModeValue('white', 'gray.700')}
          rounded="lg"
          shadow="xl"
        >
          <StatLabel>Receita Total</StatLabel>
          <StatNumber>R$ {reportData.totalRevenue.toFixed(2)}</StatNumber>
          <StatHelpText>
            <StatArrow type={reportData.revenueGrowth >= 0 ? 'increase' : 'decrease'} />
            {Math.abs(reportData.revenueGrowth)}%
          </StatHelpText>
        </Stat>

        <Stat
          px={4}
          py={5}
          bg={useColorModeValue('white', 'gray.700')}
          rounded="lg"
          shadow="xl"
        >
          <StatLabel>Total de Agendamentos</StatLabel>
          <StatNumber>{reportData.totalAppointments}</StatNumber>
          <StatHelpText>
            <StatArrow type={reportData.appointmentsGrowth >= 0 ? 'increase' : 'decrease'} />
            {Math.abs(reportData.appointmentsGrowth)}%
          </StatHelpText>
        </Stat>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Box
          bg={useColorModeValue('white', 'gray.700')}
          p={6}
          rounded="lg"
          shadow="xl"
        >
          <Heading size="md" mb={4}>Receita por Serviço</Heading>
          <Box height="300px">
            <Pie data={revenueByServiceData} />
          </Box>
        </Box>

        <Box
          bg={useColorModeValue('white', 'gray.700')}
          p={6}
          rounded="lg"
          shadow="xl"
        >
          <Heading size="md" mb={4}>Agendamentos por Status</Heading>
          <Box height="300px">
            <Bar data={appointmentsByStatusData} />
          </Box>
        </Box>

        <Box
          bg={useColorModeValue('white', 'gray.700')}
          p={6}
          rounded="lg"
          shadow="xl"
          gridColumn={{ base: 'auto', lg: 'span 2' }}
        >
          <Heading size="md" mb={4}>Receita por Mês</Heading>
          <Box height="300px">
            <Line data={revenueByMonthData} />
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  )
} 