#!/bin/bash

# Scripts de test pour SmartManager
set -e

echo "Tests SmartManager - $(date)"

BASE_URL=${TEST_BASE_URL:-"http://localhost:3000"}

# Test de base
echo "Test de base..."
curl -f $BASE_URL/api/health || {
    echo "Health check failed!"
    exit 1
}

# Test d'authentification
echo "Test d'authentification..."
TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@smartmanager.com","password":"admin123"}' | \
    grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Auth test failed!"
    exit 1
fi

# Test de rate limiting
echo "Test de rate limiting..."
RATE_LIMITED=false
for i in {1..6}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"wrong"}')
    
    if [ "$STATUS" = "429" ]; then
        RATE_LIMITED=true
        break
    fi
done

if [ "$RATE_LIMITED" = false ]; then
    echo "Rate limiting test failed!"
    exit 1
fi

# Test des routes protégées
echo "Test des routes protégées..."
curl -f -H "Authorization: Bearer $TOKEN" $BASE_URL/api/categories || {
    echo "Protected route test failed!"
    exit 1
}

# Test de performance
echo "Test de performance..."
START_TIME=$(date +%s%3N)
curl -f $BASE_URL/dashboard > /dev/null
END_TIME=$(date +%s%3N)
LOAD_TIME=$((END_TIME - START_TIME))

if [ $LOAD_TIME -gt 3000 ]; then
    echo "Performance test failed! Load time: ${LOAD_TIME}ms"
    exit 1
fi

echo "Tous les tests passés!"
echo "Load time: ${LOAD_TIME}ms"
echo "Rate limiting: OK"
echo "Auth: OK"
echo "Health check: OK"
