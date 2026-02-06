import { useState, useEffect } from "react";
import { useGetToken } from "@/utils/auth";

interface useImageProps {
  recordId: number | string;
  recordType: "person" | "crash_diagram";
  /** optional number which when modified will trigger a refetch */
  imageVersion?: number;
}

interface UseImageReturn {
  /**
   * The presigned AWS URL
   */
  imageUrl: string | null;
  /**
   * If the image URL is being retrieved
   */
  isLoading: boolean;
  /**
   * An Error instance
   */
  error: Error | null;
  /**
   * Refetch function that can be called to retrieve a fresh version of the image
   */
  refetch: () => void;
}

/**
 * Hook which fetches an auth-protected AWS image URL from the API
 */
export function useImage({
  recordId,
  recordType,
  imageVersion = 0,
}: useImageProps): UseImageReturn {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);
  const getToken = useGetToken();

  useEffect(() => {
    const fetchImage = async () => {
      if (!recordId) {
        setImageUrl(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      if (!getToken) {
        return;
      }

      try {
        const token = await getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/images/${recordType}/${recordId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setImageUrl(data.url);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching person image:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setImageUrl(null);
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [recordId, getToken, imageVersion, refetchCounter]);

  const refetch = () => setRefetchCounter((c) => c + 1);

  return { imageUrl, isLoading, error, refetch };
}
