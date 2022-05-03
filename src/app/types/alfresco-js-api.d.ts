//declare module ContentApi {
    declare class ContentApi {
            /**
                * Get thumbnail URL for the given nodeId
                *
                * @param nodeId The ID of the document node
                * @param [attachment=false] Retrieve content as an attachment for download
                * @param [ticket] Custom ticket to use for authentication
                * @returns The URL address pointing to the content.
                */
            getDocumentThumbnailUrl(nodeId: string, attachment?: boolean, ticket?: string): string;
            /**
                * Get preview URL for the given nodeId
                *
                * @param nodeId The ID of the document node
                * @param  [attachment=false] Retrieve content as an attachment for download
                * @param [ticket] Custom ticket to use for authentication
                * @returns  The URL address pointing to the content.
                */
            getDocumentPreviewUrl(nodeId: string, attachment?: boolean, ticket?: string): string;
            /**
                * Get content URL for the given nodeId
                *
                * @param  nodeId The ID of the document node
                * @param  [attachment=false] Retrieve content as an attachment for download
                * @param  [ticket] Custom ticket to use for authentication
                * @returns The URL address pointing to the content.
                */
            getContentUrl(nodeId: string, attachment?: boolean, ticket?: string): string;
            /**
                * Get rendition URL for the given nodeId
                *
                * @param nodeId The ID of the document node
                * @param encoding of the document
                * @param [attachment=false] retrieve content as an attachment for download
                * @param [ticket] Custom ticket to use for authentication
                * @returns The URL address pointing to the content.
                */
            getRenditionUrl(nodeId: string, encoding: string, attachment?: boolean, ticket?: string): string;
            /**
                * Get version's rendition URL for the given nodeId
                *
                * @param nodeId The ID of the document node
                * @param versionId The ID of the version
                * @param encoding of the document
                * @param [attachment=false] retrieve content as an attachment for download
                * @param [ticket] Custom ticket to use for authentication
                * @returns The URL address pointing to the content.
                */
            getVersionRenditionUrl(nodeId: string, versionId: string, encoding: string, attachment?: boolean, ticket?: string): string;
            /**
                * Get content URL for the given nodeId and versionId
                *
                * @param  nodeId The ID of the document node
                * @param versionId The ID of the version
                * @param  [attachment=false] Retrieve content as an attachment for download
                * @param  [ticket] Custom ticket to use for authentication
                * @returns The URL address pointing to the content.
                */
            getVersionContentUrl(nodeId: string, versionId: string, attachment?: boolean, ticket?: string): string;
            /**
                * Get content url for the given shared link id
                *
                * @param linkId - The ID of the shared link
                * @param  [attachment=false] Retrieve content as an attachment for download
                * @returns  The URL address pointing to the content.
                */
            getSharedLinkContentUrl(linkId: string, attachment?: boolean): string;
            /**
                * Gets the rendition content for file with shared link identifier sharedId.
                *
                * @param  sharedId - The identifier of a shared link to a file.
                * @param  renditionId - The name of a thumbnail rendition, for example doclib, or pdf.
                * @param [attachment=false] Retrieve content as an attachment for download
                * @returns The URL address pointing to the content.
                */
            getSharedLinkRenditionUrl(sharedId: string, renditionId: string, attachment?: boolean): string;
    }
//}
