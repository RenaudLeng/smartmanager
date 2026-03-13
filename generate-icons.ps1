# Script PowerShell pour générer des icônes SVG pour SmartManager
# Créé par SmartManager Team

# Tailles des icônes à générer
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

# Fonction pour générer un SVG
function New-Icon($size) {
    $rectSize = [math]::Round($size * 0.1389)
    $path1 = "M$($size * 0.5) $($size * 0.25) C$($size * 0.6387) $($size * 0.25) $($size * 0.75) $($size * 0.5) $($size * $size) $($size * 0.75) C$($size * 0.8613) $($size * $size) $($size * 0.75) $($size * 0.8613) C$($size) $($size * 0.75) $($size * 0.1389) $($size * $size) $($size * 0.1389) C$($size * 0.1389) $($size * 0.25) $($size * 0.25) $($size * 0.5) $($size * 0.5) C$($size * 0.25) $($size * 0.1389) $($size * 0.1389) $($size * 0.5) $($size * 0.5) Z"
    $path2 = "M$($size * 0.583) $($size * 0.333) C$($size * 0.592) $($size * 0.333) $($size * 0.667) $($size * 0.333) C$($size * 0.708) $($size * 0.333) $($size * 0.75) $($size * 0.333) C$($size * 0.792) $($size * 0.333) $($size * 0.833) $($size * 0.333) C$($size * 0.833) $($size * 0.833) $($size * 0.667) $($size * 0.667) C$($size * 0.833) $($size * 0.833) $($size * 0.833) $($size) $($size * 0.667) $($size * 0.667) C$($size * 0.667) $($size * 0.833) $($size * 0.833) $($size * 0.833) $($size * 0.667) $($size * 0.667) Z"
    
    $svg = "<svg width=""$size"" height=""$size"" viewBox=""0 0 $size $size"" fill=""none"" xmlns=""http://www.w3.org/2000/svg""><rect width=""$size"" height=""$size"" rx=""$rectSize"" fill=""#F97316""/><path d=""$path1"" fill=""white""/><path d=""$path2"" fill=""#F97316""/></svg>"
    
    # Sauvegarder le SVG dans un fichier temporaire
    $svg | Out-File -FilePath "temp-icon-$size.svg" -Encoding utf8
    
    Write-Host "✅ SVG $size x $size généré"
}

# Générer tous les SVG
foreach ($size in $sizes) {
    New-Icon $size
}

Write-Host "🎯 Génération des icônes SVG terminée !"
Write-Host "📁 Fichiers SVG créés dans le répertoire courant"
Write-Host "🔄 Utilisez ImageMagick pour convertir en PNG si nécessaire:"
Write-Host "   magick convert temp-icon-144x144.svg icon-144x144.png"

# Si ImageMagick est disponible, convertir tous les SVG en PNG
if (Get-Command "magick" -ErrorAction SilentlyContinue) {
    Write-Host "🔄 Conversion des SVG en PNG avec ImageMagick..."
    foreach ($size in $sizes) {
        try {
            magick convert "temp-icon-$size.svg" "icon-$size.png"
            Write-Host "✅ icon-$size.png généré"
            Remove-Item "temp-icon-$size.svg"
        } catch {
            Write-Host "❌ Erreur pour la conversion de icon-$size.png"
        }
    }
}

Write-Host "🎯 Tous les icônes sont maintenant valides !"
