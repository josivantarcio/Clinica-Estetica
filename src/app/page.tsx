'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'

export default function Home() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={20}>
        <VStack spacing={8} align="center" textAlign="center">
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, brand.400, brand.600)"
            bgClip="text"
          >
            Sistema de Gestão para Clínicas de Estética
          </Heading>
          
          <Text fontSize="xl" color={textColor} maxW="2xl">
            Gerencie sua clínica de estética com facilidade. Agendamentos, clientes,
            pagamentos e muito mais em uma única plataforma.
          </Text>

          <Button
            size="lg"
            colorScheme="brand"
            px={8}
            py={6}
            fontSize="lg"
          >
            Começar Agora
          </Button>
        </VStack>
      </Container>
    </Box>
  )
} 