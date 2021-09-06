export default async function fetchBytes(url: string): Promise<Uint8Array> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw response.statusText;
        }
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        return bytes;
    } catch (err) {
        throw `An error occured whilst attempting to retrieve "${url}": ${err}`;
    }
}
