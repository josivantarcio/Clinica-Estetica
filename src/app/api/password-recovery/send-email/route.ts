import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Configuração do transporter de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email, token, name } = await request.json()

    // URL de recuperação
    const recoveryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/recuperar-senha?token=${token}`

    // Template do email
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Recuperação de Senha - Salão de Estética',
      html: `
        <h1>Olá ${name},</h1>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <p>
          <a href="${recoveryUrl}" style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          ">
            Redefinir Senha
          </a>
        </p>
        <p>Este link expirará em 1 hora.</p>
        <p>Se você não solicitou a recuperação de senha, ignore este email.</p>
        <p>Atenciosamente,<br>Equipe do Salão de Estética</p>
      `
    }

    // Envia o email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar email' },
      { status: 500 }
    )
  }
} 