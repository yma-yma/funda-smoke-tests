export function agentProfileId(href: string | null): string | null {
  return href?.match(/\/makelaar\/(\d+)/)?.[1] ?? null;
}

/**
 * Extracts the amount from a price label.
 *
 * Funda abbreviates the unit differently depending on where the price is shown:
 * a search result card says "€ 3.500 p.m.", the listing page says "€ 3.500 /mnd",
 * and sale prices carry "k.k." or "v.o.n.". Only the amount is comparable
 * between pages.
 */
export function getPriceAmount(price: string): string {
  return price.match(/[\d.]+/)?.[0] ?? '';
}
