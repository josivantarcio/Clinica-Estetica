import { NextResponse } from 'next/server';
import RecompensaFidelidade from '@/models/RecompensaFidelidade';

export async function GET() {
  try {
    const recompensas = await RecompensaFidelidade.findAll();
    return NextResponse.json(recompensas);
  } catch (error) {
    console.error('Erro ao buscar recompensas de fidelidade:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar recompensas de fidelidade' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const recompensa = await RecompensaFidelidade.create(data);
    return NextResponse.json(recompensa, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar recompensa de fidelidade:', error);
    return NextResponse.json(
      { error: 'Erro ao criar recompensa de fidelidade' },
      { status: 500 }
    );
  }
} 