import { useState, useEffect } from "react";
import { fetchImage } from "@/features/FileStorage/api/file-storage.api";

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    fallback?: React.ReactNode;
}

export function SecureImage({ src, fallback, ...props }: SecureImageProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let objectUrl: string | null = null;
        let isMounted = true;

        const loadImage = async () => {
            try {
                // If it's a full URL or data URI, just use it
                if (src.startsWith("http") || src.startsWith("data:")) {
                    setImageSrc(src);
                    return;
                }
                
                const url = await fetchImage(src);
                if (isMounted) {
                    setImageSrc(url);
                    objectUrl = url;
                }
            } catch (err) {
                if (isMounted) setError(true);
            }
        };

        if (src) {
            setError(false);
            loadImage();
        }

        return () => {
            isMounted = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [src]);

    if (error || !imageSrc) {
        return fallback ? <>{fallback}</> : <div className="bg-slate-100 w-full h-full animate-pulse" />;
    }

    return <img src={imageSrc} {...props} />;
}
