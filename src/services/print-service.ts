/**
 * print-service.ts
 * Sends a formatted allergy ticket to an Epson ePOS Wi-Fi printer
 * using the Epson ePOS SDK for JavaScript (loaded globally via index.html).
 * Printer IP is read from localStorage key: 'wildfire_printer_ip'
 * Mock mode (localStorage 'wildfire_printer_mock' === 'true') logs and alerts ticket for testing.
 */

import type { CheckerResult } from '@/core/checker';
import type { AllergenDef } from '@/core/tenant/packTypes';

export interface PrintTicketOptions {
  checkerResult: CheckerResult;
  selectedAllergens: AllergenDef[];
  tableNumber: string;
  seatNumber: string;
  serverName?: string;
}

const MOCK_KEY = 'wildfire_printer_mock';
const PRINTER_IP_KEY = 'wildfire_printer_ip';

/** Enable mock printer mode: log ticket to console and show alert instead of printing */
export function enableMockPrinter(): void {
  localStorage.setItem(MOCK_KEY, 'true');
}

/** Disable mock printer mode */
export function disableMockPrinter(): void {
  localStorage.removeItem(MOCK_KEY);
}

/** Returns true if mock mode is enabled */
export function isMockPrinterEnabled(): boolean {
  return localStorage.getItem(MOCK_KEY) === 'true';
}

/** Returns the saved printer IP, or null if not set */
export function getPrinterIp(): string | null {
  return localStorage.getItem(PRINTER_IP_KEY);
}

/** Saves the printer IP to localStorage */
export function savePrinterIp(ip: string): void {
  localStorage.setItem(PRINTER_IP_KEY, ip.trim());
}

/** Returns true if a printer IP has been configured or mock mode is enabled */
export function canPrint(): boolean {
  if (isMockPrinterEnabled()) return true;
  const ip = getPrinterIp();
  return !!ip && ip.length > 0;
}

/** Build formatted ticket text (used for real receipt and mock alert) */
function buildTicketText(options: PrintTicketOptions): string {
  const { checkerResult, selectedAllergens, tableNumber, seatNumber, serverName } = options;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString();
  const allergenNames = selectedAllergens.map((a) => a.name.toUpperCase()).join(', ');

  const lines: string[] = [
    '        ⚠ ALLERGY TICKET ⚠',
    '--------------------------------',
    `Date: ${dateStr}   Time: ${timeStr}`,
    `Table: ${tableNumber}         Seat: ${seatNumber}`,
  ];
  if (serverName) lines.push(`Server: ${serverName}`);
  lines.push('--------------------------------', `ALLERGEN: ${allergenNames}`, '--------------------------------');

  lines.push(`DISH: ${checkerResult.mainItem.itemName}`);
  if (checkerResult.mainItem.ticketCode) {
    lines.push(`Code: ${checkerResult.mainItem.ticketCode}`);
  }

  const cons = checkerResult.mainItem.consolidated;
  if (cons) {
    if (cons.removals?.sauce?.length) lines.push(`Remove sauce: ${cons.removals.sauce.join(', ')}`);
    if (cons.removals?.garnish?.length) lines.push(`Remove garnish: ${cons.removals.garnish.join(', ')}`);
    if (cons.removals?.seasoning?.length) lines.push(`Remove seasoning: ${cons.removals.seasoning.join(', ')}`);
    if (cons.substitutions?.other?.length) lines.push(`Sub: ${cons.substitutions.other.join(', ')}`);
    if (cons.preparation?.length) lines.push(`Prep: ${cons.preparation.join(', ')}`);
    if (cons.notes?.length) lines.push(`Notes: ${cons.notes.join(', ')}`);
  }

  if (checkerResult.sideItem) {
    lines.push('--------------------------------', `SIDE: ${checkerResult.sideItem.itemName}`);
    const sc = checkerResult.sideItem.consolidated;
    if (sc?.removals?.other?.length) lines.push(`  Remove: ${sc.removals.other.join(', ')}`);
    if (sc?.notes?.length) lines.push(`  Notes: ${sc.notes.join(', ')}`);
  }

  if (checkerResult.dressingItem) {
    lines.push(`DRESSING: ${checkerResult.dressingItem.itemName}`);
  }

  lines.push('--------------------------------', `STATUS: ${checkerResult.overallStatus.replace(/_/g, ' ')}`, '--------------------------------', 'Kitchen + Server acknowledge');

  return lines.join('\n');
}

/**
 * Sends a formatted allergy ticket to the configured Epson printer.
 * Requires the Epson ePOS SDK script to be loaded in index.html.
 * When wildfire_printer_mock === 'true', logs ticket to console and shows alert instead.
 * Throws if no printer IP is configured (and not in mock) or if printing fails.
 */
export async function printAllergyTicket(options: PrintTicketOptions): Promise<void> {
  if (isMockPrinterEnabled()) {
    const text = buildTicketText(options);
    console.log('[PrintService] Mock mode: allergy ticket', text);
    alert(`[Mock Print]\n\n${text}`);
    return;
  }

  const ip = getPrinterIp();
  if (!ip) throw new Error('No printer IP configured. Please set it in Settings.');

  const { checkerResult, selectedAllergens, tableNumber, seatNumber, serverName } = options;

  const epson = (window as any).epson;
  if (!epson) throw new Error('Epson ePOS SDK not loaded.');

  const printer = new epson.ePOSDevice();

  return new Promise((resolve, reject) => {
    printer.connect(ip, 80, (result: string) => {
      if (result !== 'OK' && result !== 'SSL_CONNECT_OK') {
        reject(new Error(`Printer connection failed: ${result}`));
        return;
      }

      printer.createDevice(
        'local_printer',
        printer.DEVICE_TYPE_PRINTER,
        { crypto: false, buffer: false },
        (device: any, code: string) => {
          if (code !== 'OK') {
            reject(new Error(`Failed to create printer device: ${code}`));
            return;
          }

          const p = device;
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = now.toLocaleDateString();
          const allergenNames = selectedAllergens.map((a) => a.name.toUpperCase()).join(', ');

          p.addTextAlign(p.ALIGN_CENTER);
          p.addTextSize(2, 2);
          p.addText('⚠ ALLERGY TICKET ⚠\n');
          p.addTextSize(1, 1);
          p.addText('--------------------------------\n');

          p.addTextAlign(p.ALIGN_LEFT);
          p.addText(`Date: ${dateStr}   Time: ${timeStr}\n`);
          p.addText(`Table: ${tableNumber}         Seat: ${seatNumber}\n`);
          if (serverName) p.addText(`Server: ${serverName}\n`);
          p.addText('--------------------------------\n');

          p.addTextStyle(false, false, true, p.COLOR_1);
          p.addTextSize(1, 2);
          p.addText(`ALLERGEN: ${allergenNames}\n`);
          p.addTextSize(1, 1);
          p.addTextStyle(false, false, false, p.COLOR_1);
          p.addText('--------------------------------\n');

          p.addText(`DISH: ${checkerResult.mainItem.itemName}\n`);
          if (checkerResult.mainItem.ticketCode) {
            p.addText(`Code: ${checkerResult.mainItem.ticketCode}\n`);
          }

          const cons = checkerResult.mainItem.consolidated;
          if (cons) {
            if (cons.removals?.sauce?.length) p.addText(`Remove sauce: ${cons.removals.sauce.join(', ')}\n`);
            if (cons.removals?.garnish?.length) p.addText(`Remove garnish: ${cons.removals.garnish.join(', ')}\n`);
            if (cons.removals?.seasoning?.length) p.addText(`Remove seasoning: ${cons.removals.seasoning.join(', ')}\n`);
            if (cons.substitutions?.other?.length) p.addText(`Sub: ${cons.substitutions.other.join(', ')}\n`);
            if (cons.preparation?.length) p.addText(`Prep: ${cons.preparation.join(', ')}\n`);
            if (cons.notes?.length) p.addText(`Notes: ${cons.notes.join(', ')}\n`);
          }

          if (checkerResult.sideItem) {
            p.addText('--------------------------------\n');
            p.addText(`SIDE: ${checkerResult.sideItem.itemName}\n`);
            const sc = checkerResult.sideItem.consolidated;
            if (sc?.removals?.other?.length) p.addText(`  Remove: ${sc.removals.other.join(', ')}\n`);
            if (sc?.notes?.length) p.addText(`  Notes: ${sc.notes.join(', ')}\n`);
          }

          if (checkerResult.dressingItem) {
            p.addText(`DRESSING: ${checkerResult.dressingItem.itemName}\n`);
          }

          p.addText('--------------------------------\n');
          p.addText(`STATUS: ${checkerResult.overallStatus.replace(/_/g, ' ')}\n`);
          p.addText('--------------------------------\n');

          p.addTextAlign(p.ALIGN_CENTER);
          p.addText('Kitchen + Server acknowledge\n');
          p.addText('\n\n\n');
          p.addCut(p.CUT_FEED);

          p.send();
          printer.disconnect();
          resolve();
        }
      );
    });
  });
}
