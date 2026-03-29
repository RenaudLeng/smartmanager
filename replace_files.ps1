# Script PowerShell pour remplacer les fichiers
param(
    [string]$oldFile,
    [string]$newFile
)

# Supprimer l'ancien fichier s'il existe
if (Test-Path $oldFile) {
    Remove-Item $oldFile -Force
}

# Copier le nouveau fichier
Copy-Item $newFile $oldFile

Write-Host "Remplacement: $oldFile -> $newFile"
