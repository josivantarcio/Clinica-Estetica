'use client'

import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { FiCalendar, FiUsers, FiDollarSign, FiTrendingUp } from 'react-icons/fi'
import Link from 'next/link'

interface StatCardProps {
  title: string
  stat: string
  icon: any
  helpText?: string
  trend?: 'increase' | 'decrease'
  trendValue?: string
}

function StatCard({ title, stat, icon, helpText, trend, trendValue }: StatCardProps) {
  return (
    <Stat
      px={{ base: 4, md: 8 }}
      py="5"
      shadow="xl"
      border="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.500')}
      rounded="lg"
      bg={useColorModeValue('white', 'gray.700')}
    >
      <Flex justifyContent="space-between">
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight="medium" isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="medium">
            {stat}
          </StatNumber>
          {helpText && (
            <StatHelpText>
              {trend && <StatArrow type={trend} />}
              {trendValue}
              {helpText}
            </StatHelpText>
          )}
        </Box>
        <Box
          my="auto"
          color={useColorModeValue('gray.800', 'gray.200')}
          alignContent="center"
        >
          <Icon as={icon} w={8} h={8} />
        </Box>
      </Flex>
    </Stat>
  )
}

export default function DashboardPage() {
  return (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Heading mb={8}>Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 5, lg: 8 }}>
        <StatCard
          title="Agendamentos Hoje"
          stat="12"
          icon={FiCalendar}
          helpText="agendamentos"
          trend="increase"
          trendValue="23.36%"
        />
        <StatCard
          title="Total de Clientes"
          stat="156"
          icon={FiUsers}
          helpText="clientes ativos"
          trend="increase"
          trendValue="12.5%"
        />
        <StatCard
          title="Faturamento Mensal"
          stat="R$ 12.500"
          icon={FiDollarSign}
          helpText="este mês"
          trend="increase"
          trendValue="8.2%"
        />
        <StatCard
          title="Taxa de Ocupação"
          stat="85%"
          icon={FiTrendingUp}
          helpText="últimos 30 dias"
          trend="increase"
          trendValue="5.1%"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mt={8}>
        <Box
          bg={useColorModeValue('white', 'gray.700')}
          p={6}
          rounded="lg"
          shadow="xl"
        >
          <Heading size="md" mb={4}>Ações Rápidas</Heading>
          <SimpleGrid columns={2} spacing={4}>
            <Button
              as={Link}
              href="/dashboard/agenda/novo"
              colorScheme="brand"
              leftIcon={<FiCalendar />}
            >
              Novo Agendamento
            </Button>
            <Button
              as={Link}
              href="/dashboard/clientes/novo"
              colorScheme="brand"
              leftIcon={<FiUsers />}
            >
              Novo Cliente
            </Button>
          </SimpleGrid>
        </Box>

        <Box
          bg={useColorModeValue('white', 'gray.700')}
          p={6}
          rounded="lg"
          shadow="xl"
        >
          <Heading size="md" mb={4}>Próximos Agendamentos</Heading>
          <Text color="gray.500">Nenhum agendamento para hoje</Text>
        </Box>
      </SimpleGrid>
    </Box>
  )
} 