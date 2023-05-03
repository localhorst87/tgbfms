/**
 * Get the current unix timestamp in seconds (NOT milliseconds!)
 *
 * @return {number} Unix timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor((new Date()).getTime() / 1000); // alternatively Date.now()/1000
}

/**
 * Get the information if Daylight Savings Time (DST) is observed
 * for a specific date. If not date string is given, the current
 * date will be used.
 *
 * @param {string} [date] date to check
 * @return {boolean} returns true if currently DST in observed
 */
export function isDstObserved(date?: string): boolean {
  let observedDate: Date = typeof(date) === "undefined" ? new Date() : new Date(date);
  
  const jan = new Date(0, 1);
  const jul = new Date(6, 1);
  const stdTimezoneOffset: number = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());

  return observedDate.getTimezoneOffset() < stdTimezoneOffset;
}

/**
 * Get the information if a Date string is given for UTC time zone
 * @param {string} datestring the ISO datestring to investigate
 * @return {boolean} returns true if Date string is given for UTC time zone
 */
export function isDatestringUTC(datestring: string): boolean {
  let isNotationZ: boolean = datestring[datestring.length - 1] == "Z";
  let isNotationPlus0: boolean = datestring.substring(datestring.length - 6, datestring.length) == "+00:00";

  return isNotationZ || isNotationPlus0;
}

/**
 * Get the end Date of the following days, given by nextDays.
 * If nextDays = 0, it will return 23:59:59 of the same day.
 * If nextDays = 1, it will return 23:59:59 of the next day.
 * Everything in LOCAL time.
 *
 * @param nextDays The day span of the future date
 * @return future timestamp
 */
export function getFutureEndDate(nextDays: number): number {
  let dateFuture: Date = new Date(Date.now() + nextDays * 86400 * 1000);
  // const hOffset: number = dateFuture.getTimezoneOffset(); // following constructor is considering UTC
  dateFuture = new Date(dateFuture.getFullYear(), dateFuture.getMonth(), dateFuture.getDate(), 23, 59, 59); // ceil to end of day
  return Math.floor(dateFuture.getTime() / 1000);
}
