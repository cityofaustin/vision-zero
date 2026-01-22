import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { FaFilePdf } from "react-icons/fa6";
import AlignedLabel from "@/components/AlignedLabel";
import { Crash } from "@/types/crashes";
import { useGetToken } from "@/utils/auth";

// Downloads pdf from the CR3 API and opens it in a new tab
export const onDownloadCR3 = async ({
  crash,
  getToken,
}: {
  crash: Crash;
  getToken: () => Promise<string | undefined>;
}) => {
  const requestUrl = `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/cr3/download/${crash.record_locator}`;

  try {
    const token = await getToken();
    const response = await fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(responseText);
      window.alert(`Failed to download CR3: ${String(responseText)}`);
    } else {
      const responseJson = await response.json();
      const win = window.open(responseJson.message, "_blank");
      win?.focus();
    }
  } catch (error) {
    console.error(error);
    window.alert(`Failed to download CR3: An unknown error has occured`);
  }
};

/**
 * Card component that renders the crash narrative and a download Crash Report button
 */
export default function CrashNarrativeCard({ crash }: { crash: Crash }) {
  const getToken = useGetToken();

  const isCr3Stored = crash.cr3_stored_fl;

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between">
        <Card.Title>Narrative</Card.Title>
        <Button
          size="sm"
          onClick={() => onDownloadCR3({ crash, getToken })}
          disabled={!isCr3Stored}
        >
          <AlignedLabel>
            <FaFilePdf className="me-2" />
            <span>Open crash report</span>
          </AlignedLabel>
        </Button>
      </Card.Header>
      <Card.Body className="crash-header-card-body">
        <Card.Text>{crash.investigator_narrative || ""}</Card.Text>
      </Card.Body>
    </Card>
  );
}
