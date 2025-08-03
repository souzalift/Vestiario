import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request: Request) {
  try {
    console.log('🔄 Iniciando processo de login...');

    await connectToDatabase();
    console.log('✅ Conectado ao banco');

    const { email, password } = await request.json();
    console.log('📧 Email recebido:', email);

    if (!email || !password) {
      console.log('❌ Email ou senha em branco');
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário no banco
    const user = await AdminUser.findOne({
      email: email.toLowerCase(),
      isActive: true
    }).lean() as (typeof AdminUser.schema extends { obj: infer T } ? T & { _id: any } : any) | null; // Tipar explicitamente para incluir password

    console.log('👤 Usuário encontrado:', user ? 'Sim' : 'Não');

    if (!user) {
      console.log('❌ Usuário não encontrado ou inativo');
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar senha
    if (typeof user.password !== 'string') {
      console.log('❌ Senha do usuário não encontrada ou inválida');
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Senha válida:', isValidPassword ? 'Sim' : 'Não');

    if (!isValidPassword) {
      console.log('❌ Senha incorreta');
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Atualizar último login
    await AdminUser.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    });

    console.log('✅ Login bem-sucedido');

    // Converter permissions para array simples de strings
    const permissions = Array.isArray(user.permissions)
      ? user.permissions.map(p => String(p))
      : [];

    // Gerar JWT com dados serializáveis
    const token = await new SignJWT({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: permissions, // Array de strings simples
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .sign(secret);

    console.log('🔑 Token JWT gerado com sucesso');

    // Criar resposta com cookie httpOnly
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: permissions,
      },
    });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    console.log('🍪 Cookie definido com sucesso');
    return response;

  } catch (error) {
    console.error('❌ Erro no login:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}