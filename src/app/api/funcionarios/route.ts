import { NextResponse } from 'next/server';
import Funcionario from '@/models/Funcionario';

export async function GET() {
  try {
    const funcionarios = await Funcionario.findAll();
    return NextResponse.json(funcionarios);
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar funcionários' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const funcionario = await Funcionario.create(data);
    return NextResponse.json(funcionario, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar funcionário' },
      { status: 500 }
    );
  }
} 