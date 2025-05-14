import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  const { signIn } = useAuth();
  const [error, setError] = useState('');
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || 'Erro ao fazer login');
        return;
      }

      await signIn({ email });
      router.push('/dashboard');
    } catch (error) {
      setError('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recoveryEmail || !/\S+@\S+\.\S+/.test(recoveryEmail)) {
      setErrors({ recoveryEmail: 'Email inválido' });
      return;
    }

    setRecoveryLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar email de recuperação');
      }

      toast({
        title: 'Sucesso',
        description: 'Email de recuperação enviado',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      setRecoveryEmail('');
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao enviar email de recuperação',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Box p={8} maxWidth="400px" borderWidth={1} borderRadius={8} boxShadow="lg" bg="white">
        <VStack spacing={4} align="flex-start" w="full">
          <VStack spacing={1} align={['center', 'flex-start']} w="full">
            <Heading>Login</Heading>
            <Text>Entre com suas credenciais para acessar o sistema</Text>
          </VStack>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4} align="flex-start" w="full">
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  rounded="md"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <Text color="red.500" fontSize="sm">
                    {errors.email}
                  </Text>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Senha</FormLabel>
                <Input
                  rounded="md"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <Text color="red.500" fontSize="sm">
                    {errors.password}
                  </Text>
                )}
              </FormControl>

              <Button
                rounded="md"
                colorScheme="blue"
                width="full"
                type="submit"
                isLoading={isLoading}
              >
                Entrar
              </Button>
            </VStack>
          </form>

          <Button
            variant="link"
            colorScheme="blue"
            onClick={onOpen}
            alignSelf="center"
          >
            Esqueceu sua senha?
          </Button>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Recuperar Senha</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleRecoverySubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.recoveryEmail}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                  />
                  {errors.recoveryEmail && (
                    <Text color="red.500" fontSize="sm">
                      {errors.recoveryEmail}
                    </Text>
                  )}
                </FormControl>

                <Button
                  colorScheme="blue"
                  width="full"
                  type="submit"
                  isLoading={recoveryLoading}
                >
                  Enviar
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 