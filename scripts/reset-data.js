// Script pour réinitialiser toutes les données SmartManager
// À exécuter dans la console du navigateur

console.log('🗑️  RÉINITIALISATION COMPLÈTE DES DONNÉES SMARTMANAGER');

// 1. Vider localStorage
console.log('📁 Vidage localStorage...');
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('userData');
localStorage.removeItem('tenantData');
localStorage.removeItem('notifications');
localStorage.removeItem('notificationPreferences');
localStorage.removeItem('smartAlertConfig');

// 2. Vider sessionStorage
console.log('📁 Vidage sessionStorage...');
sessionStorage.clear();

// 3. Vider les données des API (simulation)
// Note: Les données seront réinitialisées au prochainement redémarrage du serveur

console.log('✅ Données locales vidées avec succès!');
console.log('🔄 Redémarrage du serveur nécessaire pour vider les données API...');
console.log('');
console.log('📋 ÉTAPES SUIVANTES :');
console.log('1. Rafraîchir la page (F5)');
console.log('2. Redémarrer le serveur de développement');
console.log('3. Se reconnecter avec de nouvelles données');

// Rafraîchir automatiquement après 2 secondes
setTimeout(() => {
  console.log('🔄 Rafraîchissement de la page...');
  window.location.reload();
}, 2000);
