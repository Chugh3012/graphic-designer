import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'
import { getFileKey } from '@payloadcms/plugin-cloud-storage/utilities'
import { BlobServiceClient, type ContainerClient } from '@azure/storage-blob'
import { DefaultAzureCredential } from '@azure/identity'

type Args = {
  accountName: string
  containerName: string
  /** Public base URL for the storage account, e.g. https://acct.blob.core.windows.net */
  baseURL: string
}

/**
 * Payload cloud-storage adapter for Azure Blob authenticated with a managed
 * identity (DefaultAzureCredential) — no account key or connection string.
 *
 * The media container is public-read, so files are served directly from the blob
 * URL (generateURL) and the static handler simply redirects there.
 *
 * ponytail: minimal adapter (upload / delete / url / redirect). Ceiling: no
 * range-request streaming proxied through Payload — unnecessary for a public-read
 * media container. Upgrade path: port the SDK's getFile range logic if access
 * control is ever enabled.
 */
export function azureBlobManagedIdentity({ accountName, containerName, baseURL }: Args): Adapter {
  let cached: ContainerClient | undefined
  const client = (): ContainerClient => {
    if (!cached) {
      cached = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential(),
      ).getContainerClient(containerName)
    }
    return cached
  }

  return ({ prefix = '' }): GeneratedAdapter => ({
    name: 'azure-managed-identity',
    generateURL: ({ filename, prefix: docPrefix = '' }) => {
      const { fileKey } = getFileKey({ collectionPrefix: prefix, docPrefix, filename })
      return `${baseURL}/${containerName}/${fileKey}`
    },
    handleUpload: async ({ data, file }) => {
      const { fileKey } = getFileKey({
        collectionPrefix: prefix,
        docPrefix: (data as { prefix?: string }).prefix || '',
        filename: file.filename,
      })
      await client()
        .getBlockBlobClient(fileKey)
        .uploadData(file.buffer, { blobHTTPHeaders: { blobContentType: file.mimeType } })
      return data
    },
    handleDelete: async ({ doc: { prefix: docPrefix = '' }, filename }) => {
      const { fileKey } = getFileKey({ collectionPrefix: prefix, docPrefix, filename })
      await client().getBlockBlobClient(fileKey).deleteIfExists()
    },
    staticHandler: (_req, { params: { filename, prefix: docPrefix = '' } }) => {
      const { fileKey } = getFileKey({ collectionPrefix: prefix, docPrefix, filename })
      return Response.redirect(`${baseURL}/${containerName}/${fileKey}`, 302)
    },
  })
}
