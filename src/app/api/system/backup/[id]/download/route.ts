import { NextRequest, NextResponse } from 'next/server'

// GET /api/system/backup/[id]/download - Télécharger une sauvegarde
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Dans une vraie application, retourner le fichier de sauvegarde
    // Pour l'instant, simuler un téléchargement
    console.log(`Téléchargement de la sauvegarde ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Téléchargement démarré',
      data: {
        backupId: id,
        downloadUrl: `/api/system/backup/${id}/file`,
        filename: `backup_${id}.zip`
      }
    })

  } catch (error) {
    console.error('Erreur GET /api/system/backup/download:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du téléchargement de la sauvegarde' },
      { status: 500 }
    )
  }
}
