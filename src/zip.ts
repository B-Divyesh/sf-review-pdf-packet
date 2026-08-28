const encoder = new TextEncoder();

function crcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

const table = crcTable();
export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDate(date: Date): [number, number] {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const year = Math.max(1980, date.getFullYear());
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return [time, day];
}

function view(size: number): { bytes: Uint8Array; data: DataView } {
  const buffer = new ArrayBuffer(size);
  return { bytes: new Uint8Array(buffer), data: new DataView(buffer) };
}

export interface ZipEntry { name: string; data: Uint8Array }

export function createZip(entries: ZipEntry[]): Blob {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  const now = dosDate(new Date());

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const checksum = crc32(entry.data);
    const local = view(30 + name.length);
    local.data.setUint32(0, 0x04034b50, true);
    local.data.setUint16(4, 20, true);
    local.data.setUint16(6, 0x0800, true);
    local.data.setUint16(8, 0, true);
    local.data.setUint16(10, now[0], true);
    local.data.setUint16(12, now[1], true);
    local.data.setUint32(14, checksum, true);
    local.data.setUint32(18, entry.data.length, true);
    local.data.setUint32(22, entry.data.length, true);
    local.data.setUint16(26, name.length, true);
    local.bytes.set(name, 30);
    localParts.push(local.bytes, entry.data);

    const central = view(46 + name.length);
    central.data.setUint32(0, 0x02014b50, true);
    central.data.setUint16(4, 20, true);
    central.data.setUint16(6, 20, true);
    central.data.setUint16(8, 0x0800, true);
    central.data.setUint16(10, 0, true);
    central.data.setUint16(12, now[0], true);
    central.data.setUint16(14, now[1], true);
    central.data.setUint32(16, checksum, true);
    central.data.setUint32(20, entry.data.length, true);
    central.data.setUint32(24, entry.data.length, true);
    central.data.setUint16(28, name.length, true);
    central.data.setUint32(42, offset, true);
    central.bytes.set(name, 46);
    centralParts.push(central.bytes);
    offset += local.bytes.length + entry.data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = view(22);
  end.data.setUint32(0, 0x06054b50, true);
  end.data.setUint16(8, entries.length, true);
  end.data.setUint16(10, entries.length, true);
  end.data.setUint32(12, centralSize, true);
  end.data.setUint32(16, offset, true);
  return new Blob([...localParts, ...centralParts, end.bytes] as BlobPart[], { type: 'application/zip' });
}
