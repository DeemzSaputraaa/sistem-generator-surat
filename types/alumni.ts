export interface Alumni {
  nama: string
  nim: string
  prodi: string
  tahunLulus: string
  tempatKerja: string
  whatsapp: string
}
export interface ImportResult { alumni: Alumni[]; warnings: string[]; skipped: number }
