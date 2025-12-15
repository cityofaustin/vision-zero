import { useState } from "react";
import { Form, Nav, Tab } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaFilePdf } from "react-icons/fa6";
import AlignedLabel from "@/components/AlignedLabel";
import { onDownloadCR3 } from "@/components/CrashNarrativeCard";
import { UPDATE_CRASH } from "@/queries/crash";
import { Crash } from "@/types/crashes";
import { hasRole, useGetToken } from "@/utils/auth";
import { useMutation } from "@/utils/graphql";
import { useAuth0 } from "@auth0/auth0-react";

interface CrashNarrativeEditableCardProps {
  crash: Crash;
  onSaveCallback: () => Promise<void>;
}

type CrashNarrativeSummaryInputs = {
  narrative_summary: string;
};

/**
 * Card component that renders the crash narrative and a download CR3 button, along with editing capabilities
 * that allows users to save a summary of the narrative.
 */
export default function CrashNarrativeEditableCard({
  crash,
  onSaveCallback,
}: CrashNarrativeEditableCardProps) {
  const hasSummary = !!crash.narrative_summary;

  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState(
    hasSummary ? "summary" : "narrative"
  );

  const { user } = useAuth0();

  const isReadOnlyUser = user && hasRole(["readonly"], user);

  const { mutate, loading: isSubmitting } = useMutation(UPDATE_CRASH);

  const { register, handleSubmit, reset } =
    useForm<CrashNarrativeSummaryInputs>();

  const getToken = useGetToken();

  const isCr3Stored = crash.cr3_stored_fl;

  /**
   * Submits mutation to database on save button click
   */
  const onSubmit: SubmitHandler<CrashNarrativeSummaryInputs> = async (data) => {
    await mutate({
      id: crash.id,
      updates: data,
    });
    await onSaveCallback();
    setIsEditingSummary(false);
    // change back to narrative tab if user cleared out the summary
    setActiveTab(data.narrative_summary === null ? "narrative" : "summary");
  };

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
            {(hasSummary || isEditingSummary) && (
              <Nav.Item>
                <Nav.Link eventKey="summary">Summary</Nav.Link>
              </Nav.Item>
            )}
          </Nav>
          <Button
            size="sm"
            onClick={() => onDownloadCR3({ crash, getToken })}
            disabled={!isCr3Stored}
          >
            <AlignedLabel>
              <FaFilePdf className="me-2" />
              <span>Download CR3</span>
            </AlignedLabel>
          </Button>
        </Card.Header>
        <Card.Body className="crash-header-card-body">
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
                      rows={17}
                      autoFocus
                      {...register("narrative_summary", {
                        setValueAs: (value) => value.trim() || null, // save empty strings as null
                      })}
                    />
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
                  setActiveTab(hasSummary ? "summary" : "narrative");
                  reset();
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            !isReadOnlyUser && (
              <Button
                size="sm"
                onClick={() => {
                  setIsEditingSummary(true);
                  setActiveTab("summary");
                }}
              >
                {hasSummary ? "Edit summary" : "Add summary"}
              </Button>
            )
          )}
        </Card.Footer>
      </Tab.Container>
    </Card>
  );
}
