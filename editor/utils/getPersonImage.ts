import { useEffect, useState } from "react";
import { useGetToken } from "@/utils/auth";

export const useGetPersonImage = (personId: number) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = useGetToken();

  useEffect(() => {
    const fetchImage = async () => {
      if (!personId) {
        setImageUrl(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const token = await getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/images/person/${personId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // No image exists
        if (response.status === 404) {
          setImageUrl(null);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setImageUrl(data.url);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching person image:", err);
        setImageUrl(null);
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [personId, getToken]);

  return {
    imageUrl,
    isLoading,
    setImageUrl,
  };
};
