export async function convertToPdf(docx: Uint8Array): Promise<Blob> {
  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(docx)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'surat.docx')
  return await $fetch<Blob>('/api/convert', { method: 'POST', body: form, responseType: 'blob', retry: 0 })
}
