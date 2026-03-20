// Script de réinitialisation COMPLÈTE pour SmartManager
// À exécuter dans la console du navigateur

console.clear();
console.log('🗑️  RÉINITIALISATION COMPLÈTE DE SMARTMANAGER 🗑️');
console.log('==========================================');

// 1. Vider localStorage
console.log('📁 Vidage localStorage...');
const localStorageKeys = Object.keys(localStorage);
localStorageKeys.forEach(key => {
  console.log(`  - Suppression: ${key}`);
  localStorage.removeItem(key);
});

// 2. Vider sessionStorage
console.log('📁 Vidage sessionStorage...');
const sessionStorageKeys = Object.keys(sessionStorage);
sessionStorageKeys.forEach(key => {
  console.log(`  - Suppression: ${key}`);
  sessionStorage.removeItem(key);
});

// 3. Appeler l'API de réinitialisation
console.log('🔌 Appel API de réinitialisation...');
fetch('/api/reset-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(response => {
  if (response.ok) {
    console.log('✅ API de réinitialisation: SUCCÈS');
    return response.json();
  } else {
    console.log('⚠️  API de réinitialisation: ERREUR', response.status);
    throw new Error('Erreur API');
  }
})
.then(data => {
  console.log('✅ Données réinitialisées:', data.message);
  console.log('🔄 Redirection vers la page d\'accueil dans 2 secondes...');
  
  setTimeout(() => {
    console.log('🔄 Redirection...');
    window.location.href = '/';
  }, 2000);
})
.catch(error => {
  console.log('❌ Erreur lors de la réinitialisation:', error);
  console.log('🔄 Redirection manuelle vers la page d\'accueil...');
  setTimeout(() => {
    window.location.href = '/';
  }, 3000);
});

console.log('==========================================');
console.log('✅ OPÉRATION TERMINÉE');
console.log('🔄 La page va se recharger automatiquement');
