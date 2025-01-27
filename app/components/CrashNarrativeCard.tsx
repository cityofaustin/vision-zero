import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { FaFilePdf } from "react-icons/fa6";

import AlignedLabel from "@/components/AlignedLabel";
import { Crash } from "@/types/crashes";
import { useToken } from "@/utils/auth";

export default function CrashNarrativeCard({ crash }: { crash: Crash }) {
  const token = useToken();

  const onDownloadCR3 = async () => {
    const requestUrl = `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/cr3/download/${crash.id}`;

    fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Request failed");
        }
      })
      .then((data) => {
        const win = window.open(data.message, "_blank");
        win?.focus();
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error(error);
      });
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between">
        Narrative
        <Button size="sm" onClick={onDownloadCR3}>
          <AlignedLabel>
            <FaFilePdf className="me-2" />
            <span>Download CR3</span>
          </AlignedLabel>
        </Button>
      </Card.Header>
      <Card.Body className="crash-header-card-body">
        <Card.Text>{crash.investigator_narrative || ""}</Card.Text>
      </Card.Body>
    </Card>
  );
}
