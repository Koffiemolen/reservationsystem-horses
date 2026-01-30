import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { blockSchema } from '@/lib/validators'
import { createBlock, getBlocks } from '@/services/block.service'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId') || undefined
    const includeExpired = searchParams.get('includeExpired') === 'true'

    const blocks = await getBlocks(resourceId, includeExpired)

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('Get blocks error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const body = await request.json()
    const confirmConflicts = body.confirmConflicts === true

    const validatedData = blockSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const result = await createBlock(
      session.user.id,
      validatedData.data,
      confirmConflicts
    )

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith('CONFLICTS_EXIST:')) {
        const conflicts = JSON.parse(error.message.replace('CONFLICTS_EXIST:', ''))
        return NextResponse.json(
          {
            warning: 'CONFLICTS_EXIST',
            message: 'Er zijn reserveringen die getroffen worden door deze blokkade',
            conflicts,
            requiresConfirmation: true,
          },
          { status: 200 }
        )
      }
    }

    console.error('Create block error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
