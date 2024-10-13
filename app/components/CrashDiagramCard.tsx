import React, { useState } from "react";
import { Card, Image, Alert } from "react-bootstrap";
import { Crash } from "@/types/types";

// import axios from "axios";
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const CR3_DIAGRAM_BASE_URL = process.env.NEXT_PUBLIC_CR3_DIAGRAM_BASE_URL!;

export default function CrashDiagramCard({ crash }: { crash: Crash }) {
  const [diagramError, setDiagramError] = useState(false);

  return (
    <Card>
      <Card.Header>Crash Diagram</Card.Header>
      <Card.Body className="crash-header-card-body text-center">
        {!diagramError && (
          <Image
            fluid
            style={{
              height: "100%",
              maxWidth: "100%",
            }}
            src={`${CR3_DIAGRAM_BASE_URL}/${crash.record_locator}.jpeg`}
            alt="crash diagram"
            onError={() => {
              console.error("Error loading CR3 diagram image");
              setDiagramError(true);
            }}
          />
        )}
        {diagramError && crash.is_temp_record && (
          <Alert variant="info">
            <i className="fa fa-info-circle" /> Crash diagrams are not available
            for user-created crash records
          </Alert>
        )}
        {diagramError && !crash.is_temp_record && (
          <Alert variant="danger">
            <p>
              The crash diagram is not available. Typically, this indicates
              there was an error when processing this crash's CR3 PDF.
            </p>
            <p>
              For additional assistance, you can&nbsp;
              <a
                href="https://atd.knack.com/dts#new-service-request/?view_249_vars=%7B%22field_398%22%3A%22Bug%20Report%20%E2%80%94%20Something%20is%20not%20working%22%2C%22field_399%22%3A%22Vision%20Zero%20Editor%22%7D"
                target="_blank"
                rel="noopener noreferrer"
              >
                report a bug
                <i className="fa fa-external-link"></i>
              </a>
              .
            </p>
          </Alert>
        )}
      </Card.Body>
      <Card.Footer>Something else here</Card.Footer>
    </Card>
  );
}
