import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { FaFilePdf } from "react-icons/fa6";
import AlignedLabel from "@/components/AlignedLabel";
import { Crash } from "@/types/crashes";
import { hasRole, useGetToken, ADMIN_EDIT_ROLES } from "@/utils/auth";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";

export const allowedCrashReportDownloadRoles = ADMIN_EDIT_ROLES;

// Downloads pdf from the crash report API and opens it in a new tab
export const onDownloadCrashReport = async ({
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
      window.alert(`Failed to download Crash report: ${String(responseText)}`);
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

  const { user } = useAuth0();
  const canDownloadCrashReport = hasRole(allowedCrashReportDownloadRoles, user);

  const isCrashReportStored = crash.cr3_stored_fl;

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between">
        <Card.Title>Narrative</Card.Title>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="copy-address-tooltip" hidden={canDownloadCrashReport}>
              Only Vision Zero team members can access crash reports - contact
              them for assistance
            </Tooltip>
          }
        >
          {/* load-bearing span that enables tooltips to render over the `disabled` button */}
          <span className="d-inline-block">
            <Button
              size="sm"
              onClick={() => onDownloadCrashReport({ crash, getToken })}
              disabled={!isCrashReportStored || !canDownloadCrashReport}
            >
              <AlignedLabel>
                <FaFilePdf className="me-2" />
                <span>Open crash report</span>
              </AlignedLabel>
            </Button>
          </span>
        </OverlayTrigger>
      </Card.Header>
      <Card.Body>
        <Card.Text>{crash.investigator_narrative || ""}</Card.Text>
      </Card.Body>
    </Card>
  );
}
