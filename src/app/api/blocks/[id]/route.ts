import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { blockSchema } from '@/lib/validators'
import { updateBlock, deleteBlock } from '@/services/block.service'
import { validateSecurityMiddleware } from '@/middleware/index'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting only (no CSRF for GET)
  const securityError = await validateSecurityMiddleware(request, { skipCsrf: true })
  if (securityError) return securityError

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const { id } = await params

    const block = await prisma.block.findUnique({
      where: { id },
      include: {
        resource: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!block) {
      return NextResponse.json({ error: 'Block niet gevonden' }, { status: 404 })
    }

    return NextResponse.json({ block })
  } catch (error) {
    console.error('Get block error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Security validation (CSRF + rate limiting)
  const securityError = await validateSecurityMiddleware(request)
  if (securityError) return securityError

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const validatedData = blockSchema.partial().safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const block = await updateBlock(id, session.user.id, validatedData.data)

    return NextResponse.json({ block })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Block niet gevonden') {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    console.error('Update block error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Security validation (CSRF + rate limiting)
  const securityError = await validateSecurityMiddleware(request)
  if (securityError) return securityError

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const { id } = await params
    const result = await deleteBlock(id, session.user.id)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Block niet gevonden') {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    console.error('Delete block error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
