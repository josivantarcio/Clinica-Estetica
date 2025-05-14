import { NextResponse } from 'next/server';
import CategoriaServico from '@/models/CategoriaServico';

export async function GET() {
  try {
    const categorias = await CategoriaServico.findAll();
    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias de serviço:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categorias de serviço' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const categoria = await CategoriaServico.create(data);
    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria de serviço:', error);
    return NextResponse.json(
      { error: 'Erro ao criar categoria de serviço' },
      { status: 500 }
    );
  }
} 