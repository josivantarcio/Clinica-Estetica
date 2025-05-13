import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/config/database-init';

export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({ message: 'Banco de dados inicializado com sucesso' });
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return NextResponse.json(
      { error: 'Erro ao inicializar banco de dados' },
      { status: 500 }
    );
  }
} 