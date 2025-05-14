import React, { useState } from 'react';
import { Box, Heading, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure, FormControl, FormLabel, Input, Select } from '@chakra-ui/react';

const AgendamentosPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    cliente: '',
    servico: '',
    data: '',
    hora: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    // Lógica para salvar o novo agendamento
    onClose();
  };

  return (
    <Box>
      <Heading>Agendamentos</Heading>
      <Button onClick={onOpen}>Novo Agendamento</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Novo Agendamento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Cliente</FormLabel>
              <Select name="cliente" onChange={handleInputChange} value={formData.cliente}>
                <option value="1">Maria Silva</option>
                <option value="2">João Santos</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Serviço</FormLabel>
              <Select name="servico" onChange={handleInputChange} value={formData.servico}>
                <option value="1">Corte de Cabelo</option>
                <option value="2">Manicure</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Data</FormLabel>
              <Input type="date" name="data" onChange={handleInputChange} value={formData.data} />
            </FormControl>
            <FormControl>
              <FormLabel>Hora</FormLabel>
              <Input type="time" name="hora" onChange={handleInputChange} value={formData.hora} />
            </FormControl>
            <Button mt={4} onClick={handleSubmit}>Salvar</Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Lista de agendamentos */}
      {appointments.map(appointment => (
        <Box key={appointment.id}>
          <p>{appointment.cliente.nome}</p>
        </Box>
      ))}
    </Box>
  );
};

export default AgendamentosPage;
