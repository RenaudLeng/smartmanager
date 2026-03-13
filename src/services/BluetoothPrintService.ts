export interface BluetoothPrinter {
  id: string
  name: string
  address: string
  connected: boolean
}

export interface PrintTicketData {
  orderId: string
  orderNumber: string
  customerName: string
  businessName: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  totalAmount: number
  paymentMethod: string
  date: string
  tableNumber?: string
}

export class BluetoothPrintService {
  private printers: BluetoothPrinter[] = []
  private isScanning = false
  private isSupported = false

  constructor() {
    this.checkSupport()
  }

  checkSupport() {
    this.isSupported = !!(typeof window === 'undefined') && 'bluetooth' in navigator
    return this.isSupported
  }

  async scanForPrinters(): Promise<BluetoothPrinter[]> {
    if (!this.isSupported) {
      console.warn('Bluetooth non supporté sur cet appareil')
      return []
    }

    this.isScanning = true
    
    try {
      // Simulation pour le développement
      const mockPrinters: BluetoothPrinter[] = [
        {
          id: 'printer-1',
          name: 'Imprimante Bluetooth',
          address: 'BT-Printer-001',
          connected: true
        },
        {
          id: 'printer-2', 
          name: 'Imprimante Ticket',
          address: 'BT-Ticket-002',
          connected: true
        }
      ]
      
      this.printers = mockPrinters
      return mockPrinters
    } catch (error) {
      console.error('Erreur scan Bluetooth:', error)
      return []
    } finally {
      this.isScanning = false
    }
  }

  async printTicket(ticketData: PrintTicketData, printerId?: string): Promise<void> {
    const printer = printerId 
      ? this.printers.find(p => p.id === printerId)
      : this.printers[0]

    if (!printer) {
      console.warn('Aucune imprimante disponible')
      return
    }

    // Créer le contenu du ticket au format texte simple
    const ticketContent = this.generateTicketContent(ticketData)
    
    console.log('Impression du ticket via Bluetooth:', {
      printer: printer.name,
      orderId: ticketData.orderId,
      content: ticketContent.substring(0, 100) + '...'
    })

    // Simulation de l'impression
    await this.simulatePrint(ticketContent)
  }

  private generateTicketContent(ticketData: PrintTicketData): string {
    const lines = [
      '='.repeat(40),
      `${ticketData.businessName || 'SMARTMANAGER'}`,
      '='.repeat(40),
      `TICKET #${ticketData.orderNumber}`,
      '='.repeat(40),
      `Date: ${ticketData.date}`,
      `Client: ${ticketData.customerName}`,
      ticketData.tableNumber && `Table: ${ticketData.tableNumber}`,
      '='.repeat(40),
      'ARTICLES:',
      ...ticketData.items.map(item => 
        `${item.quantity}x ${item.name} - ${(item.price * item.quantity).toLocaleString('fr-GA')} XAF`
      ),
      '='.repeat(40),
      `TOTAL: ${ticketData.totalAmount.toLocaleString('fr-GA')} XAF`,
      `Paiement: ${ticketData.paymentMethod}`,
      '='.repeat(40),
      'Merci de votre visite!',
      '='.repeat(40)
    ]

    return lines.join('\n')
  }

  private async simulatePrint(content: string): Promise<void> {
    // Simulation de l'impression
    console.log('Contenu à imprimer:', content)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  getAvailablePrinters(): BluetoothPrinter[] {
    return this.printers
  }

  isConnected(): boolean {
    return this.printers.length > 0
  }
}

// Service singleton
export const bluetoothPrintService = new BluetoothPrintService()
