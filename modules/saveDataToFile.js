import { open } from 'node:fs/promises'

export default async function saveDataToFile(data, fileName) {
  let linksFile
  try {
    linksFile = await open(fileName, 'w')
    await linksFile.write(data)
  } finally {
    linksFile?.close()
  }
}
