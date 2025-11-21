import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Tab, Nav, Form } from "react-bootstrap";
import { FaFilePdf } from "react-icons/fa6";
import AlignedLabel from "@/components/AlignedLabel";
import { Crash } from "@/types/crashes";
import { useGetToken } from "@/utils/auth";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@/utils/graphql";
import { UPDATE_CRASH } from "@/queries/crash";

interface FatalityCrashNarrativeProps {
  crash: Crash;
  onSaveCallback: () => Promise<void>;
}

type FatalityNarrativeSummaryInputs = {
  narrative_summary: string;
};

/**
 * Card component that renders the crash narrative and a download CR3 button
 */
export default function FatalityCrashNarrative({
  crash,
  onSaveCallback,
}: FatalityCrashNarrativeProps) {
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState("narrative");

  const { mutate, loading: isSubmitting } = useMutation(UPDATE_CRASH);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FatalityNarrativeSummaryInputs>();

  const getToken = useGetToken();

  const isCr3Stored = crash.cr3_stored_fl;

  /**
   * Downloads pdf from the CR3 API and opens it in a new tab
   */
  const onDownloadCR3 = async () => {
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
   * Submits mutation to database on save button click
   */
  const onSubmit: SubmitHandler<FatalityNarrativeSummaryInputs> = async (
    data
  ) => {
    await mutate({
      id: crash.id,
      updates: data,
    });
    await onSaveCallback();
    setIsEditingSummary(false);
  };

  const hasSummary = !!crash.narrative_summary;

  return (
    <Card>
      <Tab.Container
        activeKey={activeTab}
        onSelect={(tab) => tab && setActiveTab(tab)}
      >
        <Card.Header className="d-flex justify-content-between border-bottom">
          <Nav variant="tabs" className="flex-row">
            <Nav.Item>
              <Nav.Link eventKey="narrative">Narrative</Nav.Link>
            </Nav.Item>
            {hasSummary && (
              <Nav.Item>
                <Nav.Link eventKey="summary">Summary</Nav.Link>
              </Nav.Item>
            )}
          </Nav>
          <Button size="sm" onClick={onDownloadCR3} disabled={!isCr3Stored}>
            <AlignedLabel>
              <FaFilePdf className="me-2" />
              <span>Download CR3</span>
            </AlignedLabel>
          </Button>
        </Card.Header>
        <Card.Body>
          <Tab.Content>
            <Tab.Pane eventKey="narrative">
              {crash.investigator_narrative || ""}
            </Tab.Pane>
            <Tab.Pane eventKey="summary">
              {isEditingSummary ? (
                <Form>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      defaultValue={
                        (crash.narrative_summary
                          ? crash.narrative_summary
                          : crash.investigator_narrative) || ""
                      }
                      rows={20}
                      isInvalid={Boolean(errors.narrative_summary)}
                      autoFocus
                      {...register("narrative_summary", { required: true })}
                    />
                    {errors.narrative_summary && (
                      <Form.Control.Feedback type="invalid">
                        Summary text is required
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Form>
              ) : (
                crash.narrative_summary || ""
              )}
            </Tab.Pane>
          </Tab.Content>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-end border-top">
          {isEditingSummary ? (
            <>
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={handleSubmit(onSubmit)}
              >
                Save summary
              </Button>
              <Button
                className="ms-1"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setIsEditingSummary(false);
                  reset();
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setIsEditingSummary(true);
                setActiveTab("summary");
              }}
            >
              {hasSummary ? "Edit summary" : "Add summary"}
            </Button>
          )}
        </Card.Footer>
      </Tab.Container>
    </Card>
  );
}
