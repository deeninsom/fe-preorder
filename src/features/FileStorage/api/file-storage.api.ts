import api from "@/lib/axios";

export interface UploadImageResponse {
    url: string;
    [key: string]: unknown;
}

export async function uploadImage(
    file: File,
    folder = "products",
): Promise<string> {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("folder", folder);

    const response =
        await api.post<UploadImageResponse>(
            "/fileStorage/image",
            formData,
        );

    if (!response.data?.url) {
        throw new Error(
            "URL gambar tidak ditemukan setelah upload.",
        );
    }

    return response.data.url;
}

export async function fetchImage(url: string): Promise<string> {
    const response = await api.get(url, {
        responseType: "blob",
    });
    return URL.createObjectURL(response.data);
}