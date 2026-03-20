import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Données mock pour les produits (sans authentification pour le développement)
    const products = [
      {
        id: '1',
        name: 'Riz gabonais 1kg',
        price: 1500,
        stock: 50,
        minStock: 10,
        category: 'Alimentaire',
        lastUpdated: '2024-03-10',
        status: 'in_stock',
        supplier: 'Import Gabon',
        image: undefined
      },
      {
        id: '2',
        name: 'Huile de palme 1L',
        price: 2500,
        stock: 8,
        minStock: 10,
        category: 'Alimentaire',
        lastUpdated: '2024-03-10',
        status: 'low_stock',
        supplier: 'Société Palmier',
        image: undefined
      },
      {
        id: '3',
        name: 'Poulet congelé 5kg',
        price: 15000,
        stock: 0,
        minStock: 5,
        category: 'Viande',
        lastUpdated: '2024-03-09',
        status: 'out_of_stock',
        supplier: 'Gabon Frigorifique',
        image: undefined
      },
      {
        id: '4',
        name: 'Tomates 1kg',
        price: 2000,
        stock: 25,
        minStock: 15,
        category: 'Légumes',
        lastUpdated: '2024-03-10',
        status: 'in_stock',
        supplier: 'Maraîcher Local',
        image: undefined
      },
      {
        id: '5',
        name: 'Pain de mie',
        price: 800,
        stock: 3,
        minStock: 10,
        category: 'Boulangerie',
        lastUpdated: '2024-03-10',
        status: 'low_stock',
        supplier: 'Boulangerie du Centre',
        image: undefined
      },
      {
        id: '6',
        name: 'Sucre 1kg',
        price: 1200,
        stock: 45,
        minStock: 20,
        category: 'Épicerie',
        lastUpdated: '2024-03-08',
        status: 'in_stock',
        supplier: 'Sucrierie du Gabon',
        image: undefined
      },
      {
        id: '7',
        name: 'Lait 1L',
        price: 1800,
        stock: 12,
        minStock: 15,
        category: 'Produits laitiers',
        lastUpdated: '2024-03-10',
        status: 'low_stock',
        supplier: 'Laiterie Gabonaise',
        image: undefined
      },
      {
        id: '8',
        name: 'Farine 1kg',
        price: 2500,
        stock: 30,
        minStock: 25,
        category: 'Épicerie',
        lastUpdated: '2024-03-09',
        status: 'in_stock',
        supplier: 'Moulin du Gabon',
        image: undefined
      }
    ]

    // Parse les paramètres de recherche
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')

    let filteredProducts = products

    // Filtrer par recherche
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtrer par catégorie
    if (categoryId) {
      filteredProducts = filteredProducts.filter(product =>
        product.category === categoryId
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredProducts,
      total: filteredProducts.length
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du chargement des produits' 
      },
      { status: 500 }
    )
  }
}
